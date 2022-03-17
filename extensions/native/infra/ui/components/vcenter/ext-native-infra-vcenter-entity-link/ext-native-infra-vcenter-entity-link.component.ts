import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { VcenterInventoryStubNode, VcenterInventoryStubsData } from '../vcenter.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-entity-link',
  templateUrl: './ext-native-infra-vcenter-entity-link.component.html',
  styleUrls: ['./ext-native-infra-vcenter-entity-link.component.scss']
})
export class ExtNativeInfraVcenterEntityLinkComponent implements OnInit, OnChanges {

  @Input() entityId = '';
  @Input() showIcon = true;
  @Input() showCustomLink = false;
  @Input() wordBreakAll = false;
  @Input() inventoryStubs: VcenterInventoryStubsData;
  iconShape: string = '';
  iconStyle: {[key: string]: string} = {};
  iconBadge: string = '';
  iconStatus: string = '';
  routerLink: string[] = [];
  entityName: string = '';
  queryParams: { entity?: string; view?: string} = {};
  constructor() { }

  ngOnInit(): void {
    this.updateData();
  }

  ngOnChanges() {
    this.updateData();
  }

  updateData() {
    if (!this.entityId) { return; }
    let iid = this.entityId;
    if (iid.startsWith('$mo')) { }
    else if (iid.startsWith('$guid')) { iid = this.guidToIid(iid); }
    else { iid = this.entityKeyToIid(iid); }
    const entity = this.stubByIid(iid);
    if (!entity) { return; }
    this.entityName = entity.name;
    this.queryParams = { entity: entity.entityKey };
    switch (entity.entityType) {
      case 'VirtualMachine':
        this.iconShape = 'vm';
        this.queryParams.view = 'vms';
        this.iconStyle = { 'margin-right': '0.25rem', 'transform': 'translate(0, -0.08rem)' };
      break;
      case 'Folder':
        this.iconShape = 'folder';
        // this.queryParams.view = 'vms';
        this.iconStyle = { 'margin-right': '0.25rem', 'transform': 'translate(0, -0.08rem)' };
      break;
      case 'Network':
        this.iconShape = 'network-switch';
        this.queryParams.view = 'networks';
        this.iconStyle = { 'margin-right': '0.35rem', 'transform': 'translate(0, -0.02rem)' };
      break;
      case 'HostSystem':
        this.iconShape = 'host';
        this.queryParams.view = 'hosts';
        this.iconStyle = { 'margin-right': '0.25rem', 'transform': 'translate(0, -0.08rem)' };
      break;
      case 'ResourcePool':
        this.iconShape = 'resource-pool';
        this.queryParams.view = 'hosts';
        this.iconStyle = { 'margin-right': '0.25rem', 'transform': 'translate(0, -0.08rem)' };
      break;
      case 'Datastore':
        this.iconShape = 'storage';
        this.queryParams.view = 'datastores';
        this.iconStyle = { 'margin-right': '0.35rem', 'transform': 'translate(0, -0.05rem)' };
      break;
      case 'ComputeResource':
        this.iconShape = 'cluster';
        this.queryParams.view = 'hosts';
        this.iconStyle = { 'margin-right': '0.3rem', 'transform': 'translate(0, -0.08rem)' };
      break;
      case 'VirtualApp':
        this.iconShape = 'vmw-app';
        this.queryParams.view = 'hosts';
        this.iconStyle = { 'margin-right': '0.25rem', 'transform': 'translate(0, -0.08rem)' };
      break;
      case 'VirtualSwitch':
        this.iconShape = 'cloud-network';
        this.queryParams.view = 'networks';
        this.iconStyle = { 'margin-right': '0.25rem', 'transform': 'translate(0, -0.08rem)' };
      break;
    }
  }

  stubByIid(iid: string) {
    if (!iid || !this.inventoryStubs) { return null; }
    return this.inventoryStubs.byIid[iid];
  }

  guidToIid(guid: string) {
    return guid.split(':').slice(2).join(':');
  }

  entityKeyToIid(entityKey: string) {
    const entityKeyType = entityKey.split('-')[0];
    switch (entityKeyType) {
      case 'dvportgroup': return `$mo:Network:${entityKey}`;
    }
    return null;
  }

}
