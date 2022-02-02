/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { ganymedeAppData } from 'ganymede.app';
import { rx, AppService } from 'src/app/ganymede/components/services/app.service';
import { WavefrontEntry } from 'src/app/ganymede/components/metrics/wavefront/wavefront.models';

const extData = ganymedeAppData.extensions?.native?.infra;

export class ExtNativeInfraDataCollection {
  static namespace = 'extInfra';
  static conf = { baseUrl: 'https://localhost.firestack.com:7005/api-ext/native/infra/v1', data: extData };
  static rx: rx.StoreEntry<ExtNativeInfraDataCollection>;
  static registered = extData ? ExtNativeInfraDataCollection.rxRegister() : false;
  static rxRegister() { return this.registered ? null : this.rx = new rx.StoreEntry(this.namespace, this); }

  inventory = new rx.Data<any>({ firstValue: extData?.inventory, actions: {
    FETCH: rx.Action.common.static(extData?.inventory, { }),
  }});

  vcenter = {
    quickStats: new rx.Data<any>({ firstValue: {}, actions: {
      FETCH: rx.Action.common.propertyByKey('$BASE_URL/vcenter/:key/quick-stats', { }),
    }}),
    allObjects: new rx.Data<any>({ firstValue: {}, actions: {
      FETCH: rx.Action.common.propertyByKey('$BASE_URL/vcenter/:key/all-objects', { }),
    }}),
  };

}


@Injectable({ providedIn: 'root' })
export class ExtNativeInfraService {
  static skel: ExtNativeInfraService;

  extData = extData;
  rx = ExtNativeInfraDataCollection.rx;
  ds = ExtNativeInfraDataCollection.rx.data;

  constructor(public app: AppService) {

  }

  // async getWavefrontData(start: number, end: number) {
  //   const testQuery = `ts("vsphere.host.cpu.used.summation", vcenter="vcenter.sddc-54-145-245-241.vmwarevmc.com" and cpu="instance-total")`;
  //   const entry = new WavefrontEntry({ endpoint: `https://vmware.wavefront.com`});
  //   const access = entry.setAccess({
  //     name: 'default-access',
  //     token: 'dc4d5106-b2cb-4284-864e-26ab99622e6e',
  //     useProxy: true,
  //   });
  //   return await access.getChartData({ queryString: testQuery, start, end, shownTags: ['host', 'vcenter'] });
  // }

}


export interface VCenterFethedData {
  quickStats?: any;
}

export interface VCenterRegistry {
  [key: string]: VCenterFethedData;
}
