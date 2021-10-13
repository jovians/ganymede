/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Modules } from '../../../../ui.modules';
import { CommonModule } from '@angular/common';
import { ClarityModule } from '@clr/angular';
import { NgModule } from '@angular/core';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GanymedeLayoutModule } from '../../layout/layout.module';
import { SwimlaneTimeseriesGraphContent } from './swimlane-timeseries-graph-content/swimlane-timeseries-graph-content';

@NgModule({
  imports: [
    ClarityModule,
    NgxChartsModule,
    CommonModule,
    GanymedeLayoutModule,
  ],
  declarations: [
    SwimlaneTimeseriesGraphContent,
  ],
  exports: [
    SwimlaneTimeseriesGraphContent,
  ],
})
export class GanymedeSwimlaneModule {
  static registration = Modules.register(GanymedeSwimlaneModule, () => require('./swimlane.module.json'));
}
