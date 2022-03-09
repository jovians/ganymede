/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../../ui.modules';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { GanymedeLayoutModule } from '../../layout/layout.module';
import { SwimlaneTimeseriesGraphContent } from './swimlane-timeseries-graph-content/swimlane-timeseries-graph-content';
import { SwimlaneAdvPieChartComponent } from './swimlane-adv-pie-chart/swimlane-adv-pie-chart.component';
import { SwimlaneAdvUtilGaugeComponent } from './swimlane-adv-util-gauge/swimlane-adv-util-gauge.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    NgxChartsModule,
    GanymedeLayoutModule,
  ],
  declarations: [
    SwimlaneTimeseriesGraphContent,
    SwimlaneAdvPieChartComponent,
    SwimlaneAdvUtilGaugeComponent,
  ],
  exports: [
    SwimlaneTimeseriesGraphContent,
    SwimlaneAdvPieChartComponent,
    SwimlaneAdvUtilGaugeComponent,
  ],
})
export class GanymedeSwimlaneModule {
  static registration = Modules.register(GanymedeSwimlaneModule, () => require('./swimlane.module.json'));
}
