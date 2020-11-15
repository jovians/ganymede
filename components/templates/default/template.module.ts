import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AppComponent } from 'components/default/app.component';
import { HeaderComponent } from 'components/default/header/header.component';
import { FooterComponent } from 'components/default/footer/footer.component';
import { LeftSidebarComponent } from 'components/default/left-sidebar/left-sidebar.component';
import { RightSidebarComponent } from 'components/default/right-sidebar/right-sidebar.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    AppComponent,

    HeaderComponent,
    FooterComponent,
    LeftSidebarComponent,
    RightSidebarComponent
  ]
})
export class GanymedeTemplateModule { }
