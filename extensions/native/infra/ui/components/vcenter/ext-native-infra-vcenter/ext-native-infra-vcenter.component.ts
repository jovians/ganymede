/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { ExtNativeInfraService } from '../../shared/ext-native-infra.service';
import { AppService, rx } from '../../../../../../../components/services/app.service';
import { ActivatedRoute, Router } from '@angular/router';
import { RouteObservingService } from '../../../../../../../components/services/route-observing.service';
import { bindSub, completeConfig } from '../../../../../../../components/util/shared/common';
import { SwimlaneTimeseriesGraphConfig } from '../../../../../../../components/metrics/swimlane/swimlane-timeseries-graph-content/swimlane-timeseries-graph-content';
import { VcenterInventoryStubDatacenter, VcenterInventoryStubNode, VcenterInventoryStubsData } from '../vcenter.models';

const baseGraphConfig: Partial<SwimlaneTimeseriesGraphConfig> = {
  yScaleMin: 0,
  yScaleMax: 100,
};

const countsGraphConfig: Partial<SwimlaneTimeseriesGraphConfig> = {
  yScaleMin: 0,
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
  dataLoading = false;
  vCenterList = this.app.extensions.native.infra.inventory.vcenter.list;
  vCenterMap = {};
  vCenter = null;
  basePath = `/${this.routeObs.routeData.pageData.path}/vcenter/`;
  currentKey = null;
  currentTab = this.getCurrentTabName();
  tabActiveState = {
    summary: false,
    hosts: false,
    vms: false,
    datastores: false,
    networks: false,
  };
  graphConfigs = {
    cpu: new SwimlaneTimeseriesGraphConfig(completeConfig(baseGraphConfig, { title: 'CPU' })),
    mem: new SwimlaneTimeseriesGraphConfig(completeConfig(baseGraphConfig, { title: 'MEM' })),
    disk: new SwimlaneTimeseriesGraphConfig(completeConfig(baseGraphConfig, { title: 'DISK' })),
    hostCount: new SwimlaneTimeseriesGraphConfig(completeConfig(countsGraphConfig, { title: 'HOST COUNT' })),
    vmCount: new SwimlaneTimeseriesGraphConfig(completeConfig(countsGraphConfig, { title: 'VM COUNT' })),
  };
  inventoryStubs: VcenterInventoryStubsData = this.newEmptyStubsData();
  uiStateTracker = {
    expanded: rx.defaultMap<{value: boolean}>({ value: true }),
    selected: rx.defaultMap<{value: boolean}>({ value: false }),
  };

  constructor(
    public app: AppService,
    public infra: ExtNativeInfraService,
    private route: ActivatedRoute,
    private router: Router,
    private routeObs: RouteObservingService,
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
    bindSub(this, route.queryParams, params => {
      if (params.view) {
        if (this.tabActiveState[params.view] === null) {
          console.error(new Error(`unrecognized tab view name '${params.view}'`));
          return;
        }
        this.tabActiveState[params.view] = true;
      } else {
        this.tabActiveState.summary = true;
      }
    });
  }

  ngOnInit() {
    this.hydrate();
    const keyGetter = () => this.key;
    this.vcenter.quickStats.keySub(this, keyGetter, (member, meta) => {
      this.dataLoading = false;
      if (this.quickStatsLast < meta.lastFetched) {
        this.quickStatsLast = meta.lastFetched;
        this.quickStatsData = member;
        this.quickStatsGraphData = this.extractGraphData(this.quickStatsData);
      }
    });
    this.vcenter.allObjects.keySub(this, keyGetter, member => {
      this.extractInventoryStubs(member);
    });
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
    this.vCenter = this.vCenterMap[this.key];
    if (ix.hotblock(this, 'hydrate', 9, 9).passed || !this.dataLoading) {
      this.dataLoading = true;
      rx.invoke(this.vcenter.quickStats.actions.FETCH, { key: this.key, nocache });
      rx.invoke(this.vcenter.allObjects.actions.FETCH, { key: this.key, nocache });
    }
  }

  getCurrentTabName() {
    const basepath = `/${this.routeObs.routeData.pageData.path}/vcenter/`;
    const paths = this.router.url.split(basepath)[1].split('/');
    const tabName =  paths[1] ? paths[1] : '';
    this.currentKey = paths[0];
    this.currentTab = tabName;
    return tabName;
  }

  tabSelect(targetTabName: string) {
    this.router.navigate(['.'], { relativeTo: this.route, queryParams: { view: targetTabName } });
  }

  dataFetcherCpu = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.cpu); });
  dataFetcherMem = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.mem); });
  dataFetcherDisk = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.disk); });
  dataFetcherHostCount = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.hostCount); });
  dataFetcherVmCount = (params) => new Promise<any>(resolve => { resolve(this.quickStatsGraphData.vmCount); });

  getRouterLink(stub: VcenterInventoryStubNode) {
    return [`${stub.entityKey}`];
  }

  getQueryParams(stub: VcenterInventoryStubNode) {
    return { entity: stub.entityKey };
  }

  selectEntity(stub: VcenterInventoryStubNode) {
    // stub.ClrSelectedState.SELECTED
  }

  getChildren = (stub: VcenterInventoryStubNode | VcenterInventoryStubNode[]) => {
    if (Array.isArray(stub)) { return stub; }
    return stub.children;
  };

  getEntityCount(list: VcenterInventoryStubNode[]) {
    if (!list) { return ''; }
    return `(${list.length})`;
  }

  iconFromEntityType(entityType: string) {
    switch(entityType) {
      case 'VirtualMachine': return 'vm';
      case 'Folder': return 'folder';
      case 'Network': return 'network-switch';
      case 'HostSystem': return 'host';
      case 'ResourcePool': return 'resource-pool';
      case 'Datastore': return 'storage';
      case 'Datacenter': return 'cloud-network';
      case 'ComputeResource': return 'cluster';
      case 'VirtualApp': return 'vmw-app';
    }
    return '';
  }

  newEmptyStubsData() {
    const data: VcenterInventoryStubsData = {
      vCenterKey: this.key,
      mainDatacenter: null,
      datacenters: [],
      hosts: [],
      networks: [],
      resourcePools: [],
      clusters: [],
      datastores: [],
      folders: [],
      vms: [],
      vapps: [],
      byIid: {},
      guidByEntityKey:{},
    };
    return data;
  }

  extractInventoryStubs(entityMap: rx.MapOf<string>) {
    const data = this.newEmptyStubsData();
    const stubByGuid: {[guid: string]: VcenterInventoryStubNode} = {};
    // first pass
    for (const guid of Object.keys(entityMap)) {
      const [ , nameEscaped, parentGuid ] = entityMap[guid].split('|');
      const [ idType, vcenterKey, typeHead, entityType, entityKey ] = guid.split(':');
      const iid = `${typeHead}:${entityType}:${entityKey}`;
      const name = decodeURIComponent(nameEscaped);
      const stub: VcenterInventoryStubNode = {
        guid, iid, name,
        icon: this.iconFromEntityType(entityType),
        parentGuid,
        entityType,
        entityKey,
        children: [],
        expanded: true,
        selected: null,
      };
      stubByGuid[guid] = stub;
      data.byIid[iid] = stub;
      data.guidByEntityKey[entityKey] = guid;
      switch(entityType) {
        case 'VirtualMachine': data.vms.push(stub); break;
        case 'Folder': data.folders.push(stub); break;
        case 'Network': data.networks.push(stub); break;
        case 'HostSystem': data.hosts.push(stub); break;
        case 'ResourcePool': data.resourcePools.push(stub); break;
        case 'Datastore': data.datastores.push(stub); break;
        case 'Datacenter': data.datacenters.push(stub); break;
        case 'ComputeResource': data.clusters.push(stub); break;
        case 'VirtualApp': data.vapps.push(stub); break;
      }
    }
    // second pass with parent hierarchy
    for (const iid of Object.keys(entityMap)) {
      let [ guid, , parentIid ] = entityMap[iid].split('|');
      const [ idType, vcenterKey, typeHead, entityType, entityKey ] = guid.split(':');
      if (!stubByGuid[parentIid]) { continue; }
      stubByGuid[parentIid].children.push(stubByGuid[iid]);
      if (parentIid.indexOf('Datacenter') >= 0) {
        const datacenterRoot: VcenterInventoryStubDatacenter = stubByGuid[parentIid];
        switch(stubByGuid[iid].name) {
          case 'host': datacenterRoot.hostFolder = stubByGuid[iid]; break;
          case 'datastore': datacenterRoot.datastoreFolder = stubByGuid[iid]; break;
          case 'network': datacenterRoot.networkFolder = stubByGuid[iid]; break;
          case 'vm': datacenterRoot.vmFolder = stubByGuid[iid]; break;
        }
      }
    }
    // Reorganize/sort for better view
    for (const dc of data.datacenters) {
      if (!dc.hostFolder || !dc.hostFolder.children) { continue; }
      for (const cluster of dc.hostFolder.children) {
        cluster.children = cluster.children.sort((a, b) => {
          if (b.entityType === 'ResourcePool') { return -1; }
        });
      }
      dc.hostFolder.children.sort((a, b) => a.name.localeCompare(b.name));
      dc.datastoreFolder.children.sort((a, b) => a.name.localeCompare(b.name));
      dc.networkFolder.children.sort((a, b) => a.name.localeCompare(b.name));
      this.recursiveSortByName(dc.vmFolder.children);
    }
    data.mainDatacenter = data.datacenters[0];
    data.mainDatacenter.hostFolder
    this.infra.vcenterStubsDataAdd(this.key, data);
    this.inventoryStubs = data;
  }

  recursiveSortByName(list: VcenterInventoryStubNode[]) {
    if (list && list.length > 0) {
      list.sort((a, b) => a.name.localeCompare(b.name));
      for (const member of list) {
        if (member.entityType !== 'Folder') { continue; }
        this.recursiveSortByName(member.children);
      }
    }
  }

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
      hostCount: { shownTags, timeseries: [ newSeries('host-count', 1) ] },
      vmCount: { shownTags, timeseries: [ newSeries('vm-count', 2) ] },
      cpu: { shownTags, timeseries: [ newSeries('cpu', 3) ] },
      mem: { shownTags, timeseries: [ newSeries('mem', 4) ] },
      disk: { shownTags, timeseries: [ newSeries('disk', 5) ] },
    };
    let baseTime = Math.floor(Date.now() / 1000) - (Math.floor(Date.now() / 1000) % 2592000);
    let hasLooped = false;
    let prevTime = -1;
    let i = 0;
    let loopIndex = -1;
    for (const datapoint of qsData.history) {
      const t = datapoint[0];
      if (prevTime === -1) { prevTime = t; ++i; continue; }
      if (t < prevTime) { loopIndex = i; hasLooped = true; baseTime -= 2592000; break; }
      prevTime = t;
      ++i;
    }
    i = 0;
    for (const datapoint of qsData.history) {
      if (i === loopIndex) { baseTime += 2592000; }
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
