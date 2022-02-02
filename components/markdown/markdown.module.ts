/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../ui.modules';
import { MarkdownModule } from 'ngx-markdown';
import { MarkdownFrameComponent } from './markdown-frame/markdown-frame.component';
import { MarkdownContentComponent } from './markdown-content/markdown-content.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    MarkdownModule.forChild(),
  ],
  declarations: [
    MarkdownFrameComponent,
    MarkdownContentComponent,
  ],
  exports: [
    MarkdownFrameComponent,
    MarkdownContentComponent,
    MarkdownModule,
  ],
})
export class GanymedeMarkdownModule {
  static registration = Modules.register(GanymedeMarkdownModule, () => require('./markdown.module.json'));
}
