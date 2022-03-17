/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { MoBaseDetails, moref, stringNumber } from './mo.general';
import { ResourceConfigSpec } from './mo.respool.models';

export class VirtualMachineFullDetails extends MoBaseDetails {
  $registeredIP: string;
  capability: VirtualMachineCapability;
  config: VirtualMachineConfig;
  datastore: moref[];
  guest: GuestInfo;
  guestHeartbeatStatus: string;
  layout: VirtualMachineFileLayout;
  network: moref[];
  resourceConfig: ResourceConfigSpec; 
  resourcePool: moref;
  runtime: VirtualMachineRuntimeInfo;
  storage: VirtualMachineStorageInfo;
  summary: VirtualMachineSummary;
}

type VirtualMachineHardwareDevice = (
  VirtualIDEController |
  VirtualPS2Controller |
  VirtualPCIController |
  VirtualSIOController |
  VirtualKeyboard |
  VirtualPointingDevice |
  VirtualMachineVideoCard |
  VirtualMachineVMCIDevice |
  ParaVirtualSCSIController |
  VirtualAHCIController |
  VirtualCdrom |
  VirtualDisk |
  VirtualVmxnet3
);
class VirtualDeviceBackingInfo<_type=string> {
  _type: _type;
}

class VirtualDevice<_type=string, _backing extends VirtualDeviceBackingInfo=VirtualDeviceBackingInfo> {
  _type: _type;
  key: number;
  backing: _backing;
  connectable: {
    migrateConnect: string;
    startConnected: boolean;
    allowGuestControl: boolean;
    connected: boolean;
    status: string;
  };
  deviceInfo: { label: string; summary: string; };
  slotInfo: { pciSlotNumber: number; };
  controllerKey: number;
  unitNumber: number;
};
class VirtualController<_type=string> extends VirtualDevice<_type> {
  busNumber: number;
  device: number[];
}
class VirtualIDEController extends VirtualController<'VirtualIDEController'> {}
class VirtualNVDIMMController extends VirtualController<'VirtualNVDIMMController'> {}
class VirtualNVMEController extends VirtualController<'VirtualNVMEController'> {}
class VirtualPCIController extends VirtualController<'VirtualPCIController'> {}
class VirtualPS2Controller extends VirtualController<'VirtualPS2Controller'> {}
class VirtualSATAController extends VirtualController<'VirtualSATAController'> {}
class VirtualSCSIController<_type = 'VirtualSCSIController'> extends VirtualController<_type> {
  hotAddRemove: boolean;
  sharedBus: string;
  scsiCtlrUnitNumber: number;
}
class VirtualSIOController extends VirtualController<'VirtualSIOController'> {}
class VirtualUSBController extends VirtualController<'VirtualUSBController'> {}
class VirtualUSBXHCIController extends VirtualController<'VirtualUSBXHCIController'> {}
class ParaVirtualSCSIController extends VirtualSCSIController<'ParaVirtualSCSIController'> {}
class VirtualAHCIController extends VirtualController<'VirtualAHCIController'> {}
export class VirtualKeyboard extends VirtualDevice<'VirtualKeyboard'> {}
export class VirtualPointingDevice extends VirtualDevice<'VirtualPointingDevice', VirtualDeviceBackingInfo<'VirtualPointingDeviceDeviceBackingInfo'>> {}
export class VirtualMachineVideoCard extends VirtualDevice<'VirtualMachineVideoCard'> {
  videoRamSizeInKB: stringNumber;
  numDisplays: number;
  useAutoDetect: boolean;
  enable3DSupport: boolean;
  use3dRenderer: string;
  graphicsMemorySizeInKB: stringNumber;
}
class VirtualMachineVMCIDevice extends VirtualDevice<'VirtualMachineVMCIDevice'> {
  id: string;
  allowUnrestrictedCommunication: boolean;
  filterEnable: boolean;
}
export class VirtualCdrom extends VirtualDevice<'VirtualCdrom',
  VirtualDeviceBackingInfo<
    'VirtualDeviceRemoteDeviceBackingInfo' |
    'VirtualCdromRemoteAtapiBackingInfo' |
    'VirtualCdromPassthroughBackingInfo'>
> {}

