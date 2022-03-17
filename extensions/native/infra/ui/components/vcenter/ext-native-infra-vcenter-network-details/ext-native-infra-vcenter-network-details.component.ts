import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import * as Net from '../models/mo.network.models';
import { VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-network-details',
  templateUrl: './ext-native-infra-vcenter-network-details.component.html',
  styleUrls: ['./ext-native-infra-vcenter-network-details.component.scss']
})
export class ExtNativeInfraVcenterNetworkDetailsComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() moData: Net.NetworkFullDetails;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  data = this.populateData();
  constructor() {
    super('ext-native-infra-vcenter-network-details');
  }
  
  ngOnInit(): void {
    this.data = this.populateData();
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'moData': {
          this.data = this.populateData();
        }
      }
    }
  }

  ngOnDestroy() {
    autoUnsub(this);
    this.destroy();
  }

  populateData() {
    if (!this.moData) { return; }
    const sum = this.moData.summary;
    return {
      name: decodeURIComponent(this.moData.name),
      type: (this.moData.iid.indexOf('portgroup-') >= 0) ? 'Distributed Port Group' : 'Network',
      status: this.capitalize(this.moData.overallStatus),
      summary: sum,
    };
  }

  stubByIid(iid: string) {
    if (!iid || !this.inventoryStubs) { return null; }
    return this.inventoryStubs.byIid[iid];
  }
  guidToIid(guid: string) {
    return guid.split(':').slice(2).join(':');
  }

  capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }
}
