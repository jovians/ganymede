/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../../../ui.modules';
import { ExtNativeInfraPageComponent } from './pages/ext-native-infra-page/ext-native-infra-page.component';
import { ExtNativeInfraVcenterComponent } from './components/vcenter/ext-native-infra-vcenter/ext-native-infra-vcenter.component';
import { ExtNativeInfraSummaryCardComponent } from './components/shared/ext-native-infra-summary-card/ext-native-infra-summary-card.component';
import { GanymedeSwimlaneModule } from 'src/app/ganymede/components/metrics/swimlane/swimlane.module';
// import { GanymedeXtermModule } from 'src/app/ganymede/components/tools/xterm/xterm.module';

import {
  ClarityIcons,
  cloudNetworkIcon,
  folderIcon,
  vmIcon,
  networkSwitchIcon,
  hostIcon,
  resourcePoolIcon,
  storageIcon,
  clusterIcon,
  vmwAppIcon,
  warningStandardIcon,
} from '@cds/core/icon';
import { ExtNativeInfraVcenterInventoryViewComponent } from './components/vcenter/ext-native-infra-vcenter-inventory-view/ext-native-infra-vcenter-inventory-view.component';
import { ExtNativeInfraVcenterVmDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-vm-details/ext-native-infra-vcenter-vm-details.component';
import { GanymedeCoreModule } from 'src/app/ganymede/components/ganymede.core.module';
import { ExtNativeInfraVcenterEntityLinkComponent } from './components/vcenter/ext-native-infra-vcenter-entity-link/ext-native-infra-vcenter-entity-link.component';
import { GanymedeDataViewModule } from 'src/app/ganymede/components/dataview/dataview.module';
import { ExtNativeInfraVcenterDatastoreDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-datastore-details/ext-native-infra-vcenter-datastore-details.component';
import { ExtNativeInfraVcenterHostDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-host-details/ext-native-infra-vcenter-host-details.component';
import { ExtNativeInfraVcenterClusterDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-cluster-details/ext-native-infra-vcenter-cluster-details.component';
import { ExtNativeInfraVcenterRespoolDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-respool-details/ext-native-infra-vcenter-respool-details.component';
import { ExtNativeInfraVcenterNetworkDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-network-details/ext-native-infra-vcenter-network-details.component';
import { ExtNativeInfraVcenterFolderDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-folder-details/ext-native-infra-vcenter-folder-details.component';
import { ExtNativeInfraVcenterVswitchDetailsComponent } from './components/vcenter/ext-native-infra-vcenter-vswitch-details/ext-native-infra-vcenter-vswitch-details.component';

ClarityIcons.addIcons(...[
  cloudNetworkIcon,
  folderIcon,
  vmIcon,
  networkSwitchIcon,
  hostIcon,
  resourcePoolIcon,
  storageIcon,
  clusterIcon,
  vmwAppIcon,
  warningStandardIcon,
  cloudNetworkIcon,
]);

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    GanymedeCoreModule,
  ],
  declarations: [
    ExtNativeInfraPageComponent,
    ExtNativeInfraVcenterComponent,
    ExtNativeInfraSummaryCardComponent,
    ExtNativeInfraVcenterInventoryViewComponent,
    ExtNativeInfraVcenterVmDetailsComponent,
    ExtNativeInfraVcenterEntityLinkComponent,
    ExtNativeInfraVcenterDatastoreDetailsComponent,
    ExtNativeInfraVcenterHostDetailsComponent,
    ExtNativeInfraVcenterClusterDetailsComponent,
    ExtNativeInfraVcenterRespoolDetailsComponent,
    ExtNativeInfraVcenterNetworkDetailsComponent,
    ExtNativeInfraVcenterFolderDetailsComponent,
    ExtNativeInfraVcenterVswitchDetailsComponent,
  ],
  exports: [
    ExtNativeInfraPageComponent,
  ],
})
export class GanymedeExtNativeInfraModule {
  static registration = Modules.register(GanymedeExtNativeInfraModule, () => require('./ext.native.infra.module.json'));
}
