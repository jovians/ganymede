/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';

import { Modules } from '../../../../../ui.modules';

import { ExtNativeInfraPageComponent } from './pages/ext-native-infra-page/ext-native-infra-page.component';
import { ExtNativeInfraVcenterComponent } from './components/vcenter/ext-native-infra-vcenter/ext-native-infra-vcenter.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    ExtNativeInfraPageComponent,
    ExtNativeInfraVcenterComponent,
  ],
  exports: [
    ExtNativeInfraPageComponent,
  ],
})
export class GanymedeExtNativeInfraModule {
  static registration = Modules.register(GanymedeExtNativeInfraModule, () => require('./ext.native.infra.module.json'));
}
