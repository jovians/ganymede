import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { PrismHighlightService } from 'src/app/ganymede/components/services/prism-highlight.service';
import { moduleTypeMap } from 'src/app/ganymede/components/util/shared/common';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import * as VM from '../models/mo.vm.models';
import { VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-vm-details',
  templateUrl: './ext-native-infra-vcenter-vm-details.component.html',
  styleUrls: ['./ext-native-infra-vcenter-vm-details.component.scss']
})
export class ExtNativeInfraVcenterVmDetailsComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() moData: VM.VirtualMachineFullDetails;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  data = this.populateData();
  userDataRendered = false;
  vmTypeMap = moduleTypeMap(VM, '_type');
  
  constructor(private prism: PrismHighlightService) {
    super('ext-native-infra-vcenter-vm-details');
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
    const data = {
      name: decodeURIComponent(this.moData.name),
      status: {
        power: this.getPowerState(),
        cpu: this.getCpuSummary(),
        mem: this.getMemSummary(),
        disk: this.getDiskSummary(),
        host: this.getHost(),
        cluster: this.getCluster(),
        network: this.getNetwork(),
        netDetails: this.getNetworkDetails(),
        datastore: this.getDatastore(),
        resPool: this.getResourcePool(),
      },
      hw: {
        disks: this.getDisksInfo(),
        networks: this.getNetworksInfo(),
        cdDrives: this.getCdDriveInfo(),
        gpus: this.getGpuInfo(),
        other: this.getOtherHardware(),
      },
      vapp: this.getVAppConfigs(),
      meta: {
        createDate: new Date(this.moData.config.createDate).toISOString(),
      }
    };
    this.prism.nudgeHighlight(this).then(result => {
      const el = document.getElementById(`${this.ixId}-user-data`);
      if (el && el.getAttribute('tabindex') === '0') {
        this.userDataRendered = true;
        el.style.visibility = 'visible';
      }
    });
    return data;
  }

  getPowerState() {
    switch (this.moData.summary.runtime.powerState) {
      case 'poweredOn': return 'Power On';
      case 'poweredOff': return 'Power Off';
      case 'suspended': return 'Suspended';
    }
    return this.moData.summary.runtime.powerState;
  }

  stubByIid(iid: string) {
    if (!iid || !this.inventoryStubs) { return null; }
    return this.inventoryStubs.byIid[iid];
  }
  guidToIid(guid: string) {
    return guid.split(':').slice(2).join(':');
  }

  getHost() {
    return this.stubByIid(this.moData.runtime.host);
  }
  getCluster() {
    const host = this.getHost(); if (!host) { return null; }
    const cluterIid = this.guidToIid(host.parentGuid);
    return this.stubByIid(cluterIid);
  }
  getNetwork() {
    const netGuid = this.moData.network[0]; if (!netGuid) { return null; }
    return this.stubByIid(this.guidToIid(netGuid));
  }
  getNetworkDetails() {
    if (!this.moData.guest || !this.moData.guest.ipStack || this.moData.guest.ipStack.length === 0) { return null; }
    const netInfo = this.moData.guest.net ? this.moData.guest.net[0] : null;
    const info = this.moData.guest.ipStack[0];
    let hostname: string;
    if (info.dnsConfig.hostName && info.dnsConfig.domainName) {
      hostname = `${info.dnsConfig.hostName}.${info.dnsConfig.domainName}`;
    } else if (info.dnsConfig.hostName) {
      hostname = info.dnsConfig.hostName;
    } else if (info.dnsConfig.domainName) {
      hostname = info.dnsConfig.domainName;
    } else {
      hostname = `(Unknown)`;
    }
    const routes = info.ipRouteConfig?.ipRoute ? info.ipRouteConfig.ipRoute : []; 
    return {
      dhcp: info.dnsConfig.dhcp,
      hostname: hostname,
      ipList: netInfo ? netInfo.ipConfig.ipAddress.map(ipInfo => `${ipInfo.ipAddress} (${ipInfo.state})`) : null,
      ns: info.dnsConfig.ipAddress,
      routes: routes.map(route => `${route.network}/${route.prefixLength}`).filter((v, i, s) => s.indexOf(v) === i),
      searchDomain: info.dnsConfig.searchDomain,
    };
  }
  getResourcePool() {
    return this.stubByIid(this.guidToIid(this.moData.resourcePool));
  }
  getDatastore() {
    const datastoreGuid = this.moData.datastore[0]; if (!datastoreGuid) { return null; }
    return this.stubByIid(this.guidToIid(datastoreGuid));
  }
  
  getCpuNumber() {
    return this.moData.config.hardware.numCPU;
  }
  getCpuHz() {
    if (this.moData.summary.runtime.maxCpuUsage) {
      return this.moData.summary.runtime.maxCpuUsage / this.moData.config.hardware.numCPU;
    } else {
      return parseInt((this.moData as any).cpuHz, 10) / 1000 / 1000;
    }
  }
  getCpuCapacity() {
    return this.getCpuHz() * this.getCpuNumber();
  }
  getCpuSummary() {
    const alloc = this.moData.config.cpuAllocation;
    return {
      num: this.getCpuNumber(),
      cpuTitle: `${this.getCpuNumber()} CPU`,
      usage: this.moData.summary.quickStats.overallCpuUsage,
      capacity: this.getCpuCapacity(),
      reservation: `${alloc.reservation} MHz`,
      limit: alloc.limit === '-1' ? 'Unlimited' : alloc.limit,
      shares: `${alloc.shares.shares} (${this.capitalize(alloc.shares.level)})`,
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
    const alloc = this.moData.config.memoryAllocation;
    return {
      reservation: `${alloc.reservation} MiB`,
      limit: alloc.limit === '-1' ? 'Unlimited' : alloc.limit,
      shares: `${alloc.shares.shares} (${this.capitalize(alloc.shares.level)})`,
      consumedOverhead: Unit.formatted(this.moData.summary.quickStats.consumedOverheadMemory, 'Mi', 'B'),
      summary: this.getMemSummaryLine(),
    };
  }
  getMemSummaryLine() {
    const maxMem = Unit.formatted(this.moData.config.hardware.memoryMB, 'Mi', 'B');
    const active = Unit.formatted(this.moData.summary.quickStats.guestMemoryUsage, 'Mi', 'B');
    return `${maxMem}, active ${active}`;
  }

  getDiskUsageGB() {
    return parseInt(this.moData.summary.storage.committed, 10) / 1024 / 1024 / 1024;
  }
  getDiskCapacityGB() {
    const disks = this.moData.config.hardware.device.filter(d => d._type === 'VirtualDisk') as VM.VirtualDisk[]; //capacityInKB
    let totalSpaceKB = 0;
    disks.forEach(disk => totalSpaceKB += parseInt(disk.capacityInKB, 10));
    return totalSpaceKB / 1024 / 1024;
  }
  getDiskSummary() {
    return {
      usage: this.getDiskUsageGB(),
      capacity: this.getDiskCapacityGB(),
    };
  }
  getDisksInfo() {
    const disks = this.moData.config.hardware.device.filter(d => d._type === 'VirtualDisk') as VM.VirtualDisk[];
    const d = disks.map(disk => ({
      name: disk.deviceInfo.label,
      size: Unit.formatted(parseInt(disk.capacityInKB, 10), 'ki', 'B'),
      type: disk.backing.thinProvisioned ? 'Thin Provision' : 'Thick Provision Eager Zeroed',
      backingId: disk.backing.datastore,
    }));
    return d;
  }
  getNetworksInfo() {
    const networks = this.moData.config.hardware.device
                      .filter(d => this.vmTypeMap.checkInstanceOf(d, VM.VirtualEthernetCard)) as VM.VirtualEthernetCard[];
    return networks.map(network => {
      let backedBy: string;
      let backingId: string;
      if (this.vmTypeMap.checkInstanceOf(network.backing, VM.VirtualEthernetCardNetworkBackingInfo)) {
        backingId = (network.backing as VM.VirtualEthernetCardNetworkBackingInfo).network;
        backedBy = 'Network';
      } else if (this.vmTypeMap.checkInstanceOf(network.backing, VM.VirtualEthernetCardDistributedVirtualPortBackingInfo)) {
        backingId = (network.backing as VM.VirtualEthernetCardDistributedVirtualPortBackingInfo).port.portgroupKey;
        backedBy = 'DistributedVirtualPort';
      } else {
        console.log(new Error(`Unrecognized network backing type ${network.backing._type}`), network.backing);
      }
      return {
        name: network.deviceInfo.label,
        type: network._type,
        macAddress: network.macAddress,
        backedBy, backingId,
        connected: network.connectable.connected,
        wakeOnLan: network.wakeOnLanEnabled,
      };
    });
  }
  getCdDriveInfo() {
    const cdDrives = this.moData.config.hardware.device
        .filter(d => this.vmTypeMap.checkInstanceOf(d, VM.VirtualCdrom)) as VM.VirtualCdrom[];
    return cdDrives.map(cdDrive => {
      const connected = cdDrive.connectable.connected;
      return {
        name: cdDrive.deviceInfo.label,
        connected,
        file: (cdDrive.backing as any).fileName,
        backingId: (cdDrive.backing as any).datastore,
      };
    });
  }
  getGpuInfo() {
    const gpus = this.moData.config.hardware.device
        .filter(d => this.vmTypeMap.checkInstanceOf(d, VM.VirtualMachineVideoCard)) as VM.VirtualMachineVideoCard[];
    return gpus.map(gpu => {
      return {
        name: gpu.deviceInfo.label,
        videoRam: Unit.formatted(parseInt(gpu.videoRamSizeInKB, 10), 'ki', 'B'),
        graphicsRam: Unit.formatted(parseInt(gpu.graphicsMemorySizeInKB, 10), 'ki', 'B'),
        displays: gpu.numDisplays,
        enable3DSupport: gpu.enable3DSupport,
      };
    });
  }
  getOtherHardware() {
    const normalControllers = this.moData.config.hardware.device
        .filter(d => (
          d.deviceInfo.label.indexOf('SCSI') === -1 &&
          !d.deviceInfo.label.startsWith('USB ') &&
          d.deviceInfo.label.indexOf('controller') >= 0 || 
          d.deviceInfo.label.startsWith('IDE ')
        ));
    const scsiControllers = this.moData.config.hardware.device
        .filter(d => d.deviceInfo.label.startsWith('SCSI'));
    const inputDevices = this.moData.config.hardware.device
        .filter(d =>
          this.vmTypeMap.checkInstanceOf(d, VM.VirtualKeyboard) ||
          this.vmTypeMap.checkInstanceOf(d, VM.VirtualPointingDevice)
        );
    const usbController = this.moData.config.hardware.device
        .filter(d => d.deviceInfo.label.startsWith('USB '));
    return {
      controllers: [...normalControllers.map(dev => 
         dev.deviceInfo.label !== dev.deviceInfo.summary ? 
          `${dev.deviceInfo.label} (${dev.deviceInfo.summary})` : dev.deviceInfo.label
      )],
      scsiControllers: [...scsiControllers.map(dev => dev.deviceInfo.label)],
      usbControllers: [...usbController.map(dev => dev.deviceInfo.label)],
      inputDevices: [...inputDevices.map(dev => dev.deviceInfo.label)],
    };
  }
  getVAppConfigs() {
    if (!this.moData.config.vAppConfig) { return null; }
    const userDataProperty = this.moData.config.vAppConfig.property ? this.moData.config.vAppConfig.property.filter(a => a.label === 'user-data')[0] : null;
    const userData = userDataProperty ? Buffer.from(userDataProperty.value, 'base64').toString('utf8') : '';
    return {
      userData,
    };
  }

  capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }
}
