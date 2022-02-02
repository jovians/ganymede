/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { ganyBaseModulesImport, Modules } from '../../ui.modules';
import { VarDirective } from './directives/ng-var.directive';
import { GanymedeMarkdownModule } from './markdown/markdown.module';
import { GanymedeSwimlaneModule } from './metrics/swimlane/swimlane.module';
import { GanymedeWavefrontModule } from './metrics/wavefront/wavefront.module';
import { GanymedePagesModule } from './pages/pages.module';
import { GanymedeServicesModule } from './services/services.module';
import { GanymedeSettingsModule } from './settings/settings.module';

import { GanymedeTemplateModule } from './templates/default/template.module';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    GanymedeServicesModule,
    GanymedeMarkdownModule,
    GanymedePagesModule,
    GanymedeSwimlaneModule,
    GanymedeWavefrontModule,
    GanymedeSettingsModule,
    GanymedeTemplateModule,
  ],
  declarations: [
    VarDirective,
  ],
  exports: [
    ...ganyBaseModulesImport,
    GanymedeServicesModule,
    GanymedeMarkdownModule,
    GanymedePagesModule,
    GanymedeWavefrontModule,
    GanymedeSettingsModule,
    GanymedeTemplateModule,
    VarDirective,
  ]
})
export class GanymedeCoreModule {
  static registration = Modules.register(GanymedeCoreModule, () => require('./ganymede.core.module.json'));
}