export class VirtualDisk extends VirtualDevice<'VirtualDisk', VirtualDiskFlatVer2BackingInfo> {
  capacityInKB: string;
  capacityInBytes: string;
  shares: { shares: number; level: string; };
  storageIOAllocation: {
      limit: stringNumber;
      shares: { shares: number; level: string; };
      reservation: number;
  };
  diskObjectId: string;
  nativeUnmanagedLinkedClone: boolean;
}
class VirtualDiskFlatVer2BackingInfo extends VirtualDeviceBackingInfo<'VirtualDiskFlatVer2BackingInfo'> {
  fileName: string;
  datastore: moref;
  backingObjectId: string;
  diskMode: string;
  split: boolean;
  writeThrough: boolean;
  thinProvisioned: boolean;
  eagerlyScrub: boolean;
  uuid: SVGStringList;
  contentId: string;
  digestEnabled: boolean;
  sharing: string;
}
export class VirtualEthernetCard<_type=string, _backing extends VirtualDeviceBackingInfo=VirtualDeviceBackingInfo> extends VirtualDevice<_type, _backing> {
  addressType: string;
  externalId: string;
  macAddress: string;
  resourceAllocation: {
      reservation: stringNumber;
      share: { shares: number; level: string; };
      limit: stringNumber;
  };
  uptCompatibilityEnabled: boolean;
  wakeOnLanEnabled: boolean;
}
export class VirtualEthernetCardNetworkBackingInfo extends VirtualDeviceBackingInfo<'VirtualEthernetCardNetworkBackingInfo'> {
  deviceName: string;
  useAutoDetect: false;
  network: moref;
}
export class VirtualEthernetCardDistributedVirtualPortBackingInfo extends VirtualDeviceBackingInfo<'VirtualEthernetCardDistributedVirtualPortBackingInfo'> {
  port: {
    connectionCookie: number;
    portgroupKey: string;
    portKey: string;
    switchUuid: string;
  };
}
class VirtualVmxnet2 extends VirtualEthernetCard<'VirtualVmxnet2', VirtualEthernetCardNetworkBackingInfo> {}
export class VirtualVmxnet3 extends VirtualEthernetCard<'VirtualVmxnet3', VirtualEthernetCardNetworkBackingInfo> {}

class VirtualMachineCapability {
  _type: 'VirtualMachineCapability';
  snapshotOperationsSupported: boolean;
  multipleSnapshotsSupported: boolean;
  snapshotConfigSupported: boolean;
  poweredOffSnapshotsSupported: boolean;
  memorySnapshotsSupported: boolean;
  revertToSnapshotSupported: boolean;
  quiescedSnapshotsSupported: boolean;
  disableSnapshotsSupported: boolean;
  lockSnapshotsSupported: boolean;
  consolePreferencesSupported: boolean;
  cpuFeatureMaskSupported: boolean;
  s1AcpiManagementSupported: boolean;
  settingScreenResolutionSupported: boolean;
  toolsAutoUpdateSupported: boolean;
  vmNpivWwnSupported: boolean;
  npivWwnOnNonRdmVmSupported: boolean;
  vmNpivWwnDisableSupported: boolean;
  vmNpivWwnUpdateSupported: boolean;
  swapPlacementSupported: boolean;
  toolsSyncTimeSupported: boolean;
  virtualMmuUsageSupported: boolean;
  diskSharesSupported: boolean;
  bootOptionsSupported: boolean;
  bootRetryOptionsSupported: boolean;
  settingVideoRamSizeSupported: boolean;
  settingDisplayTopologySupported: boolean;
  recordReplaySupported: boolean;
  changeTrackingSupported: boolean;
  multipleCoresPerSocketSupported: boolean;
  hostBasedReplicationSupported: boolean;
  guestAutoLockSupported: boolean;
  memoryReservationLockSupported: boolean;
  featureRequirementSupported: boolean;
  poweredOnMonitorTypeChangeSupported: boolean;
  seSparseDiskSupported: boolean;
  nestedHVSupported: boolean;
  vPMCSupported: boolean;
  secureBootSupported: boolean;
  perVmEvcSupported: boolean;
  virtualMmuUsageIgnored: boolean;
  virtualExecUsageIgnored: boolean;
  diskOnlySnapshotOnSuspendedVMSupported: boolean;
  toolsSyncTimeAllowSupported: boolean;
  sevSupported: boolean;
}

