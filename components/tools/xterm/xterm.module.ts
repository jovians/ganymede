/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../../ui.modules';
import { XtermComponent } from './xterm/xterm.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
  ],
  declarations: [
    XtermComponent,
  ],
  exports: [
    XtermComponent,
  ],
})
export class GanymedeXtermModule {
  static registration = Modules.register(GanymedeXtermModule, () => require('./xterm.module.json'));
}
