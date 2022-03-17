/*
 * Copyright 2014-2021 Jovian; all rights reserved.
 */
import { DatastoreSummary } from './mo.datastore.models';
import { MoBaseDetails, moref, morefg, uuid, stringNumber } from './mo.general';

export class ClusterFullDetails extends MoBaseDetails {
  network: morefg[];
  datastore: morefg[];
  datastoreSummary: DatastoreSummary[];
  host: morefg[];
  resourcePool: morefg;
  summary: ClusterComputeResourceSummary;
}

export class ClusterComputeResourceSummary {
  _type: 'ClusterComputeResourceSummary';
  totalCpu: number;
  totalMemory: stringNumber;
  numCpuCores: number;
  numCpuThreads: number;
  effectiveCpu: number;
  effectiveMemory: string;
  numHosts: number;
  numEffectiveHosts: number;
  overallStatus: string;
  currentFailoverLevel: number;
  numVmotions: number;
  targetBalance: number;
  currentBalance: number;
  drsScore: number;
  numVmsPerDrsScoreBucket: number[];
  usageSummary: {
    totalCpuCapacityMhz: number;
    totalMemCapacityMB: number;
    cpuReservationMhz: number;
    memReservationMB: number;
    poweredOffCpuReservationMhz: number;
    poweredOffMemReservationMB: number;
    cpuDemandMhz: number;
    memDemandMB: number;
    statsGenNumber: string;
    cpuEntitledMhz: number;
    memEntitledMB: number;
    poweredOffVmCount: number;
    totalVmCount: number;
  };
  currentEVCGraphicsModeKey: string;
  clusterMaintenanceModeStatus: string;
  vcsHealthStatus: string;
  vcsSlots: { host: moref; totalSlots: number; }[];
}
