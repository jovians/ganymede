/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as axios from 'axios';

export interface WavefrontInventory {
  [entryName: string]: WavefrontEntry;
}

export class WavefrontEntry {
  endpoint: string;
  accessInventory: {[accessName: string]: WavefrontAccess} = {};
  constructor(init?: Partial<WavefrontEntry>) {
    if (init) { Object.assign(this, init); }
  }
  setAccess(accessData: Partial<WavefrontAccess>) {
    accessData.endpoint = this.endpoint;
    const access = new WavefrontAccess(accessData);
    this.accessInventory[accessData.name] = access;
    return access;
  }
  getAccess(acessName: string) {
    return this.accessInventory[acessName];
  }
}

export class WavefrontAccess {
  name: string;
  endpoint: string;
  token: string;
  useProxy: boolean = true;
  constructor(init?: Partial<WavefrontAccess>) {
    if (init) { Object.assign(this, init); }
  }
  async getChartData(opts: WavefrontChartQueryOptions) {
    const now = Date.now(); // milisec
    const oneHourInMs = 3600 * 1000;

    let end = opts.end;
    if (!end) { end = now; } // if undefined, timestamp now
    if (end > now) { end = now; } // doesn't make sense to query future

    let start = opts.start;
    if (!start) { start = end - 2 * oneHourInMs; } // default (2h ago ~ now)
    if (end <= start) { start = end - 2 * oneHourInMs; } // doesn't make sense start time is greater than end

    // This is important; it tells what kind of points aggregation (default MEAN)
    let summarization = opts.summarization; // MEAN | MEDIAN | MIN | MAX | SUM | COUNT | LAST | FIRST
    if (!summarization) { summarization = WavefrontSummarization.LAST; }

    // This is important; metric or histogram? (default METRIC)
    let view = opts.view; // METRIC | HISTOGRAM
    if (!view) { view = 'METRIC'; }

    // Granularity; requester should have no control; only calculated from timespan.
    // This also prevents requester trying to get large dataset from manupulating granularity
    // and timespan of the query. Points can further truncated on Wavefront server by supplying `p` param
    const timespan = Math.floor((end - start) / 1000); // in seconds
    let granularity = 'm';
    if (timespan <= 1800) {
      granularity = 's';  // 300 min or lower (max 1800 points returned)
    } else if (timespan <= 7200) {
      granularity = 'm';  // 2 hour or lower (30 ~ 240 points returned)
    } else if (timespan < 2592000) {
      granularity = 'h';  // under 30 days (24 ~ 720 points returned)
    } else {
      granularity = 'd';  // min 30 points, for long-term view
    }

    const maxPointsPerSeries = 100; // NOT EXACT; expect plus minus 50%.

    const params: any = {
      q: opts.queryString, // query
      g: granularity, // granularity
      s: start, // start time
      e: end, // end time
      p: maxPointsPerSeries, // limit 100 data points per series.
      view, // METRIC | HISTOGRAM
      summarization, // MEAN | MEDIAN | MIN | MAX | SUM | COUNT | LAST | FIRST
      strict: 'true' // important; only return points within timespan
    };

    let finalUrl;
    const targetUrl = `${this.endpoint}/api/v2/chart/api`;
    const method = 'GET';
    if (this.useProxy) {
      params.__url = targetUrl;
      params.__method = method;
      params.__headers = 'Authorization';
      finalUrl = '/api/v1/proxy-request';
    } else {
      finalUrl = targetUrl;
    }
    const reqOpts: any = {
      timeout: 7000,
      headers: { Authorization: `Bearer ${this.token}` },
      params,
    };
    const res = await axios.default.get(finalUrl, reqOpts);
    return normalizeWavefrontTimeSeries(res.data?.result, opts.shownTags);
  }
}

export enum WavefrontSummarization {
  MEAN = 'MEAN',
  MEDIAN = 'MEDIAN',
  MIN = 'MIN',
  MAX = 'MAX',
  SUM = 'SUM',
  COUNT = 'COUNT',
  LAST = 'LAST',
  FIRST = 'FIRST',
}

export interface WavefrontChartQueryOptions {
  queryString: string;
  shownTags?: string[];
  tagFilfer?: (data) => string;
  start?: number;
  end?: number;
  summarization?: WavefrontSummarization;
  view?: 'METRIC' | 'HISTOGRAM' | string;
}

export function normalizeWavefrontTimeSeries(data, shownTags: string[] = ['host']) {
  if (!data.timeseries) { data.timeseries = []; }
  data.shownTags = shownTags;
  for (const series of data.timeseries) {
    series.name = 'test';
    series.series = [];
    const shownTagsMap = {};
    const shownTagsValues = [];
    for (const shownTag of shownTags) {
      if (shownTag === 'host') {
        shownTagsMap[shownTag] = series.host;
      } else {
        shownTagsMap[shownTag] = series.tags[shownTag] ? series.tags[shownTag] : '';
      }
      shownTagsValues.push(shownTagsMap[shownTag]);
    }
    for (const datapoint of series.data) {
      series.series.push({
        name: new Date(datapoint[0] * 1000),
        label: series.label,
        value: datapoint[1],
        shownTagsMap,
        shownTags,
        shownTagsValues,
        allTags: series.tags,
      });
    }
  }
  return data;
}
