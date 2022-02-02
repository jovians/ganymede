/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { Subscription } from 'rxjs';
import { AppService, rx } from '../../../../../../../components/services/app.service';
import { ExtNativeInfraService } from '../ext-native-infra.service';

@Component({
  selector: 'gany-ext-native-infra-summary-card',
  templateUrl: './ext-native-infra-summary-card.component.html',
  styleUrls: ['./ext-native-infra-summary-card.component.scss'],
  // tslint:disable-next-line: no-host-metadata-property
  // host: { class: 'card' }
})
export class ExtNativeInfraSummaryCardComponent extends ix.Entity implements OnInit, OnDestroy, OnChanges {

  @Input() listData;
  @Input() entryData;

  isDefunct = false;
  vcenter = ExtNativeInfraService.skel?.ds?.vcenter;
  key: string = '';
  statsTimer;
  dataSub: Subscription
  dataLoaded = false;
  dataLoadingShow = false;
  dataLoadFailed = false;
  currentStats;

  numFormat: (n: number, unit?: string) => string;

  constructor(
    public app: AppService
  ) {
    super('ext-native-infra-summary-card');
    this.vcenter = this.app.store.extInfra.vcenter;
    this.statsTimer = setInterval(() => {
      if (!this.entryData || this.entryData.defunct) { return; }
      rx.invoke(this.app.store.extInfra.vcenter.quickStats.actions.FETCH, { key: this.entryData.key });
    }, 30000);
    // tslint:disable-next-line: deprecation
    this.dataSub = this.app.store.extInfra.vcenter.quickStats.data$.subscribe(vcenters => {
      if (vcenters[this.key]) { this.dataLoaded = true; this.currentStats = vcenters[this.key]; }
    });
    setTimeout(() => { this.dataLoadingShow = true; }, 1000);
    setTimeout(() => { if (!this.dataLoaded) { this.dataLoadFailed = true; } }, 7000);
    this.addOnDestroy(() => {
      if (this.dataSub) { this.dataSub.unsubscribe(); }
      if (this.statsTimer) { clearInterval(this.statsTimer); this.statsTimer = null; }
    });
    this.numFormat = (n: number, unit?: string) => {
      if (n < 0.01 && n >= 0) { return '0'; }
      if (n < 1) {
        const v = n.toFixed(2);
        if (v.endsWith('0')) { return v.substr(0, v.length - 1); }
        return v;
      } else if (n < 10) {
        return n.toFixed(1);
      } else {
        return n.toFixed(0);
      }
    };
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'listData': { this.hydrate(); } break;
        case 'entryData': { this.hydrate(); } break;
      }
    }
  }

  hydrate(nocache = false) {
    if (!this.entryData) { return; }
    if (this.entryData.defunct) { this.isDefunct = true; return; }
    const dat = this.entryData;
    this.key = dat.key;
    const store = this.app.store;
    if (this.vcenter?.quickStats?.value?.[dat.key]) { this.dataLoaded = true; }
    switch (dat.type) {
      case 'aws': { } break;
      case 'gcp': { } break;
      case 'azure': { } break;
      case 'vsphere':
      case 'vcenter': { rx.invoke(store.extInfra.vcenter.quickStats.actions.FETCH, { key: dat.key, nocache }); } break;
    }
  }

  ngOnInit() { this.hydrate(); }
  ngOnDestroy() { autoUnsub(this); this.destroy(); }

}
