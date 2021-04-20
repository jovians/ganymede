/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { PartialAny } from '@jovian/type-tools';

import { ganymedeAppData } from '../../../../../../../../../ganymede.app';
import { AppService } from '../../../../../../components/services/app.service';
import { RxStoreEntry, RxDataCollection, RxData, RxAction, rxSet } from '../../../../../../components/util/ngrx.stores';

export interface VCenterFethedData {
  quickStats: any;
}

export interface VCenterRegistry {
  [key: string]: VCenterFethedData;
}

export class ExtNativeInfraDataCollection implements PartialAny<RxDataCollection> {
  static namespace = 'extNativeInfra';
  static rx: RxStoreEntry<ExtNativeInfraDataCollection>;
  static rxRegister() { this.rx = new RxStoreEntry(this.namespace, this); }

  vcenter = {
    quickStats: new RxData<any>({
      firstValue: {},
      actions: {
        FETCH: new RxAction({}, async (state, params, tools) => {
          const key = params.key;
          const url = `http://localhost:7001/api-ext/json/native/infra/vcenter/${key}/quick-stats111`;
          const data = await tools.http.get<any>(url).toPromise();
          if (!data || data.status !== 'ok') { return state; }
          return rxSet(state, key, data.data);
        }),
      }
    })
  };

}

@Injectable({
  providedIn: 'root'
})
export class ExtNativeInfraService {

  extData = ganymedeAppData.extensions?.native?.infra;
  rx = ExtNativeInfraDataCollection.rx;

  constructor(public app: AppService) {
    // rx.
  }

}

if (ganymedeAppData.extensions?.native?.infra) {
  ExtNativeInfraDataCollection.rxRegister();
}
