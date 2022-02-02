/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../ui.modules';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
  ],
  declarations: [

  ],
  exports: [

  ]
})
export class GanymedeConfiguratorModule {
  static registration = Modules.register(GanymedeConfiguratorModule, () => require('./configurator.module.json'));
}
