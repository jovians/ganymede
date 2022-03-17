/*
 * Copyright 2014-2021 Jovian; all rights reserved.
 */
import { DatastoreSummary } from './mo.datastore.models';
import { MoBaseDetails, moref, morefg, uuid, stringNumber } from './mo.general';

export class HostFullDetails extends MoBaseDetails {
  capability: HostCapability;
  config: HostConfigInfo;
  configManager: HostConfigManager;
  datastore: moref[];
  datastoreSummary: DatastoreSummary[];
  hardware: HostHardware;
  network: moref[];
  licensableResource: HostLicensableResourceInfo;
  runtime: HostRuntimeInfo;
  summary: HostListSummary;
  systemResources: HostConfigResourceAllocTree;
  vm: moref[];
}

class HostCapability {
  _type: 'HostCapability';
  recursiveResourcePoolsSupported: boolean;
  cpuMemoryResourceConfigurationSupported: boolean;
  rebootSupported: boolean;
  shutdownSupported: boolean;
  vmotionSupported: boolean;
  standbySupported: boolean;
  ipmiSupported: boolean;
  maxRunningVMs: number;
  maxSupportedVcpus: number;
  maxRegisteredVMs: number;
  datastorePrincipalSupported: boolean;
  sanSupported: boolean;
  nfsSupported: boolean;
  iscsiSupported: boolean;
  vlanTaggingSupported: boolean;
  nicTeamingSupported: boolean;
  highGuestMemSupported: boolean;
  maintenanceModeSupported: boolean;
  suspendedRelocateSupported: boolean;
  restrictedSnapshotRelocateSupported: boolean;
  perVmSwapFiles: boolean;
  localSwapDatastoreSupported: boolean;
  unsharedSwapVMotionSupported: boolean;
  backgroundSnapshotsSupported: boolean;
  preAssignedPCIUnitNumbersSupported: boolean;
  screenshotSupported: boolean;
  scaledScreenshotSupported: boolean;
  storageVMotionSupported: boolean;
  vmotionWithStorageVMotionSupported: boolean;
  vmotionAcrossNetworkSupported: boolean;
  maxNumDisksSVMotion: number;
  hbrNicSelectionSupported: boolean;
  vrNfcNicSelectionSupported: boolean;
  recordReplaySupported: boolean;
  ftSupported: boolean;
  replayUnsupportedReason: string;
  smpFtSupported: boolean;
  ftCompatibilityIssues: string[];
  smpFtCompatibilityIssues: string[];
  maxVcpusPerFtVm: number;
  loginBySSLThumbprintSupported: boolean;
  cloneFromSnapshotSupported: boolean;
  deltaDiskBackingsSupported: boolean;
  perVMNetworkTrafficShapingSupported: boolean;
  tpmSupported: boolean;
  tpmVersion: string;
  txtEnabled: boolean;
  virtualExecUsageSupported: boolean;
  storageIORMSupported: boolean;
  vmDirectPathGen2Supported: boolean;
  supportedVmfsMajorVersion: number[];
  vStorageCapable: boolean;
  snapshotRelayoutSupported: boolean;
  firewallIpRulesSupported: boolean;
  servicePackageInfoSupported: boolean;
  maxHostRunningVms: number;
  maxHostSupportedVcpus: number;
  vmfsDatastoreMountCapable: boolean;
  eightPlusHostVmfsSharedAccessSupported: boolean;
  nestedHVSupported: boolean;
  vPMCSupported: boolean;
  interVMCommunicationThroughVMCISupported: boolean;
  scheduledHardwareUpgradeSupported: boolean;
  featureCapabilitiesSupported: boolean;
  latencySensitivitySupported: boolean;
  storagePolicySupported: boolean;
  accel3dSupported: boolean;
  reliableMemoryAware: boolean;
  multipleNetworkStackInstanceSupported: boolean;
  messageBusProxySupported: boolean;
  vsanSupported: boolean;
  vFlashSupported: boolean;
  hostAccessManagerSupported: boolean;
  provisioningNicSelectionSupported: boolean;
  nfs41Supported: boolean;
  nfs41Krb5iSupported: boolean;
  turnDiskLocatorLedSupported: boolean;
  virtualVolumeDatastoreSupported: boolean;
  markAsSsdSupported: boolean;
  markAsLocalSupported: boolean;
  smartCardAuthenticationSupported: boolean;
  pMemSupported: boolean;
  pMemSnapshotSupported: boolean;
  cryptoSupported: boolean;
  oneKVolumeAPIsSupported: boolean;
  gatewayOnNicSupported: boolean;
  cpuHwMmuSupported: boolean;
  encryptedVMotionSupported: boolean;
  encryptionChangeOnAddRemoveSupported: boolean;
  encryptionHotOperationSupported: boolean;
  encryptionWithSnapshotsSupported: boolean;
  encryptionFaultToleranceSupported: boolean;
  encryptionMemorySaveSupported: boolean;
  encryptionRDMSupported: boolean;
  encryptionVFlashSupported: boolean;
  encryptionCBRCSupported: boolean;
  encryptionHBRSupported: boolean;
  ftEfiSupported: boolean;
  unmapMethodSupported: string;
  maxMemMBPerFtVm: number;
  virtualMmuUsageIgnored: boolean;
  virtualExecUsageIgnored: boolean;
  vmCreateDateSupported: boolean;
  vmfs3EOLSupported: boolean;
  ftVmcpSupported: boolean;
  quickBootSupported: boolean;
  assignableHardwareSupported: boolean;
  useFeatureReqsForOldHWv: boolean;
  markPerenniallyReservedSupported: boolean;
  hppPspSupported: boolean;
  deviceRebindWithoutRebootSupported: boolean;
  storagePolicyChangeSupported: boolean;
  precisionTimeProtocolSupported: boolean;
  remoteDeviceVMotionSupported: boolean;
  maxSupportedVmMemory: number;
}

