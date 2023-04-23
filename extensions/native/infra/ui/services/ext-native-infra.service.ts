/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { ganymedeAppData } from 'ganymede.app';
import { rx, AppService } from 'src/app/ganymede/components/services/app.service';
import { WavefrontEntry } from 'src/app/ganymede/components/metrics/wavefront/wavefront.models';
import { VcenterInventoryStubsData, VsphereDatacenterUtilizationSummary } from '../components/vcenter/vcenter.models';

const extData = ganymedeAppData.extensions?.native?.infra;

export class ExtNativeInfraDataCollection {
  static namespace = 'extInfra';
  static conf = { baseUrl: 'https://dev-vmbc.eng.vmware.com:4202/api-ext/native/infra/v1', data: extData };
  static rx: rx.StoreEntry<ExtNativeInfraDataCollection>;
  static registered = extData ? ExtNativeInfraDataCollection.rxRegister() : false;
  static rxRegister() { return this.registered ? null : this.rx = new rx.StoreEntry(this.namespace, this); }

  inventory = new rx.Data<any>({ firstValue: extData?.inventory, actions: {
    FETCH: rx.Action.common.static(extData?.inventory, { }),
  }});

  vcenter = {
    quickStats: new rx.Data<rx.MapOf<VsphereDatacenterUtilizationSummary>>({
      firstValue: {},
      actions: {
        FETCH: rx.Action.common.propertyByKey('$BASE_URL/vcenter/:key/quick-stats'),
      }
    }),
    allObjects: new rx.Data<rx.MapOf<{[entityKey: string]: string}>>({
      firstValue: {},
      actions: {
        FETCH: rx.Action.common.propertyByKey('$BASE_URL/vcenter/:key/all-objects'),
      }
    }),
    entityByGuid: new rx.Data<rx.MapOf<any>>({ 
      firstValue: {},
      actions: {
        FETCH: rx.Action.common.propertyByKey('$BASE_URL/vcenter/:key/managed-object'),
      }
    }),
  };

  aws = {
    quickStats: new rx.Data<rx.MapOf<any>>({
      firstValue: {},
      actions: {
        FETCH: rx.Action.common.propertyByKey('$BASE_URL/aws/:key/quick-stats'),
      }
    }),
    quickStatsRegional: new rx.Data<rx.MapOf<any>>({
      firstValue: {},
      actions: {
        FETCH: rx.Action.common.propertyByKey('$BASE_URL/aws/:key/quick-stats/:region'),
      }
    }),
    // allObjects: new rx.Data<rx.MapOf<{[entityKey: string]: string}>>({
    //   firstValue: {},
    //   actions: {
    //     FETCH: rx.Action.common.propertyByKey('$BASE_URL/aws/:key/all-objects'),
    //   }
    // }),
    // entityByGuid: new rx.Data<rx.MapOf<any>>({ 
    //   firstValue: {},
    //   actions: {
    //     FETCH: rx.Action.common.propertyByKey('$BASE_URL/aws/:key/managed-object'),
    //   }
    // }),
  };

}


@Injectable({ providedIn: 'root' })
export class ExtNativeInfraService {
  static skel: ExtNativeInfraService;

  extData = extData;
  rx = ExtNativeInfraDataCollection.rx;
  ds = ExtNativeInfraDataCollection.rx.data;

  vcenterStubs: {[key: string]: VcenterInventoryStubsData} = {};

  constructor(public app: AppService) {

  }

  vcenterStubsDataAdd(key: string, data: VcenterInventoryStubsData) {
    this.vcenterStubs[key] = data;
  }

}


export interface VCenterFethedData {
  quickStats?: any;
}

export interface VCenterRegistry {
  [key: string]: VCenterFethedData;
}
