/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { ExtNativeInfraService } from '../../shared/ext-native-infra.service';
import { AppService, rx } from '../../../../../../../components/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteObservingService } from 'src/app/ganymede/components/services/route-observing.service';
import { bindSub, completeConfig } from '../../../../../../../components/util/shared/common';
import { SwimlaneTimeseriesGraphConfig } from 'src/app/ganymede/components/metrics/swimlane/swimlane-timeseries-graph-content/swimlane-timeseries-graph-content';

const baseGraphConfig = {
  yScaleMin: 0,
  yScaleMax: 100,
};

@Component({
  selector: 'gany-ext-native-infra-vcenter',
  templateUrl: './ext-native-infra-vcenter.component.html',
  styleUrls: ['./ext-native-infra-vcenter.component.scss']
})
export class ExtNativeInfraVcenterComponent extends ix.Entity implements OnInit, OnDestroy, OnChanges {

  @Input() key = '';
  vcenter = ExtNativeInfraService.skel?.ds?.vcenter;
  timeStart = Date.now() - (3600 * 2 * 1000);
  timeEnd = Date.now();
  quickStatsLast = 0;
  quickStatsData = null;
  quickStatsGraphData = null;
  vCenterList = this.app.extensions.native.infra.inventory.vcenter.list;
  vCenterMap = {};
  vCenter = null;
  basePath = `/${this.routeObs.routeData.pageData.path}/vcenter/`;
  currentKey = null;
  currentTab = this.getCurrentTabName();
  graphConfigs = {
    cpu: new SwimlaneTimeseriesGraphConfig(completeConfig(baseGraphConfig, { title: 'CPU'})),
    mem: new SwimlaneTimeseriesGraphConfig(completeConfig(baseGraphConfig, { title: 'MEM'})),
    disk: new SwimlaneTimeseriesGraphConfig(completeConfig(baseGraphConfig, { title: 'DISK'})),
  };

  constructor(
    public app: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private routeObs: RouteObservingService,
    private infraService: ExtNativeInfraService,
  ) {
    super('ext-native-infra-vcenter');
    this.vcenter = this.app.store.extInfra.vcenter;
    for (const info of this.vCenterList) {
      this.vCenterMap[info.key] = info;
    }
    bindSub(this, routeObs.eventRouteChange, url => {
      if (!url.startsWith(this.basePath)) { return; }
      this.getCurrentTabName();
    });
  }

  ngOnInit() {
    this.hydrate();
    const qs = this.vcenter.quickStats;
    qs.sub(this, data => {
      if (!data[this.key] || !qs.meta[this.key]) { return; }
      if (this.quickStatsLast < qs.meta[this.key].lastFetched) {
        this.quickStatsLast = qs.meta[this.key].lastFetched;
        this.quickStatsData = data[this.key];
        this.quickStatsGraphData = this.extractGraphData(this.quickStatsData);
      }
    });
  }
  ngOnDestroy() { autoUnsub(this); this.destroy(); }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'key': {
          this.hydrate();
        }
      }
    }
  }

  hydrate(nocache = false) {
    if (!this.key) { return; }
    this.vCenter = this.vCenterMap[this.key];
    if (ix.hbi(this, 'hydrate').passed) {
      rx.invoke(this.vcenter.quickStats.actions.FETCH, { key: this.key, nocache });
      rx.invoke(this.vcenter.allObjects.actions.FETCH, { key: this.key, nocache });
    }
  }

  getCurrentTabName() {
    const basepath = `/${this.routeObs.routeData.pageData.path}/vcenter/`;
    const paths = this.router.url.split(basepath)[1].split('/');
    const tabName =  paths[1] ? paths[1] : 'summary';
    this.currentKey = paths[0];
    this.currentTab = tabName;
    return tabName;
  }

  tabSelect(targetTabName: string) {
    const currentTab = this.getCurrentTabName();
    if (currentTab === targetTabName) { return; }
    if (targetTabName === 'summary' && currentTab !== 'summary') {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      if (currentTab === 'summary') {
        this.router.navigate([targetTabName], { relativeTo: this.route });
      } else {
        this.router.navigate([`../${targetTabName}`], { relativeTo: this.route });
      }
    }
  }

  dataFetcherCpu = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.cpu); });
  dataFetcherMem = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.mem); });
  dataFetcherDisk = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.disk); });

  extractGraphData(qsData) {
    const shownTags = ['metric'];
    const serieses = [];
    const newSeries = (kind: string, index: number) => {
      const seriesData = {
        index,
        name: kind,
        series: [],
        shownTagsMap: { metric: kind },
        shownTagsValues: [kind],
      };
      serieses.push(seriesData);
      return seriesData;
    };
    const data = {
      cpu: { shownTags, timeseries: [ newSeries('cpu', 3) ] },
      mem: { shownTags, timeseries: [ newSeries('mem', 4) ] },
      disk: { shownTags, timeseries: [ newSeries('disk', 5) ] },
    };
    let baseTime = Math.floor(Date.now() / 1000) - (Math.floor(Date.now() / 1000) % 86400);
    let hasLooped = false;
    let prevTime = -1;
    let i = 0;
    let loopIndex = -1;
    for (const datapoint of qsData.history) {
      const t = datapoint[0];
      if (prevTime === -1) { prevTime = t; ++i; continue; }
      if (t < prevTime) { loopIndex = i; hasLooped = true; baseTime -= 86400; break; }
      prevTime = t;
      ++i;
    }
    i = 0;
    for (const datapoint of qsData.history) {
      if (i === loopIndex) { baseTime += 86400; }
      const ts = (baseTime + datapoint[0]) * 1000;
      for (const seriesData of serieses) {
        if (datapoint[seriesData.index] === null) { continue; }
        seriesData.series.push({
          ts,
          name: new Date(ts),
          shownTags,
          shownTagsMap: seriesData.shownTagsMap,
          shownTagsValues: seriesData.shownTagsValues,
          value: datapoint[seriesData.index],
        });
      }
      ++i;
    }
    return data;
  }

}