class HostConfigResourceAlloc {
  cpuAllocation: {
    reservation: string;
    expandableReservation: boolean;
    limit: string;
    shares: { shares: number; level: string; };
    overheadLimit: string;
  };
  memoryAllocation: {
    reservation: string;
    expandableReservation: boolean;
    limit: string;
    shares: { shares: number; level: string; };
    overheadLimit: string;
  };
}

class HostConfigResourceAllocTree {
  key: string;
  config: HostConfigResourceAlloc;
  child: HostConfigResourceAllocTree[];
}

class HostConfigOptionType<T=(string | number | boolean)> {
  _type: string;
  valueIsReadonly: boolean;
  defaultValue: T;
  supported?: boolean;
  min?: T;
  max?: T;
  choiceInfo?: { label: string; summary: string; key: string; }[];
  defaultIndex?: number;
}

class HostLicensableResourceInfo { _type: "HostLicensableResourceInfo"; resource: { key: string; value: any; }[]; }

class HostConfigManager {
  _type: "HostConfigManager";
  cpuScheduler: moref;
  datastoreSystem: moref;
  memoryManager: moref;
  storageSystem: moref;
  networkSystem: moref;
  vmotionSystem: moref;
  virtualNicManager: moref;
  serviceSystem: moref;
  firewallSystem: moref;
  advancedOption: moref;
  diagnosticSystem: moref;
  autoStartManager: moref;
  snmpSystem: moref;
  dateTimeSystem: moref;
  patchManager: moref;
  imageConfigManager: moref;
  firmwareSystem: moref;
  healthStatusSystem: moref;
  pciPassthruSystem: moref;
  kernelModuleSystem: moref;
  authenticationManager: moref;
  powerSystem: moref;
  cacheConfigurationManager: moref;
  esxAgentHostManager: moref;
  iscsiManager: moref;
  vFlashManager: moref;
  vsanSystem: moref;
  messageBusProxy: moref;
  userDirectory: moref;
  accountManager: moref;
  hostAccessManager: moref;
  graphicsManager: moref;
  vsanInternalSystem: moref;
  certificateManager: moref;
  cryptoManager: moref;
  assignableHardwareManager: moref;
}

