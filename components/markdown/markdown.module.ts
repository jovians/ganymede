import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { HttpClient } from '@angular/common/http';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { ClarityModule } from '@clr/angular';
import { MarkdownFrameComponent } from './markdown-frame/markdown-frame.component';
import { MarkdownContentComponent } from './markdown-content/markdown-content.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
          provide: MarkedOptions,
          useValue: {
                  gfm: true,
                  tables: true,
                  breaks: false,
                  pedantic: false,
                  sanitize: false,
                  smartLists: true,
                  smartypants: false,
                  highlight: true
              },
          },
    }),
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
export class GanymedeMarkdownModule { }
