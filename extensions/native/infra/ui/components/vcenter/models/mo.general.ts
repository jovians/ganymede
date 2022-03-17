/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
export type moref = string;
export type morefg = string;
export type stringNumber = string;
export type uuid = string;
export class MoBaseDetails {
  $guid: morefg;
  $type: string;
  $deletedTime: number;
  $lastSync: number;
  iid: string;
  name: string;
  parent: string;
  overallStatus: string;
}
export class Permission {
  _type: 'Permission';
  entity: morefg;
  principal: string;
  group: boolean;
  roleId: number;
  propagate: boolean;
}
