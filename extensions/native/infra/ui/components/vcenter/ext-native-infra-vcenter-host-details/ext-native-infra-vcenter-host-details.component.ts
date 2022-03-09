import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
// import { moduleTypeMap } from 'src/app/ganymede/components/util/shared/common';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import * as Host from '../models/mo.host.models';
import { VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-host-details',
  templateUrl: './ext-native-infra-vcenter-host-details.component.html',
  styleUrls: ['./ext-native-infra-vcenter-host-details.component.scss']
})
export class ExtNativeInfraVcenterHostDetailsComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() moData: Host.HostFullDetails;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  data = this.populateData();
  constructor() {
    super('ext-native-infra-vcenter-host-details');
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
    return {
      name: decodeURIComponent(this.moData.name),
      status: {
        // power: this.getPowerState(),
        cpu: this.getCpuSummary(),
        mem: this.getMemSummary(),
        // disk: this.getDiskSummary(),
        // host: this.getHost(),
        cluster: this.getCluster(),
        // network: this.getNetwork(),
        // datastore: this.getDatastore(),
        // resPool: this.getResourcePool(),
      },
      hw: {
        // disks: this.getDisksInfo(),
        // networks: this.getNetworksInfo(),
        // cdDrives: this.getCdDriveInfo(),
        // gpus: this.getGpuInfo(),
        // other: this.getOtherHardware(),
      },
      meta: {
        upSince: Date.now() - (this.moData.summary.quickStats.uptime * 1000),
      }
    };
  }

  stubByIid(iid: string) {
    if (!iid || !this.inventoryStubs) { return null; }
    return this.inventoryStubs.byIid[iid];
  }
  guidToIid(guid: string) {
    return guid.split(':').slice(2).join(':');
  }
  getCluster() {
    const cluterIid = this.guidToIid(this.moData.parent);
    return this.stubByIid(cluterIid);
  }
  getCpuNumber() {
    return this.moData.hardware.cpuInfo.numCpuCores;
  }
  getCpuHz() {
    return parseInt(this.moData.hardware.cpuInfo.hz, 10) / 1000 / 1000;
  }
  getCpuCapacity() {
    return this.getCpuHz() * this.getCpuNumber();
  }
  getCpuSummary() {
    return {
      num: this.getCpuNumber(),
      cpuTitle: `${this.getCpuNumber()} CPU`,
      usage: this.moData.summary.quickStats.overallCpuUsage,
      capacity: this.getCpuCapacity(),
      summary: this.getCpuSummaryLine(),
    };
  }
  getCpuSummaryLine() {
    let cpuCap = this.getCpuCapacity(); if (cpuCap === 0) { cpuCap = 0.0000001; }
    const maxCpuHz = Unit.formatted(cpuCap, 'M', 'Hz');
    const currentCpuHz = Unit.formatted(this.moData.summary.quickStats.overallCpuUsage, 'M', 'Hz');
    const cpuPercent = this.moData.summary.quickStats.overallCpuUsage / cpuCap * 100;
    const cpuPercentStr = (cpuPercent >= 1 || cpuPercent === 0) ? cpuPercent.toFixed(0) : cpuPercent.toFixed(1);
    return `${this.getCpuNumber()} CPU(s), ${currentCpuHz} / ${maxCpuHz} (${cpuPercentStr}%)`;
  }
  getMemSummary() {
    const cap = parseInt(this.moData.hardware.memorySize, 10) / 1024 / 1024;
    const active = this.moData.summary.quickStats.overallMemoryUsage;
    return {
      capacity: cap,
      usage: active,
      summary: this.getMemSummaryLine(),
    };
  }
  getMemSummaryLine() {
    const maxMem = Unit.formatted(parseInt(this.moData.hardware.memorySize), 'Mi', 'B');
    const active = Unit.formatted(this.moData.summary.quickStats.overallMemoryUsage, 'Mi', 'B');
    return `${maxMem}, active ${active}`;
  }

  // getDiskUsageGB() {
  //   return parseInt(this.moData.summary.storage.committed, 10) / 1024 / 1024 / 1024;
  // }
  // getDiskCapacityGB() {
  //   const disks = this.moData.config.hardware.device.filter(d => d._type === 'VirtualDisk') as VM.VirtualDisk[]; //capacityInKB
  //   let totalSpaceKB = 0;
  //   disks.forEach(disk => totalSpaceKB += parseInt(disk.capacityInKB, 10));
  //   return totalSpaceKB / 1024 / 1024;
  // }
  // getDiskSummary() {
  //   return {
  //     usage: this.getDiskUsageGB(),
  //     capacity: this.getDiskCapacityGB(),
  //   };
  // }
  // getDisksInfo() {
  //   const disks = this.moData.config.hardware.device.filter(d => d._type === 'VirtualDisk') as VM.VirtualDisk[];
  //   const d = disks.map(disk => ({
  //     name: disk.deviceInfo.label,
  //     size: Unit.formatted(parseInt(disk.capacityInKB, 10), 'ki', 'B'),
  //     type: disk.backing.thinProvisioned ? 'Thin Provision' : 'Thick Provision Eager Zeroed',
  //     backingId: disk.backing.datastore,
  //   }));
  //   return d;
  // }
  // getNetworksInfo() {
  //   const networks = this.moData.config.hardware.device
  //                     .filter(d => this.vmTypeMap.checkInstanceOf(d, VM.VirtualEthernetCard)) as VM.VirtualEthernetCard[];
  //   return networks.map(network => {
  //     let backedBy: string;
  //     let backingId: string;
  //     if (this.vmTypeMap.checkInstanceOf(network.backing, VM.VirtualEthernetCardNetworkBackingInfo)) {
  //       backingId = (network.backing as VM.VirtualEthernetCardNetworkBackingInfo).network;
  //       backedBy = 'Network';
  //     } else if (this.vmTypeMap.checkInstanceOf(network.backing, VM.VirtualEthernetCardDistributedVirtualPortBackingInfo)) {
  //       backingId = (network.backing as VM.VirtualEthernetCardDistributedVirtualPortBackingInfo).port.portgroupKey;
  //       backedBy = 'DistributedVirtualPort';
  //     } else {
  //       console.log(new Error(`Unrecognized network backing type ${network.backing._type}`), network.backing);
  //     }
  //     return {
  //       name: network.deviceInfo.label,
  //       type: network._type,
  //       macAddress: network.macAddress,
  //       backedBy, backingId,
  //       connected: network.connectable.connected,
  //       wakeOnLan: network.wakeOnLanEnabled,
  //     };
  //   });
  // }
  

  capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }
}
