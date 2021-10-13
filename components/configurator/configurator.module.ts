/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';

import { Modules } from '../../../ui.modules';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    TranslateModule.forChild(),
  ],
  declarations: [

  ],
  exports: [

  ]
})
export class GanymedeConfiguratorModule {
  static registration = Modules.register(GanymedeConfiguratorModule, () => require('./configurator.module.json'));
}