class VirtualMachineConfig {
  _type: 'VirtualMachineConfigInfo';
  changeVersion: number;
  modified: number;
  name: string;
  guestFullName: string;
  version: string;
  uuid: string;
  createDate: number;
  instanceUuid: string;
  npivTemporaryDisabled: boolean;
  locationId: string;
  template: boolean;
  guestId: string;
  alternateGuestName: string;
  annotation: string;
  files: {
      vmPathName: string;
      snapshotDirectory: string;
      suspendDirectory: string;
      logDirectory: string;
  };
  tools: {
      toolsVersion: number;
      toolsInstallType: string;
      afterPowerOn: boolean;
      afterResume: boolean;
      beforeGuestStandby: boolean;
      beforeGuestShutdown: boolean;
      toolsUpgradePolicy: string;
      syncTimeWithHostAllowed: boolean;
      syncTimeWithHost: boolean;
      lastInstallInfo: { counter: number; }
  };
  flags: {
      disableAcceleration: boolean;
      enableLogging: boolean;
      useToe: boolean;
      runWithDebugInfo: boolean;
      monitorType: string;
      htSharing: string;
      snapshotDisabled: boolean;
      snapshotLocked: boolean;
      diskUuidEnabled: boolean;
      virtualMmuUsage: string;
      virtualExecUsage: string;
      snapshotPowerOffBehavior: string;
      recordReplayEnabled: boolean;
      faultToleranceType: string;
      cbrcCacheEnabled: boolean;
      vvtdEnabled: boolean;
      vbsEnabled: boolean
  };
  defaultPowerOps: {
      powerOffType: string;
      suspendType: string;
      resetType: string;
      defaultPowerOffType: string;
      defaultSuspendType: string;
      defaultResetType: string;
      standbyAction: string;
  };
  hardware: {
      numCPU: number;
      numCoresPerSocket: number;
      memoryMB: number;
      virtualICH7MPresent: boolean;
      virtualSMCPresent: boolean;
      device: VirtualMachineHardwareDevice[];
  };
  cpuAllocation: {
      reservation: number;
      expandableReservation: boolean;
      limit: stringNumber;
      shares: { shares: number; level: string; }
  };
  memoryAllocation: {
      reservation: number;
      expandableReservation: boolean;
      limit: stringNumber;
      shares: { shares: number; level: string; };
      overheadLimit: stringNumber;
  };
  latencySensitivity: { level: string; };
  memoryHotAddEnabled: boolean;
  cpuHotAddEnabled: boolean;
  cpuHotRemoveEnabled: boolean;
  hotPlugMemoryLimit: stringNumber;
  hotPlugMemoryIncrementSize: stringNumber;
  extraConfig: { key: string; value: string; }[];
  datastoreUrl: { name: string; url: string; }[];
  swapPlacement: string;
  bootOptions: {
      bootDelay: stringNumber;
      enterBIOSSetup: boolean;
      efiSecureBootEnabled: boolean;
      bootRetryEnabled: boolean;
      bootRetryDelay: stringNumber;
      networkBootProtocol: string;
  };
  vAppConfig: {
      product: {
        key: number;
        classId: string;
        instanceId: string;
        name: string;
        vendor: string;
        version: string;
        fullVersion: string;
        vendorUrl: string;
        productUrl: string;
        appUrl: string;
      }[];
      property: {
        key: number;
        classId: string;
        instanceId: string;
        id: string;
        category: string;
        label: string;
        type: string;
        typeReference: string
        userConfigurable: boolean;
        defaultValue: string
        value: string;
        description: string;
      }[];
      ipAssignment: {
          ipAllocationPolicy: string;
          supportedIpProtocol: string[];
          ipProtocol: string;
      };
      ovfEnvironmentTransport: string[];
      installBootRequired: boolean;
      installBootStopDelay: number;
  };
  vAssertsEnabled: boolean;
  changeTrackingEnabled: boolean;
  firmware: string;
  maxMksConnections: number;
  guestAutoLockEnabled: boolean;
  memoryReservationLockedToMax: boolean;
  initialOverhead: {
      initialMemoryReservation: stringNumber;
      initialSwapReservation: stringNumber;
  };
  nestedHVEnabled: boolean;
  vPMCEnabled: boolean;
  scheduledHardwareUpgradeInfo: {
      upgradePolicy: string;
      scheduledHardwareUpgradeStatus: string;
  };
  vmxConfigChecksum: string;
  messageBusTunnelEnabled: boolean;
  guestIntegrityInfo: { enabled: boolean; };
  migrateEncryption: string;
  sgxInfo: { epcSize: stringNumber; flcMode: string; };
  guestMonitoringModeInfo: null;
  sevEnabled: boolean
}

