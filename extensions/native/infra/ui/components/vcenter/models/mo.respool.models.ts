/*
 * Copyright 2014-2021 Jovian; all rights reserved.
 */
import { MoBaseDetails, moref, morefg, uuid, stringNumber } from './mo.general';

export class ResourcePoolFullDetails extends MoBaseDetails {
  owner: morefg;
  childConfiguration: ResourceConfigSpec[];
  config: ResourceConfigSpec;
  resourcePool: morefg[];
  runtime: ResourcePoolRuntimeInfo;
  summary: ResourcePoolSummary;
  vm: morefg[];
}

export class ResourceConfigSpec {
  _type: 'ResourceConfigSpec';
  entity: moref;
  changeVersion?: string;
  lastModified?: string;
  cpuAllocation: {
    reservation: number | stringNumber;
    expandableReservation: boolean;
    limit: stringNumber;
    shares: { shares: number; level: string; };
    overheadLimit: number | stringNumber;
  };
  memoryAllocation: {
    reservation: number | stringNumber;
    expandableReservation: boolean;
    limit: stringNumber;
    shares: { shares: number; level: string; };
    overheadLimit: number | stringNumber;
  };
};

export class ResourcePoolRuntimeInfo {
  _type: 'ResourcePoolRuntimeInfo';
  memory: {
    reservationUsed: stringNumber;
    reservationUsedForVm: stringNumber;
    unreservedForPool: stringNumber;
    unreservedForVm: stringNumber;
    overallUsage: stringNumber;
    maxUsage: stringNumber;
  };
  cpu: {
    reservationUsed: stringNumber;
    reservationUsedForVm: stringNumber;
    unreservedForPool: stringNumber;
    unreservedForVm: stringNumber;
    overallUsage: stringNumber;
    maxUsage: stringNumber;
  };
  overallStatus: string;
  sharesScalable: string;
}

export class ResourcePoolSummary {
  _type: 'ResourcePoolSummary';
  name: string;
  config: ResourceConfigSpec;
  runtime: ResourcePoolRuntimeInfo;
  quickStats: {
    overallCpuUsage: stringNumber;
    overallCpuDemand: stringNumber;
    guestMemoryUsage: stringNumber;
    hostMemoryUsage: stringNumber;
    distributedCpuEntitlement: stringNumber;
    distributedMemoryEntitlement: stringNumber;
    staticCpuEntitlement: number;
    staticMemoryEntitlement: number;
    privateMemory: stringNumber;
    sharedMemory: stringNumber;
    swappedMemory: stringNumber;
    balloonedMemory: stringNumber;
    overheadMemory: stringNumber;
    consumedOverheadMemory: stringNumber;
    compressedMemory: stringNumber;
  };
  configuredMemoryMB: number;
}
