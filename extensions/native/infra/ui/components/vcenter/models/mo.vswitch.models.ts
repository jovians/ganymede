/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { MoBaseDetails, moref, morefg, stringNumber, uuid, Permission } from './mo.general';

export class VirtualSwitchFullDetails extends MoBaseDetails {
  $registeredIP: string;
  capability: DVSCapability;
  config: DVSConfigInfo;
  configStatus: string;
  permission: Permission[];
  portgroup: morefg[];
  runtime: DVSRuntimeInfo;
  summary: DVSSummary;
  uuid: uuid;
}

export class DVSCapability {
  _type: 'DVSCapability';
  dvsOperationSupported: boolean;
  dvPortGroupOperationSupported: boolean;
  dvPortOperationSupported: boolean;
  compatibleHostComponentProductInfo: { productLineId: string; version: string; }[];
  featuresSupported: DVSFeatureCapability;
}

export class DVSFeatureCapability {
  _type: 'DVSFeatureCapability' | 'VMwareDVSFeatureCapability';
  networkResourceManagementSupported: boolean;
  vmDirectPathGen2Supported: boolean;
  nicTeamingPolicy: string[];
  networkResourcePoolHighShareValue: 100;
  networkResourceManagementCapability: {
      networkResourceManagementSupported: boolean;
      networkResourcePoolHighShareValue: 100;
      qosSupported: boolean;
      userDefinedNetworkResourcePoolsSupported: boolean;
      networkResourceControlVersion3Supported: boolean;
      userDefinedInfraTrafficPoolSupported: boolean
  };
  healthCheckCapability: {
      _type: 'VMwareDVSHealthCheckCapability';
      vlanMtuSupported: boolean;
      teamingSupported: boolean
  };
  rollbackCapability: {
      rollbackSupported: boolean
  };
  backupRestoreCapability: {
      backupRestoreSupported: boolean
  };
  networkFilterSupported: boolean;
  macLearningSupported: boolean;
  vspanSupported: boolean;
  lldpSupported?: boolean;
  ipfixSupported?: boolean;
  ipfixCapability?: {
      ipfixSupported: boolean;
      ipv6ForIpfixSupported: boolean;
      observationDomainIdSupported: boolean
  };
  multicastSnoopingSupported?: boolean;
  mtuCapability?: { minMtuSupported: number; maxMtuSupported: number; }
  vspanCapability?: {
      mixedDestSupported: boolean;
      dvportSupported: boolean;
      remoteSourceSupported: boolean;
      remoteDestSupported: boolean;
      encapRemoteSourceSupported: boolean;
      erspanProtocolSupported: boolean;
      mirrorNetstackSupported: boolean
  };
  lacpCapability?: {
      lacpSupported: boolean;
      multiLacpGroupSupported: boolean
  };
  nsxSupported?: boolean;
}

interface DVSPortSettingValue<T=(string | number | boolean)> { inherited: boolean; value: T; }