class GuestInfo {
  _type: 'GuestInfo';
  toolsStatus: string;
  toolsVersionStatus: string;
  toolsVersionStatus2: string;
  toolsRunningStatus: string;
  toolsVersion: number;
  toolsInstallType: string;
  guestId: string;
  guestFamily: string;
  guestFullName: string;
  hostName: string;
  ipAddress: string;
  net: {
    network: string;
    ipAddress: string[];
    macAddress: string;
    connected: boolean;
    deviceConfigId: number;
    ipConfig: {
        ipAddress: {
            ipAddress: string;
            prefixLength: number;
            state: string;
        }[];   
    }
  }[];
  ipStack: {
    dnsConfig: {
      dhcp: boolean;
      hostName: string;
      domainName: string;
      ipAddress: string[];
      searchDomain: string[];
    };
    ipRouteConfig: {
      ipRoute: {
        network: string;
        prefixLength: number;
        gateway: { ipAddress: string; device: stringNumber; };
      }[];
    }
  }[];
  disk: {
      diskPath: string;
      capacity: stringNumber;
      freeSpace: stringNumber;
      filesystemType: string;
      mappings:  { key: number; }[];
  }[];
  screen: { width: number; height: number; };
  guestState: string;
  appHeartbeatStatus: string;
  guestKernelCrashed: boolean;
  appState: string;
  guestOperationsReady: boolean;
  interactiveGuestOperationsReady: boolean;
  guestStateChangeSupported: boolean;
  hwVersion: string
}

class VirtualMachineFileLayout {
  _type: 'VirtualMachineFileLayout';
  configFile: string[];
  logFile: string[];
  disk: { key: number; diskFile: string; }[];
  swapFile: string;
}

class VirtualMachineRuntimeInfo {
  _type: 'VirtualMachineRuntimeInfo';
  device: {
    runtimeState: {
      _type: 'VirtualMachineDeviceRuntimeInfoVirtualEthernetCardRuntimeState';
      vmDirectPathGen2Active: boolean;
      vmDirectPathGen2InactiveReasonOther: string[];
      attachmentStatus: string;
    };
    key: number;
  }[];
  host: moref;
  connectionState: string;
  powerState: string;
  faultToleranceState: string;
  toolsInstallerMounted: boolean;
  bootTime: number;
  suspendInterval: stringNumber;
  maxCpuUsage: number;
  maxMemoryUsage: number;
  numMksConnections: number;
  recordReplayState: string;
  onlineStandby: boolean;
  consolidationNeeded: boolean;
  offlineFeatureRequirement: { key: string; featureName: string; value: string; }[];
  featureRequirement: { key: string; featureName: string; value: string; }[];
  paused: boolean;
  snapshotInBackground: boolean;
  instantCloneFrozen: boolean
}

class VirtualMachineStorageInfo {
  _type: 'VirtualMachineStorageInfo';
  perDatastoreUsage: {
      datastore: moref;
      committed: stringNumber;
      uncommitted: stringNumber;
      unshared: stringNumber;
  }[];
  timestamp: number
}

