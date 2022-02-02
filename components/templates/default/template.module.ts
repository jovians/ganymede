/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules, ganyBaseModulesImport } from '../../../../ui.modules';
import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from './right-sidebar/right-sidebar.component';
import { HeaderOtherContentComponent } from '../../../../template/header/header-other-content/header-other-content.component';

// import { MarkdownFrameComponent } from '../../markdown/markdown-frame/markdown-frame.component';
// import { MarkdownContentComponent } from '../../markdown/markdown-content/markdown-content.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
  ],
  declarations: [
    AppComponent,

    HeaderComponent,
    FooterComponent,
    LeftSidebarComponent,
    RightSidebarComponent,

    HeaderOtherContentComponent,
  ],
  exports: [
    AppComponent,

    HeaderComponent,
    FooterComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
  ]
})
export class GanymedeTemplateModule {
  static registration = Modules.register(GanymedeTemplateModule, () => require('./template.module.json'));
}
export { AppComponent };
