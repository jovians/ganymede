/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../ui.modules';
import { BasicContentsComponent } from './basic-contents/basic-contents.component';
import { GanymedeMarkdownModule } from '../../components/markdown/markdown.module';
// import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
// import { CkeditorContentsComponent } from './ckeditor-contents/ckeditor-contents.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    GanymedeMarkdownModule,
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
