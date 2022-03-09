/*
 * Copyright 2014-2021 Jovian; all rights reserved.
 */
import { MoBaseDetails, moref, morefg, uuid, stringNumber } from './mo.general';

export class DatastoreFullDetails extends MoBaseDetails {
  aliasOf: morefg; 
  aliases: morefg[];
  capability: DatastoreCapability;
  browser: moref;
  host: DatastoreHostMount[];
  info: VsanDatastoreInfo;
  iormConfiguration?: StorageIORMInfo;
  summary: DatastoreSummary;
  vm: morefg[];
}

export class DatastoreCapability {
  _type: 'DatastoreCapability';
  directoryHierarchySupported: boolean;
  rawDiskMappingsSupported: boolean;
  perFileThinProvisioningSupported: boolean;
  storageIORMSupported: boolean;
  nativeSnapshotSupported: boolean;
  topLevelDirectoryCreateSupported: boolean;
  seSparseSupported: false;
  vmfsSparseSupported: boolean;
  vsanSparseSupported: boolean;
  vmdkExpandSupported: boolean;
}

export class DatastoreHostMount {
  _type: 'DatastoreHostMount';
  key: moref;
  mountInfo: {
      path: string;
      accessMode: 'readWrite' | string;
      mounted: boolean;
      accessible: boolean;
  };
}

export class VsanDatastoreInfo {
  _type: 'VsanDatastoreInfo';
  name: string;
  url: string;
  freeSpace: stringNumber;
  maxFileSize: stringNumber;
  maxVirtualDiskCapacity: stringNumber;
  maxPhysicalRDMFileSize?: stringNumber;
  maxVirtualRDMFileSize?: stringNumber;
  maxMemoryFileSize: stringNumber;
  timestamp: number;
  containerId: uuid;
  aliasOf: uuid;
  membershipUuid: uuid;
  accessGenNo: number;
  vmfs?: {
    type: string;
    name: string;
    capacity: stringNumber;
    blockSizeMb: number;
    blockSize: number;
    unmapGranularity: number;
    unmapPriority: string;
    maxBlocks: number;
    majorVersion: number;
    version: string;
    uuid: uuid;
    extent: { diskName: string; partition: number; }[];
    vmfsUpgradable: boolean;
    ssd: boolean;
    local: boolean;
  };
}

export class StorageIORMInfo {
  _type: 'StorageIORMInfo';
  enabled: boolean;
  congestionThresholdMode: string;
  congestionThreshold: number;
  percentOfPeakThroughput: number;
  statsCollectionEnabled: boolean;
  reservationEnabled: boolean;
  statsAggregationDisabled: boolean;
};
export class DatastoreSummary {
  _type: 'DatastoreSummary';
  datastore: moref;
  name: string;
  url: string;
  capacity: stringNumber;
  freeSpace: stringNumber;
  uncommitted: stringNumber;
  accessible: boolean;
  multipleHostAccess: boolean;
  type: string;
  maintenanceMode: string;
}
