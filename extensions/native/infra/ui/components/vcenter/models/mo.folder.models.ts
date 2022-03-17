/*
 * Copyright 2014-2021 Jovian; all rights reserved.
 */
import { MoBaseDetails, moref, morefg, uuid, stringNumber } from './mo.general';

export class FolderFullDetails extends MoBaseDetails {
  childEntity: morefg[];
}

export class NetworkSummary {
  _type: 'NetworkSummary';
  network: moref;
  name: string;
  accessible: boolean;
  ipPoolName: string;
}