class HostConfigProfuctInfo {
  name: string;
  fullName: string;
  vendor: string;
  version: string;
  build: string;
  localeVersion: string;
  localeBuild: string;
  osType: string;
  productLineId: string;
  apiType: string;
  apiVersion: string;
  licenseProductName: string;
  licenseProductVersion: string;
}

class HostNetworkPolicy {
  security: { allowPromiscuous: boolean; macChanges: boolean; forgedTransmits: boolean; };
  nicTeaming: {
    policy: string;
    reversePolicy: boolean;
    notifySwitches: boolean;
    rollingOrder: boolean;
    failureCriteria: {
      checkSpeed: string;
      speed: number;
      checkDuplex: boolean;
      fullDuplex: boolean;
      checkErrorPercent: boolean;
      percentage: number;
      checkBeacon: boolean;
    };
    nicOrder: { activeNic: string[]; };
  };
  offloadPolicy: { csumOffload: boolean; tcpSegmentation: boolean; zeroCopyXmit: boolean; };
  shapingPolicy: { enabled: boolean; }
}

class HostNetworkIpConfig {
  dhcp: boolean;
  ipAddress: string;
  subnetMask: string;
  ipV6Config: {
    ipV6Address: { ipAddress: string; prefixLength: number; origin: string; dadState: string; }[];
    autoConfigurationEnabled: boolean;
    dhcpV6Enabled: boolean;
  }
}

class HostVNicCandidate {
  device: string;
  key: string;
  portgroup: string;
  port: string;
  spec: {
    ip: HostNetworkIpConfig;
    mac: string;
    portgroup: string;
    mtu: number;
    tsoEnabled: boolean;
    netStackInstanceKey: string;
  };
}