class VirtualMachineSummary {
  _type: "VirtualMachineSummary";
  runtime: {
      device: {
          runtimeState: {
              _type: "VirtualMachineDeviceRuntimeInfoVirtualEthernetCardRuntimeState";
              vmDirectPathGen2Active: boolean;
              vmDirectPathGen2InactiveReasonOther: string;
              attachmentStatus: string;
          };
          key: number;
      }[];
      host: moref;
      connectionState: string;
      powerState: string;
      faultToleranceState: string;
      dasVmProtection: { dasProtected: boolean; };
      toolsInstallerMounted: boolean;
      bootTime: number;
      suspendInterval: stringNumber;
      maxCpuUsage: number;
      maxMemoryUsage: number;
      numMksConnections: number;
      recordReplayState: string;
      onlineStandby: boolean;
      minRequiredEVCModeKey: string;
      consolidationNeeded: boolean;
      offlineFeatureRequirement: { key: string; featureName: string; value: string; }[];
      featureRequirement: { key: string; featureName: string; value: string; }[];
      paused: boolean;
      snapshotInBackground: boolean;
      instantCloneFrozen: boolean
  };
  guest: {
      guestId: string;
      guestFullName: string;
      toolsStatus: string;
      toolsVersionStatus: string;
      toolsVersionStatus2: string;
      toolsRunningStatus: string;
      hostName: string;
      ipAddress: string;
      hwVersion: string
  };
  config: {
      name: string;
      template: boolean;
      vmPathName: string;
      memorySizeMB: number;
      cpuReservation: number;
      memoryReservation: number;
      numCpu: number;
      numEthernetCards: number;
      numVirtualDisks: number;
      uuid: string;
      instanceUuid: string;
      guestId: string;
      guestFullName: string;
      annotation: string;
      product: {
          key: number;
          classId: string;
          instanceId: string;
          name: string;
          vendor: string;
          version: string;
          fullVersion: string;
          vendorUrl: string;
          productUrl: string;
          appUrl: string
      };
      installBootRequired: boolean;
      tpmPresent: boolean;
      numVmiopBackings: number;
      hwVersion: string;
  };
  storage: {
      committed: stringNumber;
      uncommitted: stringNumber;
      unshared: stringNumber;
      timestamp: number
  };
  quickStats: {
      overallCpuUsage: number;
      overallCpuDemand: number;
      overallCpuReadiness: number;
      guestMemoryUsage: number;
      hostMemoryUsage: number;
      guestHeartbeatStatus: string;
      distributedCpuEntitlement: number;
      distributedMemoryEntitlement: number;
      staticCpuEntitlement: number;
      staticMemoryEntitlement: number;
      grantedMemory: number;
      privateMemory: number;
      sharedMemory: number;
      swappedMemory: number;
      balloonedMemory: number;
      consumedOverheadMemory: number;
      ftLogBandwidth: number;
      ftSecondaryLatency: number;
      ftLatencyStatus: string;
      compressedMemory: stringNumber;
      uptimeSeconds: number;
      ssdSwappedMemory: stringNumber
  };
  overallStatus: string;
  customValue: { _type: "CustomFieldStringValue", key: number; value: string; }[];
}

export const virtualMachineHardwareVersionCompat = {
  'vmx-19': [ 'ESXi 7.0 U2 (7.0.2)' ],
  'vmx-18': [ 'ESXi 7.0 U1 (7.0.1)', 'Fusion 12.x', 'Workstation Pro 16.x', 'Workstation Player 16.x' ],
  'vmx-17': [ 'ESXi 7.0  (7.0.0)' ],
  'vmx-16': [ 'Fusion 11.x', 'Workstation Pro 15.x', 'Workstation Player 15.x' ],
  'vmx-15': [ 'ESXi 6.7 U2' ],
  'vmx-14': [ 'ESXi 6.7', 'Fusion 10.x', 'Workstation Pro 14.x', 'Workstation Player 14.x' ],
  'vmx-13': [ 'ESXi 6.5' ],
  'vmx-12': [ 'Fusion 8.x', 'Workstation Pro 12.x', 'Workstation Player 12.x' ],
  'vmx-11': [ 'ESXi 6.0', 'Fusion 7.x', 'Workstation 11.x', 'Player 7.x' ],
  'vmx-10': [ 'ESXi 5.5', 'Fusion 6.x', 'Workstation 10.x', 'Player 6.x' ],
  'vmx-9': [ 'ESXi 5.1', 'Fusion 5.x', 'Workstation 9.x', 'Player 5.x' ],
  'vmx-8': [ 'ESXi 5.0', 'Fusion 4.x', 'Workstation 8.x', 'Player 4.x' ],
  'vmx-7': [ 'ESXi/ESX 4.x', 'Fusion 3.x', 'Fusion 2.x', 'Workstation 7.x', 'Workstation 6.5.x', 'Player 3.x', 'Server 2.x' ],
  'vmx-6': [ 'Workstation 6.0.x' ],
  'vmx-4': [ 'ESX 3.x', 'ACE 2.x', 'Fusion 1.x', 'Player 2.x', 'ACE 1.x', 'Lab Manager 2.x', 'Player 1.x', 'Server 1.x', 'Workstation 5.x', 'Workstation 4.x' ],
  'vmx-3': [ 'ESX 2.x', 'GSX Server 3.x', 'ACE 1.x', 'Lab Manager 2.x', 'Player 1.x', 'Server 1.x', 'Workstation 5.x', 'Workstation 4.x' ],
};
