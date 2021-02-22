/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { ClarityModule } from '@clr/angular';
import { MarkdownFrameComponent } from './markdown-frame/markdown-frame.component';
import { MarkdownContentComponent } from './markdown-content/markdown-content.component';

import { Modules } from '../../../ui.modules';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    MarkdownModule.forChild(),
  ],
  declarations: [
    MarkdownFrameComponent,
    MarkdownContentComponent,
  ],
  exports: [
    MarkdownFrameComponent,
    MarkdownContentComponent
  ],
})
export class GanymedeMarkdownModule {
  static registration = Modules.register(GanymedeMarkdownModule, () => require('./markdown.module.json'));
}
