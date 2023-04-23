import { Component, OnInit, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { autoUnsub, ix } from 'ts-comply';
import { Unit } from 'src/app/ganymede/components/util/shared/unit.utils';
import * as ResPool from '../models/mo.respool.models';
import { VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-respool-details',
  templateUrl: './ext-native-infra-vcenter-respool-details.component.html',
  styleUrls: ['./ext-native-infra-vcenter-respool-details.component.scss']
})
export class ExtNativeInfraVcenterRespoolDetailsComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() moData: ResPool.ResourcePoolFullDetails;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  data = this.populateData();
  constructor() {
    super('ext-native-infra-vcenter-respool-details');
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
      vapp: (this.moData.$type === 'VirtualApp'),
      name: decodeURIComponent(this.moData.name),
      sharesScalable: this.moData.runtime.sharesScalable,
      status: {
        cpu: this.getCpuSummary(),
        mem: this.getMemSummary(),
        statusText: this.capitalize(this.moData.runtime.overallStatus),
      },
      alloc: {
        cpu: this.getCpuAlloc(),
        mem: this.getMemAlloc(),
      },
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
  getCpuSummary() {
    const cpu = this.moData.runtime.cpu;
    return {
      usage: parseFloat(cpu.reservationUsed),
      capacity: parseFloat(cpu.reservationUsed) + parseFloat(cpu.unreservedForPool),
      max: parseFloat(cpu.maxUsage),
    };
  }
  getMemSummary() {
    const mem = this.moData.runtime.memory;
    return {
      usage: parseFloat(mem.reservationUsed),
      capacity: parseFloat(mem.reservationUsed) + parseFloat(mem.unreservedForPool),
      max: parseFloat(mem.maxUsage),
    };
  }
  getCpuAlloc() {
    const cpu = this.moData.config.cpuAllocation;
    return {
      summaryLine: `${cpu.reservation} / ${cpu.limit === '-1' ? 'Unlimited' : cpu.limit} (${cpu.expandableReservation ? 'Expandable' : 'Not Expandable'})`,
      reservation: cpu.reservation,
      expandable: cpu.expandableReservation,
      limit: cpu.limit === '-1' ? 'Unlimited' : cpu.limit,
      shares: `${cpu.shares.shares} (${this.capitalize(cpu.shares.level)})`,
      overheadLimit: cpu.overheadLimit,
    };
  }
  getMemAlloc() {
    const mem = this.moData.config.memoryAllocation;
    return {
      summaryLine: `${mem.reservation} / ${mem.limit === '-1' ? 'Unlimited' : mem.limit} (${mem.expandableReservation ? 'Expandable' : 'Not Expandable'})`,
      reservation: mem.reservation,
      expandable: mem.expandableReservation,
      limit: mem.limit === '-1' ? 'Unlimited' : mem.limit,
      shares: `${mem.shares.shares} (${this.capitalize(mem.shares.level)})`,
      overheadLimit: mem.overheadLimit,
    };
  }

  capitalize(str: string) { return str.charAt(0).toUpperCase() + str.slice(1); }
}
