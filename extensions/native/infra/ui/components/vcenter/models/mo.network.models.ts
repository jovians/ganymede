/*
 * Copyright 2014-2021 Jovian; all rights reserved.
 */
import { MoBaseDetails, moref, morefg, uuid, stringNumber } from './mo.general';

export class NetworkFullDetails extends MoBaseDetails {
  host: morefg[];
  vm: morefg[];
  summary: NetworkSummary;
}

export class NetworkSummary {
  _type: 'NetworkSummary';
  network: moref;
  name: string;
  accessible: boolean;
  ipPoolName: string;
}
