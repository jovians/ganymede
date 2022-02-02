/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../../../ui.modules';
import { GanymedeWavefrontModule } from '../../../../components/metrics/wavefront/wavefront.module';
import { ExtNativeInfraPageComponent } from './pages/ext-native-infra-page/ext-native-infra-page.component';
import { ExtNativeInfraVcenterComponent } from './components/vcenter/ext-native-infra-vcenter/ext-native-infra-vcenter.component';
import { ExtNativeInfraSummaryCardComponent } from './components/shared/ext-native-infra-summary-card/ext-native-infra-summary-card.component';
import { GanymedeSwimlaneModule } from 'src/app/ganymede/components/metrics/swimlane/swimlane.module';
import { GanymedeXtermModule } from 'src/app/ganymede/components/tools/xterm/xterm.module';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    GanymedeSwimlaneModule,
    GanymedeWavefrontModule,
    GanymedeXtermModule,
  ],
  declarations: [
    ExtNativeInfraPageComponent,
    ExtNativeInfraVcenterComponent,
    ExtNativeInfraSummaryCardComponent,
  ],
  exports: [
    ExtNativeInfraPageComponent,
  ],
})
export class GanymedeExtNativeInfraModule {
  static registration = Modules.register(GanymedeExtNativeInfraModule, () => require('./ext.native.infra.module.json'));
}
