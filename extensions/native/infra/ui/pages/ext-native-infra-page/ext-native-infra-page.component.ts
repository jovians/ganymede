/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { RouteObservingService } from 'src/app/ganymede/components/services/route-observing.service';
import { Components } from '../../../../../../../ui.components';
import { AppService, rx } from '../../../../../../components/services/app.service';
import { asRouteBasic, RouteData } from '../../../../../../components/util/common/route.helper';
import { ExtNativeInfraService } from '../../components/shared/ext-native-infra.service';

@Component({
  selector: 'gany-ext-native-infra-page',
  templateUrl: './ext-native-infra-page.component.html',
  styleUrls: ['./ext-native-infra-page.component.scss']
})
export class ExtNativeInfraPageComponent extends ix.Entity implements OnInit, OnDestroy {
  static registration = Components.register(ExtNativeInfraPageComponent, () => require('./ext-native-infra-page.component.json'));

  public static asRoute<T = any>(subdir: string, routeData: RouteData<T>) {
    const routeDef = asRouteBasic(subdir, routeData);
    routeDef.main.component = ExtNativeInfraPageComponent;
    return [routeDef.main, ...routeDef.others];
  }

  inventory = ExtNativeInfraService.skel?.ds?.inventory;

  key: string = '';
  type: '' | 'aws' | 'gcp' | 'azure' | 'vcenter' | 'overview' = '';
  subtype: string = '';
  overviewOrder = ['aws', 'gcp', 'azure', 'vcenter'];
  isDefunct = false;

  constructor(
    public app: AppService,
    private routeObserver: RouteObservingService,
  ) {
    super('ext-native-infra-page');
    this.inventory = this.app.store.extInfra.inventory;
    // console.log(this.infra);
    // tslint:disable-next-line: deprecation
    this.routeObserver.eventRouteChange.subscribe(url => {
      if (this.routeObserver.routeChildData) {
        const data = this.routeObserver.routeChildData as any;
        this.type = data.type;
        this.subtype = data.subtype;
        if (data.defunct) { this.key = ''; this.isDefunct = true; return; }
        this.isDefunct = false;
        this.key = data.key;
      }
    });
  }

  getProviderName(providerType: string) {
    switch (providerType) {
      case 'aws': { return 'Amazon Web Service'; }
      case 'gcp': { return 'Google Cloud Platform '; }
      case 'azure': { return 'Microsoft Azure'; }
      case 'vcenter': { return 'VMware vCenter'; }
    }
    return 'Unknown';
  }

  hydrate(nocache = false) {
    // if (!this.key) { return; }
    const store = this.app.store;
    if (ix.hbi(this, 'hydrate').passed) {
      rx.invoke(store.extInfra.inventory.actions.FETCH, { nocache });
    }
  }

  ngOnInit() { this.hydrate(); }
  ngOnDestroy() { autoUnsub(this); this.destroy(); }

}
