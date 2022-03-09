/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
export interface VsphereDatacenterUtilizationSummary {
  t: number;
  hostCount: number;
  vmCount: number;
  percent: { cpu: number; mem: number; disk: number; };
  overview: {
    totalCpu: number;
    consumedCpu: number;
    percentCpu: number;
    totalMem: number;
    consumedMem: number;
    percentMem: number;
    totalStorage: number;
    consumedStorage: number;
    percentStorage: number;
  };
  clusterSummary: any;
  hostStats: any[];
  storageStats: any[];
  history: VsphereDatacenterUtilizationSnapshotData[];
}

export type VsphereDatacenterUtilizationSnapshotData = [
  number, /** ts */
  number, /** v */
  number, /** h */
  number, /** c */
  number, /** m */
  number, /** s */
];

export interface VcenterInventoryStubNode {
  guid: string;
  iid: string;
  name: string;
  icon: string;
  entityType: string;
  entityKey: string;
  parentGuid: string;
  children?: VcenterInventoryStubNode[];
  expanded?: boolean;
  selected?: boolean;
}

export interface VcenterInventoryStubDatacenter extends VcenterInventoryStubNode {
  hostLike?: VcenterInventoryStubNode[];
  vmFolder?: VcenterInventoryStubNode;
  networkFolder?: VcenterInventoryStubNode;
  datastoreFolder?: VcenterInventoryStubNode;
  hostFolder?: VcenterInventoryStubNode;
}

export interface VcenterInventoryStubsData {
  vCenterKey: string;
  mainDatacenter: VcenterInventoryStubDatacenter;
  datacenters: VcenterInventoryStubDatacenter[];
  hosts: VcenterInventoryStubNode[];
  networks: VcenterInventoryStubNode[];
  resourcePools: VcenterInventoryStubNode[];
  clusters: VcenterInventoryStubNode[];
  datastores: VcenterInventoryStubNode[];
  folders: VcenterInventoryStubNode[];
  vms: VcenterInventoryStubNode[];
  vapps: VcenterInventoryStubNode[];
  byIid: {[iid: string]: VcenterInventoryStubNode};
  guidByEntityKey: {[entityKey: string]: string};
}
