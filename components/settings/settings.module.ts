/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../ui.modules';
import { ThemeSelectorComponent } from './theme-selector/theme-selector.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
  ],
  declarations: [
    ThemeSelectorComponent,
  ],
  exports: [
    ThemeSelectorComponent,
  ],
})
export class GanymedeSettingsModule {
  static registration = Modules.register(GanymedeSettingsModule, () => require('./settings.module.json'));
}
