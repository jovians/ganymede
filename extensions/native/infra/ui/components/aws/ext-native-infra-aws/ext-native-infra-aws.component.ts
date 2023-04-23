import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { ExtNativeInfraService } from '../../../services/ext-native-infra.service';
import { AppService, rx } from 'src/app/ganymede/components/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { autoUnsub, ix } from 'ts-comply';
import { RouteObservingService } from 'src/app/ganymede/components/services/route-observing.service';
import { bindSub } from 'src/app/ganymede/components/util/shared/common';
import { AwsRegionInfo, defaultRegionInfo, regionGroupName } from '../models/aws-regions';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';

@Component({
  selector: 'gany-ext-native-infra-aws',
  templateUrl: './ext-native-infra-aws.component.html',
  styleUrls: ['./ext-native-infra-aws.component.scss']
})
export class ExtNativeInfraAwsComponent extends ix.Entity implements OnInit, OnDestroy, OnChanges {
  @Input() key = '';
  aws = ExtNativeInfraService.skel?.ds?.aws;
  awsInfo = {};
  awsList = this.app.extensions.native.infra.inventory.aws.list;
  awsMap = {};

  timeStart = Date.now() - (3600 * 2 * 1000);
  timeEnd = Date.now();
  quickStatsLast = 0;
  quickStatsData = null;
  quickStatsGraphData = null;
  quickStatsShowLoading = true;
  dataLoading = false;

  tabActiveState = {
    summary: false,
    ec2: false,
  };
  currentRegion = '';
  currentKey = null;
  currentTab = this.getCurrentTabName();
  tabParam = 'tab';
  tabParamDefault = 'summary';
  basePath = `/${this.routeObs.routeData.pageData.path}/aws/`;

  regionsInfo: typeof defaultRegionInfo;
  regionsGroup: {[group: string]: (AwsRegionInfo)[]; } = {};
  regionGroupName = regionGroupName;

  Unit = Unit;

  constructor(
    public app: AppService,
    public infra: ExtNativeInfraService,
    private route: ActivatedRoute,
    private router: Router,
    private routeObs: RouteObservingService,
  ) {
    super('ext-native-infra-aws');
    this.aws = this.app.store.extInfra.aws;
    this.regionsInfo = JSON.parse(JSON.stringify(defaultRegionInfo));
    for (const regionKey of Object.keys(this.regionsInfo)) {
      if (regionKey === 'global') { continue; }
      const info = this.regionsInfo[regionKey];
      if (!this.regionsGroup[info.customGroup]) { this.regionsGroup[info.customGroup] = []; }
      info.customGroupName = regionGroupName[info.customGroup];
      info.regionSwitchAction = this.regionSwitch(regionKey);
      this.regionsGroup[info.customGroup].push(info);
    }
    for (const info of this.awsList) {
      this.awsMap[info.key] = info;
    }
    bindSub(this, routeObs.eventRouteChange, url => {
      if (!url.startsWith(this.basePath)) { return; }
      // this.getCurrentTabName();
    });
    bindSub(this, route.queryParams, params => {
      if (params[this.tabParam]) {
        if (this.tabActiveState[this.tabParam] === null) {
          console.error(new Error(`unrecognized tab view name '${params[this.tabParam]}'`));
          return;
        }
        this.tabActiveState[params[this.tabParam]] = true;
      } else {
        this.tabActiveState[this.tabParamDefault] = true;
      }
      if (params.view) {
        const changed = params.view !== this.currentRegion;
        this.currentRegion = params.view;
        if (changed) { this.hydrateRegional(true); }
      } else {
        this.currentRegion = 'global';
        this.hydrateRegional(true);
      }
    });
  }

