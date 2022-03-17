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
  vnicById: {[key: string]: VNicSummary; } = {};
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
    const sum = this.moData.summary;
    return {
      name: decodeURIComponent(this.moData.name),
      status: {
        connection: this.getConnState(),
        cpu: this.getCpuSummary(),
        mem: this.getMemSummary(),
        disk: this.getDiskSummary(),
        cluster: this.getCluster(),
      },
      hw: {
        system: this.getSystemHardwareDetails(),
        cpu: this.getCpuHardwareDetails(),
        numa: this.getNumaHardwareDetails(),
        datastore: this.getDatastoresDetails(),
        storage: this.getStorageDeviceDetails(),
        rdma: this.getRDMA(),
        nics: this.getNICs(),
        crypto: this.getCrypto(),
        vflash: this.getVFlash(),
        vmotion: this.getVMotion(),
      },
      config: {
        numberOfNICs: sum.hardware.numNics,
        hypervisor: `${sum.config.product.name} ${sum.config.product.version} (build ${sum.config.product.build})`,
        processor: this.getProcessorInfo(),
        processorConcurrency: `${sum.hardware.numCpuCores} Physical Core(s), ${sum.hardware.numCpuThreads} Logical Thread(s)`,
        networking: this.getNetworking(),
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
  getProcessorInfo() {
    const sum = this.moData.summary;
    if (sum.hardware.cpuModel.indexOf('Hz') >= 0) {
      return `${sum.hardware.cpuModel} (x${sum.hardware.numCpuPkgs})`;  
    } else {
      return `${sum.hardware.cpuModel} @ ${Unit.formatted(this.moData.hardware.cpuInfo.hz, '0', 'Hz')} (x${sum.hardware.numCpuPkgs})`;
    }
  }
  getCpuSummaryLine() {
    let cpuCap = this.getCpuCapacity(); if (cpuCap === 0) { cpuCap = 0.0000001; }
    const maxCpuHz = Unit.formatted(cpuCap, 'M', 'Hz');
    const currentCpuHz = Unit.formatted(this.moData.summary.quickStats.overallCpuUsage, 'M', 'Hz');
    const cpuPercentStr = Unit.simplePercent(this.moData.summary.quickStats.overallCpuUsage, cpuCap);
    const hz = Unit.formatted(this.moData.hardware.cpuInfo.hz, '0', 'Hz');
    return {
      clock: `${this.getCpuNumber()} CPU(s) @ ${hz}`,
      utilization: `${currentCpuHz} / ${maxCpuHz} (${cpuPercentStr})`,
    };
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
    const maxMem = Unit.formatted(this.moData.hardware.memorySize, '0i', 'B');
    const active = Unit.formatted(this.moData.summary.quickStats.overallMemoryUsage, 'Mi', 'B');
    const percent = Unit.simplePercent(this.moData.summary.quickStats.overallMemoryUsage * 1024 * 1024, this.moData.hardware.memorySize,);
    return `${maxMem}, active ${active} (${percent})`;
  }
  getRDMA() {
    const rdmaDevices = this.moData.config.network.rdmaDevice;
    return {
      devices: rdmaDevices ? rdmaDevices.map(rdma => {
        const uplink = rdma.backing.pairedUplink.split('-').pop();
        return {
          summaryName: `${rdma.device} (${rdma.driver}) ${rdma.description}`,
          name: rdma.device,
          description: rdma.description,
          driver: rdma.driver,
          state: rdma.connectionInfo.state,
          mtu: rdma.connectionInfo.mtu,
          gbps: rdma.connectionInfo.speedInMbps / 1000,
          mbps: rdma.connectionInfo.speedInMbps,
          uplink,
        };
      }) : null,
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
  getConnState() {
    switch (this.moData.summary.runtime.connectionState as any) {
      case 'connected': return 'Connected';
      case 'disconnected': return 'Disconnected';
    }
    return this.moData.summary.runtime.powerState;
  }
  getSystemHardwareDetails() {
    const sysInfo = this.moData.hardware.systemInfo;
    const otherInfo = sysInfo.otherIdentifyingInfo.map(info => {
      if (!info.identifierValue || info.identifierValue === 'empty') { return null; }
      return { label: info.identifierType.label, key: info.identifierType.key, value: info.identifierValue };
    }).filter(a => a);
    const serviceTag = otherInfo.filter(a => a.key === 'ServiceTag')[0];
    const serviceTagValue = serviceTag ? serviceTag.value : null;
    return {
      modelAndServiceTag: serviceTag ? `${sysInfo.model} (${serviceTagValue})` : sysInfo.model,
      vendor: sysInfo.vendor,
      model: sysInfo.model,
      uuid: sysInfo.uuid,
      otherInfo,
    };
  }
  getCpuHardwareDetails() {
    const powerMgmt = this.moData.hardware.cpuPowerManagementInfo.hardwareSupport ?
        `${this.moData.hardware.cpuPowerManagementInfo.currentPolicy} (${this.moData.hardware.cpuPowerManagementInfo.hardwareSupport})`
        : this.moData.hardware.cpuPowerManagementInfo.currentPolicy;
    const packageDetails: { key: string; value: string; }[] = [];
    this.moData.hardware.cpuPkg.forEach(pkg => {
      const threadsSorted = JSON.parse(JSON.stringify(pkg.threadId)).sort((a, b) => a - b);
      packageDetails.push({ key: `CPU ${pkg.index}`, value: pkg.description });
      packageDetails.push({ key: `CPU ${pkg.index} Clock`, value: Unit.formatted(pkg.hz, '0', 'Hz') });
      packageDetails.push({ key: `CPU ${pkg.index} Bus`, value: Unit.formatted(pkg.busHz, '0', 'Hz') });
      packageDetails.push({ key: `CPU ${pkg.index} Threads`, value: threadsSorted.join(', ') });
    });
    const ht = this.moData.config.hyperThread;
    const htStr = `${ht.available ? 'Available' : 'Unavailable'}, ${ht.active ? 'Enabled' : 'Disabled'}`;
    return {
      powerMgmt,
      hyperthreading: htStr,
      packages: packageDetails,
    };
  }
  getDatastoresDetails() {
    const summary = this.getDiskSummary();
    const percent = Unit.simplePercent(summary.usage, summary.capacity);
    return {
      summaryLine: `${summary.usageStr} / ${summary.capacityStr} (${percent})`,
    };
  }
  getStorageDeviceDetails() {
    return {
      diskLuns: this.moData.config.storageDevice.scsiLun.filter(dev => dev.deviceType === 'disk').map(lun => {
        return {
          summaryName: lun.displayName.split(' (')[0] + ` (${lun.deviceName})`,
          name: lun.deviceName,
          type: this.capitalize(lun.deviceType),
          canonicalName: lun.canonicalName,
          displayName: lun.displayName,
          lunType: lun.lunType,
          vendor: lun.vendor,
          model: lun.model,
          ssd: lun.ssd,
          local: lun.localDisk,
          blockSize: lun.capacity.blockSize,
          capacity: Unit.formatted(lun.capacity.blockSize * parseFloat(lun.capacity.block), '0i', 'B'),
          capacityNum: lun.capacity.blockSize * parseFloat(lun.capacity.block),
          summary: ``,
        };
      }).sort((a, b) => a.capacityNum - b.capacityNum),
      hostBusAdaptors: this.moData.config.storageDevice.hostBusAdapter.map(hb => {
        return {
          key: hb.key,
          device: hb.device,
          model: hb.model,
          protocol: hb.storageProtocol,
          driver: hb.driver,
        };
      }),
    };
  }
  getNumaHardwareDetails() {
    const numaDetails: { key: string; value: string; }[] = [];
    this.moData.hardware.numaInfo.numaNode.forEach(numa => {
      const threadsSorted = JSON.parse(JSON.stringify(numa.cpuID)).sort((a, b) => a - b);
      numaDetails.push({ key: `NUMA ${numa.typeId} Begin`, value: `${numa.memoryRangeBegin}` });
      numaDetails.push({ key: `NUMA ${numa.typeId} Length`, value: `${numa.memoryRangeLength}` });
      numaDetails.push({ key: `NUMA ${numa.typeId} Threads`, value: `${threadsSorted.join(', ')}` });
    });
    return {
      numNodes: this.moData.hardware.numaInfo.numNodes,
      summary: `${this.moData.hardware.numaInfo.type} x ${this.moData.hardware.numaInfo.numNodes}`,
      details: numaDetails,
    };
  }
  getNetworking() {
    const net = this.moData.config.network;
    const dnsConf = net.dnsConfig;
    let hostname;
    if (dnsConf.hostName && dnsConf.domainName) { hostname = `${dnsConf.hostName}.${dnsConf.domainName}`; }
    else if (dnsConf.hostName) { hostname = dnsConf.hostName; }
    else if (dnsConf.domainName) { hostname = dnsConf.domainName; }
    else { hostname = '(Unassigned)'; }
    const netRuntime = this.moData.runtime?.networkRuntimeInfo?.netStackInstanceRuntimeInfo?.[0];
    return {
      hostname,
      pnicLength: net.pnic.length,
      vnicLength: net.vnic.length,
      defaultGateway: net.ipRouteConfig.defaultGateway,
      maxConn: netRuntime ? netRuntime.maxNumberOfConnections : 0,
      ipv6: netRuntime ? netRuntime.currentIpV6Enabled : false,
      vmknic: netRuntime ? netRuntime.vmknicKeys.join(', ') : '',
    };
  }
  getNICs() {
    const net = this.moData.config.network;
    this.vnicById = {};
    return {
      pnic: net.pnic.map(pnic => {
        return {
          device: pnic.device, 
          driver: pnic.driver,
          mac: pnic.mac,
          linkSpec: pnic.validLinkSpecification.map(lspec => `${Unit.formatted(lspec.speedMb, 'M', 'b')}${lspec.duplex ? ' (duplex)' : ''}`).join(', '),
        };
      }),
      vnic: net.vnic.map(vnic => {
        const summary = {
          device: vnic.device, 
          portgroup: vnic.portgroup,
          ip: vnic.spec.ip.ipAddress,
          subnet: vnic.spec.ip.subnetMask,
          dhcp: vnic.spec.ip.dhcp,
          mac: vnic.spec.mac,
          mtu: vnic.spec.mtu,
        } as VNicSummary;
        this.vnicById[vnic.device] = summary;
        return summary;
      }),
    };
  }
  getVMotion() {
    const vmo = this.moData.config.vmotion;
    if (!this.moData.summary.config.vmotionEnabled) { return { state: 'Disabled' }; }
    const selectedVnic = vmo.netConfig.selectedVnic.split('-').pop()
    return {
      state: 'Enabled',
      candidates: vmo.netConfig.candidateVnic.map(vnic => {
        const summary = this.vnicById[vnic.device];
        summary.vmotionSelected = (vnic.device === selectedVnic);
        return summary;
      }).sort((a, b) => a.vmotionSelected ? -1 : b.vmotionSelected ? 1 : 0),
      selectedVnic,
    };
  }
  getVFlash() {
    const vflash = this.moData.runtime.vFlashResourceRuntimeInfo;
    if (!vflash) { return null; }
    return {
      usage: parseFloat(vflash.usage),
      capacity: parseFloat(vflash.capacity),
      capacityForVmCache: parseFloat(vflash.capacityForVmCache),
      freeForVmCache: parseFloat(vflash.freeForVmCache),
      accessible: vflash.accessible,
      summaryLine: `${Unit.formatted(vflash.usage, '0i', 'B')} / ${Unit.formatted(vflash.capacity, '0i', 'B')} (${Unit.simplePercent(vflash.usage, vflash.capacity)})`,
      usageStr: Unit.formatted(vflash.usage, '0i', 'B'),
      capacityStr: Unit.formatted(vflash.capacity, '0i', 'B'),
      freeForVmCacheStr: Unit.formatted(vflash.freeForVmCache, '0i', 'B'),
      capacityForVmCacheStr: Unit.formatted(vflash.capacityForVmCache, '0i', 'B'),
    };
  }
  getCrypto() {
    const keyInfo = this.moData.runtime.cryptoKeyId ? `${this.moData.runtime.cryptoKeyId.keyId} (${this.moData.runtime.cryptoKeyId.providerId.id})` : null;
    return {
      mode: this.capitalize(this.moData.runtime.cryptoState),
      keyInfo,
    };
  }

  capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }
}

interface VNicSummary {
  device: string;
  portgroup: string;
  ip: string;
  subnet: string;
  dhcp: boolean;
  mac: string;
  mtu: number;
  vmotionSelected?: boolean;
}
