/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules } from '../../ui.modules';
import { GanymedeMarkdownModule } from './markdown/markdown.module';
import { GanymedeSwimlaneModule } from './metrics/swimlane/swimlane.module';
import { GanymedeWavefrontModule } from './metrics/wavefront/wavefront.module';
import { GanymedePagesModule } from './pages/pages.module';
import { GanymedeServicesModule } from './services/services.module';

import { GanymedeTemplateModule } from './templates/default/template.module';

@NgModule({
  imports: [
    GanymedeServicesModule,
    GanymedeMarkdownModule,
    GanymedePagesModule,
    GanymedeSwimlaneModule,
    GanymedeWavefrontModule,

    GanymedeTemplateModule,
  ],
  declarations: [

  ],
  exports: [
    GanymedeServicesModule,
    GanymedeMarkdownModule,
    GanymedePagesModule,
    GanymedeWavefrontModule,

    GanymedeTemplateModule,
  ]
})
export class GanymedeCoreModule {
  static registration = Modules.register(GanymedeCoreModule, () => require('./ganymede.core.module.json'));
}
