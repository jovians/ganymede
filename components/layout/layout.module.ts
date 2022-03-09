/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../ui.modules';
import { FilledSpaceComponent } from './filled-space/filled-space.component';
import { GanyGridComponent } from './gany-grid/gany-grid.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
  ],
  declarations: [
    FilledSpaceComponent,
    GanyGridComponent
  ],
  exports: [
    FilledSpaceComponent,
    GanyGridComponent,
  ],
})
export class GanymedeLayoutModule {
  static registration = Modules.register(GanymedeLayoutModule, () => require('./layout.module.json'));
}