class HostConfigInfo {
  _type: "HostConfigInfo";
  host: moref;
  product: HostConfigProfuctInfo;
  deploymentInfo: { bootedFromStatelessCache: boolean; };
  hyperThread: { available: boolean; active: boolean; config: boolean; };
  storageDevice: {
    hostBusAdapter: {
      _type: "HostSerialAttachedHba";
      key: string;
      device: string;
      bus: number;
      status: string;
      model: string;
      driver: string;
      pci: string;
      storageProtocol: string;
      nodeWorldWideName: string;
    }[];
    scsiLun: {
      _type: "HostScsiDisk";
      deviceName: string;
      deviceType: string;
      key: string;
      uuid: string;
      descriptor: { quality: string; id: string; }[];
      canonicalName: string;
      displayName: string;
      lunType: string;
      vendor: string;
      model: string;
      revision: string;
      scsiLevel: number;
      serialNumber: string;
      durableName: { namespace: string; namespaceId: string; data: number[]; };
      alternateName: { namespace: string; namespaceId: string; data: number[]; }[];
      standardInquiry: number[];
      queueDepth: number;
      operationalState: string[];
      capabilities: { updateDisplayNameSupported: boolean; };
      vStorageSupport: string;
      protocolEndpoint: boolean;
      perenniallyReserved: boolean;
      clusteredVmdkSupported: boolean;
      capacity: { blockSize: number; block: string; };
      devicePath: string;
      ssd: boolean;
      localDisk: boolean;
      emulatedDIXDIFEnabled: boolean;
      scsiDiskType: string;
    }[];
    scsiTopology: {
      adapter: {
        key: string;
        adapter: string;
        target?: {
          key: string;
          target: number;
          lun: { key: string; lun: number; scsiLun: string; }[];
          transport: { _type: "HostSerialAttachedTargetTransport" };
        }[];
      }[];
    };
    nvmeTopology: {
      adapter: {
        key: string;
        adapter: string;
        connectedController: {
          key: string;
          controllerNumber: number;
          subnqn: string;
          name: string;
          associatedAdapter: string;
          transportType: string;
          fusedOperationSupported: boolean;
          numberOfQueues: number;
          queueSize: number;
          attachedNamespace:{
            key: string;
            name: string;
            id: number;
            blockSize: number;
            capacityInBlocks: stringNumber;
          }[];
          vendorId: string;
          model: string;
          serialNumber: string;
          firmwareVersion: string;
        }[];
      }[];
    };
    multipathInfo: {
      lun: {
        key: string;
        id: string;
        lun: string;
        path: {
          key: string;
          name: string;
          pathState: string;
          state: string;
          isWorkingPath: boolean;
          adapter: string;
          lun: string;
          transport: { _type: "HostBlockAdapterTargetTransport" };
        }[];
        policy: { _type: "HostMultipathInfoHppLogicalUnitPolicy"; policy: string; path: string; };
      }[];
    };
    plugStoreTopology: {
        adapter: { key: string; adapter: string; path: string[]; }[];
        path: {
          key: string; name: string;
          channelNumber: number; targetNumber: number; lunNumber: number;
          adapter: string; target: string; device: string;
        }[];
        target: { key: string; transport: { _type: "HostSerialAttachedTargetTransport" }; }[];             
        device: { key: string; lun: string; path: string[]; }[];
        plugin: { key: string; name: string; device?: string[]; claimedPath?: string[]; }[];
    };
    softwareInternetScsiEnabled: boolean;
  };
  multipathState: { path: {name: string; pathState: string; }[]; };
  fileSystemVolume: {
    volumeTypeList: string[];
    mountInfo: {
      mountInfo: { path: string; accessMode: string; mounted: boolean; accessible: boolean; };
      volume: {
        _type: "HostVmfsVolume";
        type: string;
        name: string;
        capacity: string;
        blockSizeMb: number;
        blockSize: number;
        unmapGranularity: number;
        unmapPriority: string;
        maxBlocks: number;
        majorVersion: number;
        version: string;
        uuid: string;
        extent: { diskName: string; partition: number; }[];
        vmfsUpgradable: boolean;
        ssd: boolean;
        local: boolean;
      };
      vStorageSupport: string;
    }[];
  };
  network: {
    vswitch: {
      name: string;
      key: string;
      numPorts: number;
      numPortsAvailable: number;
      mtu: number;
      portgroup: string[];
      pnic: string[];
      spec: {
        numPorts: number;
        bridge: {
          _type: "HostVirtualSwitchBondBridge";
          nicDevice: string[];
          beacon: { interval: number; };
          linkDiscoveryProtocolConfig: { protocol: string; operation: string; };
        };
        policy: HostNetworkPolicy;
      }
    }[];
    portgroup: {
      key: string;
      vswitch: string;
      computedPolicy: HostNetworkPolicy;
      spec: {
        name: string;
        vlanId: number;
        vswitchName: string;
        policy: HostNetworkPolicy;
      }
    }[];
    pnic: {
      key: string;
      device: string;
      pci: string;
      driver: string;
      validLinkSpecification: { speedMb: number; duplex: boolean; }[];
      spec: {
        ip: { dhcp: boolean; ipAddress: string; subnetMask: string; };
        enableEnhancedNetworkingStack: boolean;
        ensInterruptEnabled: boolean;
      };
      wakeOnLanSupported: boolean;
      mac: string;
      fcoeConfiguration: {
        priorityClass: number;
        sourceMac: string;
        vlanRange: { vlanLow: number; vlanHigh: number; }[];
        capabilities: {
          priorityClass: boolean;
          sourceMacAddress: boolean;
          vlanRange: boolean;
        };
        fcoeActive: boolean;
      };
      vmDirectPathGen2Supported: boolean;
      resourcePoolSchedulerAllowed: boolean;
      autoNegotiateSupported: boolean;
      enhancedNetworkingStackSupported: boolean;
      ensInterruptSupported: boolean;
    }[];
    rdmaDevice: {
      key: string;
      device: string;
      driver: string;
      description: string;
      backing: { _type: 'HostRdmaDevicePnicBacking'; pairedUplink: string; };
      connectionInfo: { state: string; mtu: number; speedInMbps: number; };
      capability: { roceV1Capable: boolean; roceV2Capable: boolean; iWarpCapable: boolean; };
    }[];
    vnic: HostVNicCandidate[];
    dnsConfig: {
      dhcp: boolean; virtualNicDevice: string; hostName: string;
      domainName: string; address: string[]; searchDomain: string[];
    };
    ipRouteConfig: { defaultGateway: string; gatewayDevice: string; ipV6DefaultGateway: string; ipV6GatewayDevice: string; };
    routeTableInfo: {
      ipRoute: { network: string; prefixLength: number; gateway: string; deviceName: string; }[];
      ipv6Route: { network: string; prefixLength: number; gateway: string; deviceName: string; }[];
    };
    ipV6Enabled: boolean;
    atBootIpV6Enabled: boolean;
    netStackInstance: {
      key: string;
      dnsConfig: {
        dhcp: boolean; virtualNicDevice: string; hostName: string;
        domainName: string; address: string[]; searchDomain: string[];
      };
      ipRouteConfig: { defaultGateway: string; gatewayDevice: string; ipV6DefaultGateway: string; ipV6GatewayDevice: string; };
      requestedMaxNumberOfConnections: number;
      congestionControlAlgorithm: string;
      ipV6Enabled: boolean;
      routeTableConfig: {
        ipRoute: { changeOperation: string; route: { network: string; prefixLength: number; gateway: string; deviceName: string; } }[];
        ipv6Route: { changeOperation: string; route: { network: string; prefixLength: number; gateway: string; deviceName: string; } }[];
      };
    }[];
    nsxTransportNodeId: string;
  };
  vmotion: {
    netConfig: { candidateVnic: HostVNicCandidate[]; selectedVnic: string };
    ipConfig: HostNetworkIpConfig;
  };
  virtualNicManagerInfo: {
    netConfig: {
      nicType: string;
      multiSelectAllowed: boolean;
      candidateVnic: HostVNicCandidate[];
      selectedVnic: string[];
    }[];
  };
  capabilities: {
    canSetPhysicalNicLinkSpeed: boolean;
    supportsNicTeaming: boolean;
    nicTeamingPolicy: string[];
    supportsVlan: boolean;
    usesServiceConsoleNic: boolean;
    supportsNetworkHints: boolean;
    vswitchConfigSupported: boolean;
    vnicConfigSupported: boolean;
    ipRouteConfigSupported: boolean;
    dnsConfigSupported: boolean;
    dhcpOnVnicSupported: boolean;
    ipV6Supported: boolean;
    backupNfcNiocSupported: boolean;
  };
  datastoreCapabilities: {
    nfsMountCreationRequired: boolean;
    nfsMountCreationSupported: boolean;
    localDatastoreSupported: boolean;
    vmfsExtentExpansionSupported: boolean;
  };
  offloadCapabilities: {
    csumOffload: boolean;
    tcpSegmentation: boolean;
    zeroCopyXmit: boolean;
  };
  service: {
    service: {
      key: string;
      label: string;
      required: boolean;
      uninstallable: boolean;
      running: boolean;
      policy: string;
      sourcePackage: { sourcePackageName: string; description: string; };
    }[];
  };
  firewall: {
    defaultPolicy: { incomingBlocked: boolean; outgoingBlocked: boolean; };
    ruleset: {
      key: string;
      label: string;
      required: boolean;
      rule: { port: string; direction: string; portType: string; protocol: string; }[];
      service: string;
      enabled: boolean;
      allowedHosts: { allIp: boolean; };
    }[];
  };
  autoStart: {
    defaults: { startDelay: number; stopDelay: number; waitForHeartbeat: boolean; stopAction: string; };
  };
  option: { key: string; value: (string | number | boolean); }[];
  optionDef: { label: string; summary: string; key: string; optionType: HostConfigOptionType; }[];
  datastorePrincipal: string;
  systemSwapConfiguration: { option: { _type: string; key: number; }[]; };
  systemResources: HostConfigResourceAllocTree;
  dateTimeInfo: {
    timeZone: { key: string; name: string; description: string; gmtOffset: number; };
    systemClockProtocol: string;
    ntpConfig: { server: string[]; configFile: string[]; }
  };
  flags: any[];
  adminDisabled: boolean;
  lockdownMode: string;
  certificate: string;
  pciPassthruInfo: {
    id: string;
    dependentDevice: string;
    passthruEnabled: boolean;
    passthruCapable: boolean;
    passthruActive: boolean
  }[];
  authenticationManagerInfo: {
    authConfig: { _type: string; enabled: boolean; smartCardAuthenticationEnabled: boolean; }[];
  };
  powerSystemCapability: {
    availablePolicy: { key: number; name: string; shortName: string; description: string; }[];
  };
  powerSystemInfo: {
    currentPolicy: { key: number; name: string; shortName: string; description: string; }[];
  };
  cacheConfigurationInfo: { key: moref; swapSize: string; }[];
  wakeOnLanCapable: boolean;
  featureCapability: { key: string; featureName: string; value: string; }[];
  maskedFeatureCapability: { key: string; featureName: string; value: string; }[];
  vFlashConfigInfo: {
    vFlashResourceConfigInfo: {
      vffs: {
        type: string;
        name: string;
        capacity: stringNumber
        majorVersion: number;
        version: string;
        uuid: uuid;
        extent: { diskName: string; partition: number; }[];
      };
      capacity: stringNumber;
    };
    vFlashCacheConfigInfo: { defaultVFlashModule: string; swapCacheReservationInGB: string; };
  };
  vsanHostConfig: {
    enabled: boolean;
    hostSystem: moref;
    clusterInfo: { uuid: string; nodeUuid: string; };
    storageInfo: { autoClaimStorage: boolean; };
    networkInfo: { port: { device: string; ipConfig: { upstreamIpAddress: string;  downstreamIpAddress: string; }; }[]; };
    faultDomainInfo: { name: string; };
  };
  scriptCheckSum: string;
  hostConfigCheckSum: string;
  descriptionTreeCheckSum: string;
  graphicsConfig: { hostDefaultGraphicsType: string; sharedPassthruAssignmentPolicy: string; };
  ioFilterInfo: {
    id: string;
    name: string;
    vendor: string;
    version: string;
    type: string;
    summary: string;
    releaseDate: string;
    available: boolean;
  }[];
  assignableHardwareConfig: { instanceId: string; name: string; value: any; };
};

