/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { GanymedeSwimlaneModule } from 'src/app/ganymede/components/metrics/swimlane/swimlane.module';
import { Modules, ganyBaseModulesImport } from '../../../../../../ui.modules';
import { CovReportPreviewIssuesComponent } from './components/cov-report-preview-issues/cov-report-preview-issues.component';
import { CovReportPreviewPageComponent } from './pages/cov-report-preview-page/cov-report-preview-page.component';

@NgModule({
  imports: [
    ...ganyBaseModulesImport,
    GanymedeSwimlaneModule,
  ],
  declarations: [
    CovReportPreviewIssuesComponent,
    CovReportPreviewPageComponent,
  ],
  exports: [
    CovReportPreviewPageComponent,
  ],
})
export class GanymedeExtNativeSecurityCoverityModule {
  static registration = Modules.register(GanymedeExtNativeSecurityCoverityModule, () => require('./ext.native.security.coverity.module'));
}