  ngOnInit() {
    this.hydrate();
    const keyGetter = () => this.key;
    this.aws.quickStats.keySub(this, keyGetter, (member, meta) => {
      this.dataLoading = false;
      if (this.quickStatsLast < meta.lastFetched) {
        for (const regionKey of Object.keys(this.regionsInfo)) {
          if (regionKey === 'global') { continue; }
          const info = this.regionsInfo[regionKey];
          info.disabled = member.serviceRegions.indexOf(regionKey) === -1;
        }
        for (const regionKey of Object.keys(this.regionsGroup)) {
          if (regionKey === 'global') { continue; }
          this.regionsGroup[regionKey].sort((a, b) => b.disabled ? -1 : 0);
        }
        this.quickStatsLast = meta.lastFetched;
        // this.quickStatsData = member;
        // this.quickStatsGraphData = this.extractGraphData(this.quickStatsData);
        this.quickStatsShowLoading = false;
      }
    });
    const regionalKeyGetter = () => JSON.stringify({ key: this.key, region: this.currentRegion });
    this.aws.quickStatsRegional.keySub(this, regionalKeyGetter, (member, meta) => {
      this.quickStatsData = member;
      // console.log(member, meta);
      // this.dataLoading = false;
      // if (this.quickStatsLast < meta.lastFetched) {
      //   for (const regionKey of Object.keys(this.regionsInfo)) {
      //     if (regionKey === 'global') { continue; }
      //     const info = this.regionsInfo[regionKey];
      //     info.disabled = member.serviceRegions.indexOf(regionKey) === -1;
      //   }
      //   for (const regionKey of Object.keys(this.regionsGroup)) {
      //     if (regionKey === 'global') { continue; }
      //     this.regionsGroup[regionKey].sort((a, b) => b.disabled ? -1 : 0);
      //   }
      //   this.quickStatsLast = meta.lastFetched;
      //   this.quickStatsData = member;
      //   // this.quickStatsGraphData = this.extractGraphData(this.quickStatsData);
      //   this.quickStatsShowLoading = false;
      // }
    });
    // this.aws.allObjects.keySub(this, keyGetter, member => {
    //   this.extractInventoryStubs(member);
    // });
  }


  ngOnDestroy() {
    autoUnsub(this);
    this.destroy();
  }

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
    this.awsInfo = this.awsMap[this.key];
    if (ix.hotblock(this, 'hydrate', 9, 9).passed || !this.dataLoading) {
      this.dataLoading = true;
      rx.invoke(this.aws.quickStats.actions.FETCH, { key: this.key, nocache });
      rx.invoke(this.aws.quickStatsRegional.actions.FETCH, { key: { key: this.key, region: this.currentRegion }, nocache });
      // rx.invoke(this.vcenter.allObjects.actions.FETCH, { key: this.key, nocache });
    }
  }

  hydrateRegional(nocache = false) {
    if (!this.key || !this.currentRegion) { return; }
    rx.invoke(this.aws.quickStatsRegional.actions.FETCH, { key: { key: this.key, region: this.currentRegion }, nocache });
  }

  getCurrentTabName() {
    const basepath = `/${this.routeObs.routeData.pageData.path}/aws/`;
    const paths = this.router.url.split(basepath)[1].split('/');
    const tabName =  paths[1] ? paths[1] : '';
    this.currentKey = paths[0];
    this.currentTab = tabName;
    return tabName;
  }

  tabSelect(targetTabName: string) {
    if (targetTabName === this.tabParamDefault) { targetTabName = undefined; }
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { [this.tabParam]: targetTabName }, queryParamsHandling: 'merge' });
  }

  getRegionName(region: string) {
    this.regionsInfo[region]
  }

  regionSwitch(region: string) {
    if (region === 'global') {
      return () => {
        console.log(region, this.currentRegion);
        if (this.currentRegion === region) { return; }
        this.router.navigate(['.'], { relativeTo: this.route, queryParams: { view: undefined }, queryParamsHandling: 'merge'});  
      };
    } else {
      return () => {
        console.log(region, this.currentRegion);
        if (this.currentRegion === region) { return; }
        this.router.navigate(['.'], { relativeTo: this.route, queryParams: { view: region }, queryParamsHandling: 'merge'});
      };
    }
  }

}
