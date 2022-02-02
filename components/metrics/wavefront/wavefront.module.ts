/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../../ui.modules';
import { GanymedeSwimlaneModule } from '../swimlane/swimlane.module';
import { WavefrontEmbeddedChartComponent } from './wavefront-embedded-chart/wavefront-embedded-chart.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    GanymedeSwimlaneModule,
  ],
  declarations: [
    WavefrontEmbeddedChartComponent
  ],
  exports: [
    WavefrontEmbeddedChartComponent
  ],
})
export class GanymedeWavefrontModule {
  static registration = Modules.register(GanymedeWavefrontModule, () => require('./wavefront.module.json'));
}