class HostHardware {
  _type: "HostHardwareInfo";
  systemInfo: {
    vendor: string; model: string; uuid: string;
    otherIdentifyingInfo: { identifierValue: string; identifierType: { label: string; summary: string; key: string; }; }[];
  };
  cpuPowerManagementInfo: { currentPolicy: string; hardwareSupport: string; };
  cpuInfo: { numCpuPackages: number; numCpuCores: number; numCpuThreads: number; hz: stringNumber; };
  cpuPkg: {
    index: number;
    vendor: string;
    hz: stringNumber;
    busHz: stringNumber;
    description: string;
    threadId: number[];
    cpuFeature: { level: number; eax: string; ebx: string; ecx: string; edx: string; }[];
  }[];
  memorySize: stringNumber;
  numaInfo: {
      type: string;
      numNodes: number;
      numaNode: {
        typeId: stringNumber;
        cpuID: number[];
        memoryRangeBegin: stringNumber;
        memoryRangeLength: stringNumber;
        pciId: string[];
      }[];
  };
  smcPresent: boolean;
  pciDevice: {
    id: string;
    classId: number;
    bus: stringNumber;
    slot: stringNumber;
    function: stringNumber;
    vendorId: number;
    subVendorId: number;
    vendorName: string;
    deviceId: number;
    subDeviceId: number;
    deviceName: string;
  }[];
  cpuFeature: { level: number; eax: string; ebx: string; ecx: string; edx: string; }[];
  biosInfo: { biosVersion: string; releaseDate: number; };
  sgxInfo: { sgxState: string; totalEpcMemory: stringNumber; flcMode: string; };
}