export class DVSConfigInfo {
  _type: 'DVSConfigInfo' | 'VMwareDVSConfigInfo';
  uuid: string;
  name: string;
  numStandalonePorts: 0;
  numPorts: 106;
  maxPorts: 2147483647;
  uplinkPortPolicy: { _type: 'DVSNameArrayUplinkPortPolicy'; uplinkPortName: string[]; };
  uplinkPortgroup: moref[];
  defaultPortConfig: {
    _type: 'DVSPortSetting' | 'VMwareDVSPortSetting';
    blocked: DVSPortSettingValue<boolean>;
    vmDirectPathGen2Allowed: DVSPortSettingValue<boolean>;
    inShapingPolicy: {
      inherited: boolean;
      enabled: DVSPortSettingValue<boolean>;
      averageBandwidth: DVSPortSettingValue<stringNumber>;
      peakBandwidth: DVSPortSettingValue<stringNumber>;
      burstSize: DVSPortSettingValue<stringNumber>;
    };
    outShapingPolicy: {
      inherited: boolean;
      enabled: DVSPortSettingValue<boolean>;
      averageBandwidth: DVSPortSettingValue<stringNumber>;
      peakBandwidth: DVSPortSettingValue<stringNumber>;
      burstSize: DVSPortSettingValue<stringNumber>;
    };
    vendorSpecificConfig: DVSPortSettingValue;
    networkResourcePoolKey: DVSPortSettingValue<stringNumber>;
    filterPolicy: DVSPortSettingValue;
    vlan: { inherited: boolean; vlanId: number; };
    qosTag: DVSPortSettingValue<number>;
    uplinkTeamingPolicy: {
      inherited: boolean;
      policy: DVSPortSettingValue<string>;
      reversePolicy: DVSPortSettingValue<boolean>;
      notifySwitches: DVSPortSettingValue<boolean>;
      rollingOrder: DVSPortSettingValue<boolean>;
      failureCriteria: {
        inherited: boolean;
        checkSpeed: DVSPortSettingValue<string>;
        speed: DVSPortSettingValue<number>;
        checkDuplex: DVSPortSettingValue<boolean>;
        fullDuplex: DVSPortSettingValue<boolean>;
        checkErrorPercent: DVSPortSettingValue<boolean>;
        percentage: DVSPortSettingValue<number>;
        checkBeacon: DVSPortSettingValue<boolean>;
      };
      uplinkPortOrder: { inherited: boolean; activeUplinkPort: string[]; };
    };
    securityPolicy: {
      inherited: boolean;
      allowPromiscuous: DVSPortSettingValue<boolean>;
      macChanges: DVSPortSettingValue<boolean>;
      forgedTransmits: DVSPortSettingValue<boolean>;
    };
    ipfixEnabled: DVSPortSettingValue<boolean>;
    txUplink: DVSPortSettingValue<boolean>;
    lacpPolicy: {
      inherited: boolean;
      enable: DVSPortSettingValue<boolean>;
      mode: DVSPortSettingValue<string>;
    };
    macManagementPolicy: {
      inherited: boolean;
      allowPromiscuous: boolean;
      macChanges: boolean;
      forgedTransmits: boolean;
      macLearningPolicy: DVSPortSettingValue<boolean>;
    };
    VNI: DVSPortSettingValue<number>;
  };
  host: {
    runtimeState: { currentMaxProxySwitchPorts: number; };
    config: {
      host: moref;
      maxProxySwitchPorts: number;
      vendorSpecificConfig: { key: string; opaqueData: string; }[];
      backing: {
        _type: 'DistributedVirtualSwitchHostMemberPnicBacking';
        pnicSpec: {
          pnicDevice: string;
          uplinkPortKey: string;
          uplinkPortgroupKey: string;
          connectionCookie: number;
        }[];
      };
      nsxSwitch: boolean;
      ensEnabled: boolean;
      ensInterruptEnabled: boolean;
      transportZones: { uuid: uuid; type: string; }[];
      nsxtUsedUplinkNames: string[];
    };
    uplinkPortKey: uuid[];
    status: string;
  }[];
  productInfo: {
    name: string;
    vendor: string;
    version: string;
    build: string;
    forwardingClass: string;
  };
  extensionKey: string;
  vendorSpecificConfig: { key: string; opaqueData: string; }[]
  policy: {
    autoPreInstallAllowed: boolean;
    autoUpgradeAllowed: boolean;
    partialUpgradeAllowed: boolean;
  };
  configVersion: string;
  contact: { name: string; contact: string; };
  createTime: number;
  networkResourceManagementEnabled: boolean;
  defaultProxySwitchMaxNumPorts: number;
  healthCheckConfig: { _type: 'VMwareDVSTeamingHealthCheckConfig'; enable: boolean; interval: number; }[];
  infrastructureTrafficResourceConfig: {
    key: string; description: string;
    allocationInfo: { limit: stringNumber; shares: { shares: number; level: string; }; reservation: stringNumber; };
  }[];
  netResourcePoolTrafficResourceConfig: {
    key: string; description: string;
    allocationInfo: { limit: stringNumber; shares: { shares: number; level: string; }; reservation: stringNumber; };
  }[];
  networkResourceControlVersion: string;
  pnicCapacityRatioForReservation: number;
  maxMtu: number;
  linkDiscoveryProtocolConfig: { protocol: string; operation: string; };
  ipfixConfig: {
    collectorIpAddress: string;
    collectorPort: number;
    observationDomainId: string;
    activeFlowTimeout: number;
    idleFlowTimeout: number;
    samplingRate: number;
    internalFlowsOnly: boolean;
  };
  lacpApiVersion: string;
  multicastFilteringMode: string;
}

export class DVSRuntimeInfo {
  _type: 'DVSRuntimeInfo';
  hostMemberRuntime: {
    host: moref;
    status: string;
    statusDetail: string;
    nsxtStatus: string;
    nsxtStatusDetail: string;
  }[];
  resourceRuntimeInfo: {
    capacity: number;
    usage: number;
    available: number;
  }
}

export class DVSSummary {
  _type: 'DVSSummary';
  name: string;
  uuid: string;
  numPorts: number;
  productInfo: { name: string; vendor: string; version: string; build: string; forwardingClass: string; };
  hostMember: moref[];
  vm: moref[];
  host: moref[]
  portgroupName: string[];
  contact: { name: string; contact: string; };
  numHosts: number;
}
