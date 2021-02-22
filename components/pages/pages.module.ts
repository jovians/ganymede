/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { ClarityModule } from '@clr/angular';
import { BasicContentsComponent } from './basic-contents/basic-contents.component';
import { GanymedeMarkdownModule } from '../../components/markdown/markdown.module';
import { TranslateModule } from '@ngx-translate/core';
import { Modules } from '../../../ui.modules';
// import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// import { CkeditorContentsComponent } from './ckeditor-contents/ckeditor-contents.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    GanymedeMarkdownModule,
    TranslateModule.forChild(),
    // CKEditorModule,
  ],
  declarations: [
    BasicContentsComponent,
    // CkeditorContentsComponent
  ],
  exports: [
    BasicContentsComponent
  ],
})
export class GanymedePagesModule {
  static registration = Modules.register(GanymedePagesModule, () => require('./page.module.json'));
}
