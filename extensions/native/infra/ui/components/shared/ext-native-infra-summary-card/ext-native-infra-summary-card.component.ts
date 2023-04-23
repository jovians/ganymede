/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, Input, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from 'ts-comply';
import { Subscription } from 'rxjs';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import { AppService, rx } from '../../../../../../../components/services/app.service';
import { ExtNativeInfraService } from '../../../services/ext-native-infra.service';
import { linker } from 'src/app/ganymede/components/util/common/route.model';

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
  @Input() noHeader: boolean = false;
  @Input() noCard: boolean = false;
  @Input() vmHostsInText: boolean = false;

  linker = linker;
  isDefunct = false;
  vcenter = ExtNativeInfraService.skel?.ds?.vcenter;
  aws = ExtNativeInfraService.skel?.ds?.aws;
  infraType: string;
  key: string = '';
  statsTimer;
  dataSub: Subscription
  dataLoaded = false;
  dataLoadingShow = false;
  dataLoadFailed = false;
  currentStats;

  Unit = Unit;

  constructor(
    public app: AppService
  ) {
    super('ext-native-infra-summary-card');
    this.vcenter = this.app.store.extInfra.vcenter;
    this.aws = this.app.store.extInfra.aws;
    this.statsTimer = setInterval(() => {
      if (!this.entryData || this.entryData.defunct) { return; }
      if (this.infraType === 'vcenter') {
        rx.invoke(this.vcenter.quickStats.actions.FETCH, { key: this.entryData.key });
      } else if (this.infraType === 'aws') {
        rx.invoke(this.aws.quickStats.actions.FETCH, { key: this.entryData.key });
      } else {

      }
    }, 30000);
    setTimeout(() => { this.dataLoadingShow = true; }, 1000);
    setTimeout(() => { if (!this.dataLoaded) { this.dataLoadFailed = true; } }, 7000);
    this.addOnDestroy(() => {
      if (this.dataSub) { this.dataSub.unsubscribe(); }
      if (this.statsTimer) { clearInterval(this.statsTimer); this.statsTimer = null; }
    });
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
    this.infraType = this.entryData.type;
    const store = this.app.store;
    if (
      (this.infraType === 'vcenter' && this.vcenter?.quickStats?.value?.[dat.key]) ||
      (this.infraType === 'aws' && this.aws?.quickStats?.value?.[dat.key])
    ) { this.dataLoaded = true; }
    if (!this.dataSub) {
      if (this.infraType === 'vcenter') {
        this.dataSub = this.vcenter.quickStats.data$.subscribe(vcenters => {
          if (vcenters[this.key]) { this.dataLoaded = true; this.currentStats = vcenters[this.key]; }
        });
      } else if (this.infraType === 'aws') {
        this.dataSub = this.aws.quickStats.data$.subscribe(awsAccs => {
          if (awsAccs[this.key]) { this.dataLoaded = true; this.currentStats = awsAccs[this.key]; }
        });
      }
    }
    switch (dat.type) {
      case 'aws': { rx.invoke(store.extInfra.aws.quickStats.actions.FETCH, { key: dat.key, nocache }); } break;
      case 'gcp': { } break;
      case 'azure': { } break;
      case 'vcenter': { rx.invoke(store.extInfra.vcenter.quickStats.actions.FETCH, { key: dat.key, nocache }); } break;
    }
  }

  ngOnInit() { this.hydrate(); }
  ngOnDestroy() {
    autoUnsub(this);
    this.destroy();
  }

  vcenterHostHasIssues(stats) {
    if (this.infraType === 'vcenter' && stats.hostStats.filter(a => !a.stats).length > 0) { // has a bad host
      return 'warning-triangle'
    }
    return '';
  }

  unit(value: number, prefix: string, unit: string) {
    const adjusted = Unit.adjust(value, prefix as any);
    return `${adjusted.value} ${adjusted.prefix}${unit}`;
  }

  getViewLink(entryData) {
    if (entryData.type === 'vcenter') {
      return ['/' + entryData?.link];
    } else if (entryData.type === 'aws') {
      const link = entryData?.link ? '/' + entryData?.link : entryData?.type;
      return [link];
    }
    return [entryData?.link ? '/' + entryData?.link : entryData?.type];
  }

  getViewQueryParams(entryData) {
    if (entryData.type === 'vcenter') {
      return {};
    } else if (entryData.type === 'aws') {
      return { view: 'global' };
    }
    return {};
  }
}
