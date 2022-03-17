import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import * as Folder from '../models/mo.folder.models';
import { VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-folder-details',
  templateUrl: './ext-native-infra-vcenter-folder-details.component.html',
  styleUrls: ['./ext-native-infra-vcenter-folder-details.component.scss']
})
export class ExtNativeInfraVcenterFolderDetailsComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() moData: Folder.FolderFullDetails;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  data = this.populateData();
  constructor() {
    super('ext-native-infra-vcenter-folder-details');
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
    return {
      name: decodeURIComponent(this.moData.name),
      status: this.capitalize(this.moData.overallStatus),
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
