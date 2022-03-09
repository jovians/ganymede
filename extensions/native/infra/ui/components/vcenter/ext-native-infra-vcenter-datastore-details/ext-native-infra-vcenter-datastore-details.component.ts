import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import * as DS from '../models/mo.datastore.models';
import { VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-datastore-details',
  templateUrl: './ext-native-infra-vcenter-datastore-details.component.html',
  styleUrls: ['./ext-native-infra-vcenter-datastore-details.component.scss']
})
export class ExtNativeInfraVcenterDatastoreDetailsComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() moData: DS.DatastoreFullDetails;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  data = this.populateData();
  constructor() {
    super('ext-native-infra-vcenter-datastore-details');
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

  ngOnDestroy() { autoUnsub(this); this.destroy(); }

  populateData() {
    if (!this.moData) { return; } 
    return {
      name: decodeURIComponent(this.moData.name),
      type: this.getType(),
      location: this.moData.summary.url,
      hostsAndVms: `${this.moData.host.length} Host(s), ${this.moData.vm.length} VM(s)`,
      status: {
        space: this.getSpaceSummary(),
      },
      meta: this.getMetaSummary(),
    };
  }

  getSpaceSummary() {
    let cap = parseInt(this.moData.summary.capacity, 10); if (cap === 0) { cap = 0.0000001; }
    let used = cap - parseInt(this.moData.summary.freeSpace, 10); if (!used) { used = 0; }
    const diskPercent = used / cap * 100;
    let diskPercentStr = (diskPercent >= 1 || diskPercent === 0) ? diskPercent.toFixed(0) : diskPercent.toFixed(1);
    return {
      usedRaw: used,
      capacityRaw: cap,
      used: Unit.formatted(used, '0i', 'B'),
      capacity: Unit.formatted(cap, '0i', 'B'),
      usePercent: diskPercent,
      usePercentStr: diskPercentStr,
    };
  }

  getType() {
    switch (this.moData.summary.type) {
      case 'vsan': return 'vSAN';
    }
    return this.moData.summary.type;
  }

  getMetaSummary() {
    const capa = { ...this.moData.capability };
    if (capa._type) { delete capa._type; }
    return {
      capabilityListLength: Object.keys(capa).length,
      capability: capa,
      iorm: { ...this.moData.iormConfiguration },
      containerId: this.moData.info.containerId,
      membershipUuid: this.moData.info.membershipUuid,
      accessGenNo: this.moData.info.accessGenNo,
      maintenanceMode: this.capitalize(this.moData.summary.maintenanceMode),
      multipleHostAccess: this.moData.summary.multipleHostAccess,
      maxVirtualDiskCapacity: Unit.formatted(parseInt(this.moData.info.maxVirtualDiskCapacity, 10), '0i', 'B'),
      maxFileSize: Unit.formatted(parseInt(this.moData.info.maxFileSize, 10), '0i', 'B'),
      maxMemoryFileSize: Unit.formatted(parseInt(this.moData.info.maxMemoryFileSize, 10), '0i', 'B'),
      maxPhysicalRDMFileSize: this.moData.info.maxPhysicalRDMFileSize ?
                              Unit.formatted(parseInt(this.moData.info.maxPhysicalRDMFileSize, 10), '0i', 'B') : undefined,
      maxVirtualRDMFileSize: this.moData.info.maxVirtualRDMFileSize ?
                              Unit.formatted(parseInt(this.moData.info.maxVirtualRDMFileSize, 10), '0i', 'B') : undefined,
      vmfs: this.moData.info.vmfs ? { ...this.moData.info.vmfs } : undefined,
      vmfsCapacity: this.moData.info.vmfs ? Unit.formatted(parseInt(this.moData.info.vmfs.capacity, 10), '0i', 'B') : undefined,
    };
  }

  capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }
}
