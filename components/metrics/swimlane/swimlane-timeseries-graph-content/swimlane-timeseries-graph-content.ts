/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { v4 as uuidv4 } from 'uuid';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, ViewChild, OnDestroy } from '@angular/core';
import { getDateString, getDateYearString, getTimeDateString, getTimeString } from '../../../util/shared/time/time.formats';
import { SizeUtil } from '../../../util/common/size.util';
import { DomTreeUtil } from '../../../util/common/dom.tree.util';
import { completeConfigDirectly } from '../../../util/shared/common';
import { namedCurves } from '../d3.curves.map';
import { ix } from 'ts-comply';

export const oneHour = 3600 * 1000;
export const oneDay = 24 * oneHour;
export const twoDays = 2 * oneDay;
export const oneMonth = 30 * oneDay;
export const timeStartDefaultAgo = 2 * oneHour;

export class SwimlaneTimeseriesGraphConfig {
  static defaultConfig: Partial<SwimlaneTimeseriesGraphConfig> = {
    target: {
      shownTags: [],
    },
    valueName: 'value',
    title: '',
    description: '',
    view: [100, 100],
    showGridLines: true,
    legend: false,
    showLabels: true,
    animations: true,
    xAxis: true,
    yAxis: true,
    showYAxisLabel: false,
    showXAxisLabel: false,
    autoScale: false,
    yScaleMin: null,
    yScaleMax: null,
    xAxisLabel: '',
    yAxisLabel: '',
    timeline: false,
    animation: false,
    curveName: 'd3-monotone-x',
    colorScheme: { domain: ['rgba(140,140,140,0.25)'] },
    colorSeries: ['#FF8A80', '#EA80FC', '#8C9EFF'],
    pointMarkers: { enabled: false, radius: 10 },
    offset: { top: 2, left: 8, right: 8, bottom: 4 },
  };

  target?: {
    shownTags?: string[];
  };
  valueName?: string;
  title?: string;
  description?: string;
  view?: number[];
  showGridLines?: boolean;
  legend?: boolean;
  showLabels?: boolean;
  animations?: boolean;
  xAxis?: boolean;
  yAxis?: boolean;
  showYAxisLabel?: boolean;
  showXAxisLabel?: boolean;
  autoScale?: boolean;
  yScaleMin?: number;
  yScaleMax?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  timeline?: boolean;
  animation?: boolean;
  curveName?: string;
  colorScheme?: { domain?: string[] };
  colorSeries?: string[];
  pointMarkers?: { enabled?: boolean; radius?: number; };
  offset?: { top?: number; left?: number; right?: number; bottom?: number };

  constructor(init?: Partial<SwimlaneTimeseriesGraphConfig>) {
    if (init) { Object.assign(this, init); }
    completeConfigDirectly(this, SwimlaneTimeseriesGraphConfig.defaultConfig);
  }
}


interface DataFetchArgs {
  timeStart: number;
  timeEnd: number;
}

interface DataFetchResult {
  timeseries: any[];
  shownTags?: any[];
}

@Component({
  selector: 'swimlane-timeseries-graph-content',
  templateUrl: './swimlane-timeseries-graph-content.html',
  styleUrls: ['./swimlane-timeseries-graph-content.scss']
})
export class SwimlaneTimeseriesGraphContent extends ix.Entity implements OnInit, OnChanges, OnDestroy {

  @Input() graphConfig = new SwimlaneTimeseriesGraphConfig();
  @Input() timeStart = Date.now() - timeStartDefaultAgo; // UNIX TS, miliseconds
  @Input() timeEnd = Date.now(); // UNIX TS, miliseconds
  @Input() dataFetcher: (arg: DataFetchArgs) => Promise<DataFetchResult> = null;
  @Input() onupdate: (graphData: any) => void = null;
  @Input() updateTrigger = -1;
  @Input() hidden = false;
  @Input() timeSpans = ['5m', '30m', '2h', '1d', '8d'];
  @Input() timeSpansEnabled = true;
  @Input() showLoading = false;

  @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;
  @ViewChild('timeSpanPick', { static: true }) timeSpanPick: ElementRef;
  @ViewChild('titleDiv', { static: true }) titleDiv: ElementRef;
  @ViewChild('descriptionDiv', { static: true }) descriptionDiv: ElementRef;

  id = uuidv4();
  graphData;
  selectedTimeSpan = null;
  timeStartSaved = Date.now() - timeStartDefaultAgo;
  timeEndSaved = Date.now();
  fetchDataCalled = false;
  dataLoaded: boolean = false;
  noData: boolean = false;
  curves = namedCurves;

  constructor(private host: ElementRef) {
    super('swimlane-timeseries-graph-content');
  }