class HostStatusInfo {
  hardwareStatusInfo: {
    cpuStatusInfo: { name: string; status: { key: string; label: string; summary: string; }; }[];
    memoryStatusInfo: { name: string; status: { key: string; label: string; summary: string; }; }[];
    storageStatusInfo: {
      name: string; status: { key: string; label: string; summary: string; };
      operationalInfo: { property: string; value: string }[];
    }[];
  };
  systemHealthInfo: {
    numericSensorInfo: {
      baseUnits: string;
      currentReading: number;
      healthState: { key: string; label: string; summary: string; };
      id: string;
      name: string;
      rateUnits: string;
      sensorType: string;
      timeStamp: string;
      unitModifier: number;
    }[];
  };
}

class HostNetworkRuntimeInfo {
  netStackInstanceRuntimeInfo: {
    netStackInstanceKey: string;
    state: string;
    vmknicKeys: string[];
    maxNumberOfConnections: number;
    currentIpV6Enabled: boolean
  }[];
  networkResourceRuntime: {
    pnicResourceInfo: {
      pnicDevice: string;
      availableBandwidthForVMTraffic: stringNumber;
      unusedBandwidthForVMTraffic: stringNumber;
    }[];
  }
}

class HostVFlashResourceRuntimeInfo {
  usage: stringNumber;
  capacity: stringNumber;
  accessible: boolean;
  capacityForVmCache: stringNumber;
  freeForVmCache: stringNumber;
}

