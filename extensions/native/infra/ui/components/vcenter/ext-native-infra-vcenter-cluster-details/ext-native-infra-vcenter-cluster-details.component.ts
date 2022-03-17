import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import * as Cluster from '../models/mo.cluster.models';
import { VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-cluster-details',
  templateUrl: './ext-native-infra-vcenter-cluster-details.component.html',
  styleUrls: ['./ext-native-infra-vcenter-cluster-details.component.scss']
})
export class ExtNativeInfraVcenterClusterDetailsComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() moData: Cluster.ClusterFullDetails;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  data = this.populateData();
  constructor() {
    super('ext-native-infra-vcenter-cluster-details');
  }
  
  ngOnInit(): void {
    this.data = this.populateData();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'moData': {
          this.data = this.populateData();
        }
      }
    }
  }

  ngOnDestroy() {
    autoUnsub(this);
    this.destroy();
  }

  populateData() {
    if (!this.moData) { return; }
    const sum = this.moData.summary;
    return {
      name: decodeURIComponent(this.moData.name),
      status: {
        cpu: this.getCpuStatus(),
        mem: this.getMemStatus(),
        disk: this.getDiskSummary(),
        host: this.getHostStatus(),
        vmotionCount: sum.numVmotions,
        drsScore: sum.drsScore,
        currentFailoverLevel: sum.currentFailoverLevel,
        underMaintenance: (sum.clusterMaintenanceModeStatus !== 'notInMaintenanceMode'),
        vmCount: sum.usageSummary.totalVmCount,
        vmCountPowerOff: sum.usageSummary.poweredOffVmCount,
      },
      summary: sum,
    };
  }

  stubByIid(iid: string) {
    if (!iid || !this.inventoryStubs) { return null; }
    return this.inventoryStubs.byIid[iid];
  }
  guidToIid(guid: string) {
    return guid.split(':').slice(2).join(':');
  }
  getCpuStatus() {
    const sum = this.moData.summary;
    return {
      cpuTitle: `${sum.numCpuCores} CPU`,
      cpuEffetive: sum.effectiveCpu,
      cpuTotal: sum.totalCpu,
      cores: sum.numCpuCores,
      threads: sum.numCpuThreads,
      capacity: sum.usageSummary.totalCpuCapacityMhz,
      usage: sum.usageSummary.cpuDemandMhz,
    };
  }
  getMemStatus() {
    const sum = this.moData.summary;
    return {
      memEffective: parseFloat(sum.effectiveMemory),
      memTotalBytes: parseFloat(sum.totalMemory),
      memReserved: sum.usageSummary.memReservationMB,
      capacity: sum.usageSummary.totalMemCapacityMB,
      usage: sum.usageSummary.memDemandMB,
    };
  }
  getDiskSummary() {
    let totalCap = 0;
    let totalUsed = 0;
    for (const summary of this.moData.datastoreSummary) {
      if (summary.isAlias) { continue; }
      const cap = parseInt(summary.capacity, 10) / 1024 / 1024 / 1024;
      const free = parseInt(summary.freeSpace, 10) / 1024 / 1024 / 1024;
      totalCap += cap;
      totalUsed += cap - free;
    }
    return {
      capacity: totalCap,
      usage: totalUsed,
      capacityStr: Unit.formatted(totalCap, 'Gi', 'B'),
      usageStr: Unit.formatted(totalUsed, 'Gi', 'B'),
    };
  }
  getHostStatus() {
    const sum = this.moData.summary;
    return {
      hostCount: sum.numHosts,
      hostCountEffective: sum.numEffectiveHosts,
      percentUp: Unit.simplePercent(sum.numEffectiveHosts, sum.numHosts),
    };
  }
  

  capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }
}
