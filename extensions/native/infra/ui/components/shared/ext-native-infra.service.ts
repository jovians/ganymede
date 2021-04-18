/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { PartialAny } from '@jovian/type-tools';

import { ganymedeAppData } from '../../../../../../../../../ganymede.app';
import { AppService } from '../../../../../../components/services/app.service';
import { RxStoreEntry, RxDataCollection, RxData, RxAction, AnyStore } from '../../../../../../components/util/ngrx.stores';

export class ExtNativeInfraDataCollection implements PartialAny<RxDataCollection> {
  static rx: RxStoreEntry<ExtNativeInfraDataCollection>;
  static rxRegister() { this.rx = new RxStoreEntry('extNativeInfra', this) };

  test = new RxData<string[]>({
    firstValue: ['initval'],
    actions: {
      IDEM: new RxAction(state => state),
      RESET: new RxAction((state, params) => { console.log('reset called', state, params); return [...state, 'yolo']; }),
    }
  });

}

@Injectable({
  providedIn: 'root'
})
export class ExtNativeInfraService {
  
  extData = ganymedeAppData.extensions?.native?.infra;
  rx = ExtNativeInfraDataCollection.rx;

  constructor(public app: AppService) {}

}

if (ganymedeAppData.extensions?.native?.infra) {
  ExtNativeInfraDataCollection.rxRegister();
}