  ngOnInit() {
    const cont = this.chartContainer.nativeElement;
    // const chartArea = this.chartArea.nativeElement;
    cont.component = this;
    // cont.style.opacity = 0.01;
    const hostCont = DomTreeUtil.containerElementOf(this.host);
    SizeUtil.linkDimension(this, hostCont, dim => {
      let w = dim.width - 1;
      if (this.graphConfig?.offset?.left) { w -= this.graphConfig?.offset?.left; }
      if (this.graphConfig?.offset?.right) { w -= this.graphConfig?.offset?.right; }
      let h = dim.height - 28;
      if (this.graphConfig?.offset?.top) { h -= this.graphConfig?.offset?.top; }
      if (this.graphConfig?.offset?.bottom) { h -= this.graphConfig?.offset?.bottom; }
      if (w <= 1 || h <= 1) { return; }
      cont.style.opacity = 1;
      this.graphConfig.view = [w, h];
      if (this.chartContainer) {
        this.chartContainer.nativeElement.style.marginLeft = this.graphConfig.offset.left + 'px';
        this.chartContainer.nativeElement.style.marginTop = this.graphConfig.offset.top + 'px';
      }
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

  getTooltipContainer() {
    return document.getElementById(`swimlane-tooltip-container-${this.id}`);
  }

  getSeriesTooltipContainer() {
    return document.getElementById(`swimlane-series-tooltip-container-${this.id}`);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.timeEnd) {
      this.timeEndSaved = changes.timeEnd.currentValue;
      if (!this.timeEndSaved) { this.timeEndSaved = Date.now(); }
    }
    if (changes.timeStart) {
      this.timeStartSaved = changes.timeStart.currentValue;
      if (!this.timeStartSaved) { this.timeStartSaved = this.timeEndSaved - timeStartDefaultAgo; }
    }
    if (changes.timeStart || changes.timeEnd) {
      if (this.selectedTimeSpan) {
        this.selectedTimeSpan.classList.remove('timespan-pick-button-selected');
        this.selectedTimeSpan = null;
      }
      if (this.timeSpanPick) {
        this.timeSpanPick.nativeElement.setAttribute('timespan', '');
      }
      this.fetchDataOneFrame();
    }
    if (changes.updateTrigger) {
      this.fetchDataOneFrame();
    }
    if (changes.graphConfig) {
      this.loadConfig(changes.graphConfig.currentValue);
    }
    if (changes.hidden) {
      try {
        if (changes.hidden.currentValue) {
          this.chartContainer.nativeElement.classList.add('hidden');
        } else {
          this.chartContainer.nativeElement.classList.remove('hidden');
        }
      } catch (e) {}
    }
  }

  loadConfig(config) {
    completeConfigDirectly(config, SwimlaneTimeseriesGraphConfig.defaultConfig);
    this.overrideStyle(this.chartContainer, config.containerStyle);
    this.overrideStyle(this.titleDiv, config.titleStyle);
    this.overrideStyle(this.descriptionDiv, config.descriptionStyle);
  }

  fetchDataOneFrame() {
    if (this.fetchDataCalled) { return; }
    this.fetchDataCalled = true;
    this.dataLoaded = false;
    setTimeout(() => {
      this.fetchDataCalled = false;
      this.fetchData();
    }, 10);
  }

  seriesStyling() {
    if (!this.chartContainer) { return; }
    let index = 0;
    const svg = this.chartContainer.nativeElement.getElementsByTagName('svg');
    const svgDefs = svg[0].getElementsByTagName('defs')[0];
    while (svgDefs.children.length > 1) { svgDefs.removeChild(svgDefs.lastChild); }
    const seriesList = this.chartContainer.nativeElement.getElementsByClassName('line-series');
    for (const seriesElement of seriesList) {
        const seriesRoot = seriesElement.parentElement.parentElement.parentElement;
        const seriesColor = this.graphConfig.colorSeries[index];
        const pathElement = seriesElement.getElementsByTagName('path')[0];
        const pathAttributes = {
            'marker-start': `url(#dot${index})`,
            'marker-mid': `url(#dot${index})`,
            'marker-end': `url(#dot${index})`,
        };
        if (this.graphConfig.pointMarkers.enabled) {
          this.seriesMarker(svgDefs, index, seriesColor);
        }
        for (const attr of Object.keys(pathAttributes)) {
          pathElement.setAttribute(attr, pathAttributes[attr]);
        }
        pathElement.style.stroke = seriesColor;
        index += 1;
    }
  }

  seriesMarker(svgDefs, index: number, color: string) {
    const svgNS = 'http://www.w3.org/2000/svg';
    const marker = document.createElementNS(svgNS, 'marker');
    const circle = document.createElementNS(svgNS, 'circle');
    svgDefs.append(marker);
    marker.append(circle);
    const radius = this.graphConfig.pointMarkers.radius;
    const markerAttributes = {
        id: `dot${index}`,
        viewBox: `0 0 ${radius * 2} ${radius * 2}`,
        refX: radius, refY: radius,
        markerWidth: radius, markerHeight: radius,
    };
    const circleAttributes = { cx: radius, cy: radius, r: radius, fill: color };
    marker.append(circle);
    for (const markerAttr of Object.keys(markerAttributes)) {
      marker.setAttribute(markerAttr, markerAttributes[markerAttr]);
    }
    for (const colorAttr of Object.keys(circleAttributes)) {
      circle.setAttribute(colorAttr, circleAttributes[colorAttr]);
    }
  }

  dateTickFormatting(val) {
    const xAxisTickElement = this as any;
    if (!xAxisTickElement.chartContainer && xAxisTickElement.ticksElement) {
      let el = xAxisTickElement.ticksElement.nativeElement;
      // tslint:disable-next-line: no-conditional-assignment
      while ((el = el.parentElement) && !el.classList.contains('chart-container')) {}
      xAxisTickElement.chartContainer = el;
    }
    // tslint:disable-next-line: variable-name
    const _this = (xAxisTickElement.chartContainer && xAxisTickElement.chartContainer.component) ?
                  xAxisTickElement.chartContainer.component : {};
    const diff = _this.timeEnd - _this.timeStart;
    if (val instanceof Date) {
      const d: Date = val;
      if (diff < oneDay) {
        return getTimeString(d);
      } else if (diff < twoDays) {
        return getTimeDateString(d);
      } else if (diff <= oneMonth) {
        return getDateString(d);
      } else {
        return getDateYearString(d);
      }
    }
  }

  valueSort(model) {
    return model.sort((a, b) => (b.value - a.value));
  }

  trimValue(v) {
    return parseFloat(v + '').toFixed(2);
  }

  applyToolTipColor(color, index = -1) {
    if (index >= 0) {
      color = this.graphConfig.colorSeries[index];
    }
    return {
      'background-color': color,
      border: '1px solid ' + color
    };
  }

  timeSpanOverride(span, event) {
    const target = event.target || event.srcElement || event.currentTarget;
    if (this.selectedTimeSpan && this.selectedTimeSpan.span === span) {
      this.timeSpanPick.nativeElement.setAttribute('timespan', '');
      if (this.selectedTimeSpan) { this.selectedTimeSpan.classList.remove('timespan-pick-button-selected'); }
      this.selectedTimeSpan = null;
      this.timeStart = this.timeStartSaved;
      this.timeEnd = this.timeEndSaved;
    } else {
      target.classList.add('timespan-pick-button-selected');
      target.span = span;
      if (this.selectedTimeSpan) { this.selectedTimeSpan.classList.remove('timespan-pick-button-selected'); }
      this.selectedTimeSpan = target;
      this.timeSpanPick.nativeElement.setAttribute('timespan', 'true');
      const now = Date.now();
      this.timeEnd = now;
      switch (span) {
        case '5m': this.timeStart = now - (1 / 12) * oneHour; break;
        case '30m': this.timeStart = now - (1 / 2) * oneHour; break;
        case '2h': this.timeStart = now - 2 * oneHour; break;
        case '1d': this.timeStart = now - 24 * oneHour; break;
        case '8d': this.timeStart = now - 8 * 24 * oneHour; break;
        case '1mo': this.timeStart = now - 30 * 24 * oneHour; break;
        case '4mo': this.timeStart = now - 121 * 24 * oneHour; break;
        case '1yr': this.timeStart = now - 365 * 24 * oneHour; break;
      }
    }
    this.fetchDataOneFrame();
  }

  /** Place holder for later advanced chart event handling */
  onSelect(data): void { data = undefined; return data; }
  onActivate(data): void { data = undefined; return data; }
  onDeactivate(data): void { data = undefined; return data; }

  nameResolve(name: Date): string {
    return `[ ${name.toLocaleTimeString()} ] - ${name}`;
  }

  private async fetchData() {
    if (!this.dataFetcher) { return; }
    const data = await Promise.resolve(
      await Promise.resolve(
        this.dataFetcher({
          timeStart: this.timeStart,
          timeEnd: this.timeEnd,
        })
      )
    );
    this.graphConfig.target.shownTags = data.shownTags;
    if (!data || !data.timeseries) { return; }
    this.dataLoaded = true;
    let hasData = false;
    for (const seriesData of data.timeseries) {
      if (seriesData.series.length > 0) { hasData = true; break; }
    }
    if (!hasData) { this.noData = true; this.graphData = null; return; }
    this.noData = false;
    this.graphData = data.timeseries;
    if (this.onupdate) { this.onupdate(this.graphData); }
    const checker = setInterval(() => {
      if (this.showLoading) { return; }
      this.seriesStyling();
      clearInterval(checker);
    }, 100);
  }

  private overrideStyle(elRef, overrideValues) {
    if (elRef && overrideValues) {
      for (const styleName of Object.keys(overrideValues)) {
        const styleValue = overrideValues[styleName];
        elRef.nativeElement.style[styleName] = styleValue;
      }
    }
  }

}
