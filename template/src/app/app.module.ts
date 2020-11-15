import { HttpClient } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { LOCATION_INITIALIZED } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Injector, APP_INITIALIZER } from '@angular/core';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { RequestInterceptor } from './request.interceptor';

import { ClarityModule } from '@clr/angular';

import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';

import { MarkdownModule, MarkedOptions } from 'ngx-markdown';

import { GanymedeTemplateModule, AppComponent } from './ganymede/components/templates/<gany.APP_TEMPLATE_NAME>/template.module';

const notFoundValue = Promise.resolve();
const translateBasePath = 'assets/i18n/';

export function langInitializerFactory(translate: TranslateService, injector: Injector) {
  return () => new Promise<any>(resolve => {
    injector.get(LOCATION_INITIALIZED, notFoundValue).then(() => {
      try {
        const defaultLanguage = 'en';
        translate.use(defaultLanguage).subscribe(() => { resolve(); });
      } catch (e) {
        // tslint:disable-next-line: no-console
        console.error(e);
      }
    });
  });
}

@NgModule({
  imports: [
    HttpClientModule,
    BrowserModule,
    AppRoutingModule,
    ClarityModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: http => new TranslateHttpLoader(http, translateBasePath, '.json'),
        deps: [HttpClient]
      }
    }),
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
    // BEGIN GANYMEDE AUTOGEN SECTION
    <gany.APP_IMPORTS>
    // END GANYMEDE AUTOGEN SECTION
  ],
  declarations: [
    AppComponent,

    // BEGIN GANYMEDE AUTOGEN SECTION
    <gany.APP_DECLARATIONS>
    // END GANYMEDE AUTOGEN SECTION
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: langInitializerFactory,
      deps: [TranslateService, Injector],
      multi: true
    }, {
      provide: HTTP_INTERCEPTORS,
      useClass: RequestInterceptor,
      multi: true,
    },
    TranslateService,
    MarkedOptions
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
