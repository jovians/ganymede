/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Modules } from '../../../ui.modules';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { NgModule } from '@angular/core';
import { FilledSpaceComponent } from './filled-space/filled-space.component';

@NgModule({
  imports: [
    ClarityModule,
    CommonModule,
  ],
  declarations: [
    FilledSpaceComponent
  ],
  exports: [
    FilledSpaceComponent
  ],
})
export class GanymedeLayoutModule {
  static registration = Modules.register(GanymedeLayoutModule, () => require('./layout.module.json'));
}
