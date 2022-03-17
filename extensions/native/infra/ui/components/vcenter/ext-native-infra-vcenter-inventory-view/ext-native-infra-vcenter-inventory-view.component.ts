import { Component, OnInit, Input, SimpleChanges, OnChanges, OnDestroy } from '@angular/core';
import { autoUnsub, ix } from '@jovian/type-tools';
import { ActivatedRoute, Router } from '@angular/router';
import { AppService, rx } from 'src/app/ganymede/components/services/app.service';
import { bindSub } from 'src/app/ganymede/components/util/shared/common';
import { VcenterInventoryStubNode, VcenterInventoryStubsData } from '../vcenter.models';
import { ExtNativeInfraService } from '../../shared/ext-native-infra.service';
import { VirtualMachineFullDetails } from '../models/mo.vm.models';

@Component({
  selector: 'gany-ext-native-infra-vcenter-inventory-view',
  templateUrl: './ext-native-infra-vcenter-inventory-view.component.html',
  styleUrls: ['./ext-native-infra-vcenter-inventory-view.component.scss']
})
export class ExtNativeInfraVcenterInventoryViewComponent  extends ix.Entity implements OnInit, OnChanges, OnDestroy {

  @Input() stubs: VcenterInventoryStubNode[];
  @Input() inventoryStubs: VcenterInventoryStubsData;
  @Input() uiStateTracker: {
    expanded: rx.MapOf<{value: boolean}>;
    selected: rx.MapOf<{value: boolean}>;
  };
  @Input() leftSize = 35;
  @Input() rightSize = 65;
  @Input() ratioLocalStorageKey = 'gany-ext-infra-vcenter-split-ratio';

  vcenter = ExtNativeInfraService.skel?.ds?.vcenter;
  selectedEntityKey = '';
  selectedGuid = '';
  moData: VirtualMachineFullDetails;
  moType: string = '';
  dataLoadingTarget = '';
  dataLoading = false;
  dataLoadingForWhile = false;
  entityNotFound = false;

  constructor(
    public app: AppService,
    private route: ActivatedRoute,
  ) {
    super('ext-native-infra-vcenter-inventory-view');
    this.vcenter = this.app.store.extInfra.vcenter;
    const ratio = localStorage.getItem(this.ratioLocalStorageKey);
    if (ratio) {
      const [ left, right ] = ratio.split(',');
      this.leftSize = parseFloat(left);
      this.rightSize = parseFloat(right);
    }
    bindSub(this, route.queryParams, params => {
      this.selectedEntityKey = params.entity;
      this.updateSelectedEntityView();
    });
  }

  ngOnInit(): void {
    const keyGetter = () => this.selectedGuid;
    this.vcenter.entityByGuid.keySub(this, keyGetter, member => {
      // console.log(member);
      this.moData = member;
      this.moType = this.moData.$type;
      if (this.dataLoadingTarget === this.moData.$guid) {
        this.dataLoading = false;
        this.dataLoadingForWhile = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    for (const propName of Object.keys(changes)) {
      switch (propName) {
        case 'inventoryStubs': {
          this.updateSelectedEntityView();
        }
      }
    }
  }

  ngOnDestroy() {
    autoUnsub(this);
    this.destroy();
  }

  updateSelectedEntityView() {
    if (!this.selectedEntityKey || !this.inventoryStubs?.guidByEntityKey) { return; }
    if (!this.inventoryStubs.guidByEntityKey[this.selectedEntityKey]) {
      console.log(`Entity key (${this.selectedEntityKey}) does not exist on the selected vCenter.`);
      this.selectedGuid = '';
      this.entityNotFound = true;
      return;
    }
    this.entityNotFound = false;
    this.selectedGuid = this.inventoryStubs.guidByEntityKey[this.selectedEntityKey];
    this.hydrate();
  }

  hydrate(nocache = false) {
    if (!this.selectedGuid) { return; }
    const guid = this.selectedGuid;
    if (ix.hotblock(this, 'hydrate', 9, 9).passed || !this.dataLoading) {
      this.dataLoading = true;
      this.dataLoadingTarget = guid;
      this.moData = null;
      rx.invoke(this.vcenter.entityByGuid.actions.FETCH, { key: this.selectedGuid, nocache });
      setTimeout(() => {
        if (!this.dataLoading || this.dataLoadingTarget !== guid) { return; }
        this.dataLoadingForWhile = true;
      }, 500);
    }
  }

  getRouterLink(stub: VcenterInventoryStubNode) {
    return [`${stub.entityKey}`];
  }

  getQueryParams(stub: VcenterInventoryStubNode) {
    return { entity: stub.entityKey };
  }

  selectEntity(stub: VcenterInventoryStubNode) {
    // this.selectedGuid = stub.guid;
    // stub.ClrSelectedState.SELECTED
  }

  getChildren = (stub: VcenterInventoryStubNode | VcenterInventoryStubNode[]) => {
    if (Array.isArray(stub)) { return stub; }
    return stub.children;
  };

  onDragEnd(e: { gutterNum: number; sizes: [number, number] }) {
    const [ left, right ] = e.sizes;
    localStorage.setItem(this.ratioLocalStorageKey, `${left},${right}`);
  }

}
