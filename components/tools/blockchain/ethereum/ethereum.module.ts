/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../../../ui.modules';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
  ],
  declarations: [
    
  ],
  exports: [
    
  ],
})
export class GanymedeEthereumModule {
  static registration = Modules.register(GanymedeEthereumModule, () => require('./ethereum.module.json'));
}
