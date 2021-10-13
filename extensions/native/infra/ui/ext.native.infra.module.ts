/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
import { GanymedeWavefrontModule } from '../../../../components/metrics/wavefront/wavefront.module';

import { Modules } from '../../../../../ui.modules';

import { ExtNativeInfraPageComponent } from './pages/ext-native-infra-page/ext-native-infra-page.component';
import { ExtNativeInfraVcenterComponent } from './components/vcenter/ext-native-infra-vcenter/ext-native-infra-vcenter.component';
import { ExtNativeInfraSummaryCardComponent } from './components/shared/ext-native-infra-summary-card/ext-native-infra-summary-card.component';
import { GanymedeSwimlaneModule } from 'src/app/ganymede/components/metrics/swimlane/swimlane.module';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    TranslateModule.forChild(),
    GanymedeSwimlaneModule,
    GanymedeWavefrontModule,
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