class HostRuntimeInfo {
  _type: "HostRuntimeInfo";
  connectionState: string;
  powerState: string;
  standbyMode: string;
  inMaintenanceMode: boolean;
  inQuarantineMode: boolean;
  bootTime: number;
  healthSystemRuntime: HostStatusInfo;
  dasHostState: { state: string; };
  vsanRuntimeInfo: { membershipList: { nodeUuid: uuid; hostname: string; }[]; };
  networkRuntimeInfo: HostNetworkRuntimeInfo;
  vFlashResourceRuntimeInfo: HostVFlashResourceRuntimeInfo;
  hostMaxVirtualDiskCapacity: stringNumber;
  cryptoState: string;
  cryptoKeyId: { keyId: string; providerId: { id: string; }; };
};


class HostListSummary {
  _type: "HostListSummary";
  host: moref;
  hardware: {
    vendor: string;
    model: string;
    uuid: uuid;
    otherIdentifyingInfo: { identifierValue: string; identifierType: { label: string; summary: string; key: string; }; }[];
    memorySize: stringNumber;
    cpuModel: string;
    cpuMhz: number;
    numCpuPkgs: number;
    numCpuCores: number;
    numCpuThreads: number;
    numNics: number;
    numHBAs: number;
  };
  runtime: {
    connectionState: number;
    powerState: number;
    standbyMode: number;
    inMaintenanceMode: boolean;
    inQuarantineMode: boolean;
    bootTime: number;
    healthSystemRuntime: HostStatusInfo;
    dasHostState: { state: string; };
    vsanRuntimeInfo: { membershipList: { nodeUuid: uuid; hostname: string; }[]; };
    networkRuntimeInfo: HostNetworkRuntimeInfo;
    vFlashResourceRuntimeInfo: HostVFlashResourceRuntimeInfo;
    hostMaxVirtualDiskCapacity: stringNumber;
    cryptoState: string;
  };
  config: {
    name: string;
    port: number;
    sslThumbprint: string;
    product: HostConfigProfuctInfo;
    vmotionEnabled: boolean;
    faultToleranceEnabled: boolean;
  };
  quickStats: {
    overallCpuUsage: number;
    overallMemoryUsage: number;
    distributedCpuFairness: number;
    distributedMemoryFairness: number;
    availablePMemCapacity: number;
    uptime: number;
  };
  overallStatus: string;
  rebootRequired: boolean;
  managementServerIp: string;
  maxEVCModeKey: string;
}
