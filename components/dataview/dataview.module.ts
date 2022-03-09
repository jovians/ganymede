/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../ui.modules';
import { TimeViewComponent } from './time-view/time-view.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
  ],
  declarations: [
    TimeViewComponent,
  ],
  exports: [
    TimeViewComponent,
  ],
})
export class GanymedeDataViewModule {
  static registration = Modules.register(GanymedeDataViewModule, () => require('./dataview.module.json'));
}
