import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from './right-sidebar/right-sidebar.component';

import { ClarityModule } from '@clr/angular';
import { TranslateModule } from '@ngx-translate/core';
// import { MarkdownFrameComponent } from '../../markdown/markdown-frame/markdown-frame.component';
// import { MarkdownContentComponent } from '../../markdown/markdown-content/markdown-content.component';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    ClarityModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    AppComponent,

    HeaderComponent,
    FooterComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
  ],
  exports: [
    AppComponent,

    HeaderComponent,
    FooterComponent,
    LeftSidebarComponent,
    RightSidebarComponent,
  ]
})
export class GanymedeTemplateModule { }
export { AppComponent };
