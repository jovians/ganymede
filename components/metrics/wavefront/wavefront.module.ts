/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Modules } from '../../../../ui.modules';
import { NgModule } from '@angular/core';
import { WavefrontEmbeddedChartComponent } from './wavefront-embedded-chart/wavefront-embedded-chart.component';

@NgModule({
  imports: [],
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
