/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../ui.modules';
import { FilledSpaceComponent } from './filled-space/filled-space.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
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
