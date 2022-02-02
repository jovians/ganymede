/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SwimlaneAdvancedPieChartGraphConfig } from 'src/app/ganymede/components/metrics/swimlane/swimlane-adv-pie-chart/swimlane-adv-pie-chart.component';
import { AppService, autoSub, autoUnsub, ix } from 'src/app/ganymede/components/services/app.service';
import { RouteObservingService } from 'src/app/ganymede/components/services/route-observing.service';
import { asRouteBasic, RouteData } from 'src/app/ganymede/components/util/common/route.helper';
import { DataFetcher } from 'src/app/ganymede/models/data.fetcher.model';
import { Components } from 'src/app/ganymede/template/src/app/ui.components';
import { ExtNativeCoverityService } from '../../components/shared/ext-native-coverity.service';
import { CoverityReportRouteParams, CoverityReportSummaryView } from '../../coverity.models';

@Component({
  selector: 'gany-ext-native-sec-cov-report-preview-page',
  templateUrl: './cov-report-preview-page.component.html',
  styleUrls: ['./cov-report-preview-page.component.scss']
})
export class CovReportPreviewPageComponent extends ix.Entity implements OnInit, OnDestroy {
  static registration = Components.register(CovReportPreviewPageComponent, () => require('./cov-report-preview-page.component.json'));

  public static asRoute<T = any>(subdir: string, routeData: RouteData<T>) {
    const routeDef = asRouteBasic(subdir, routeData);
    routeDef.main.component = CovReportPreviewPageComponent;
    return [routeDef.main, ...routeDef.others];
  }

  summary: CoverityReportSummaryView = null;
  issueDataFetcher = new DataFetcher({
    fetch: (arg, resolve) => {
      if (!this.summary) { return resolve.asNoData(); }
      return resolve.asGoodData([
        // { name: "Critical", value: this.summary.bySeverity.issueMap.critical.length },
        { name: "High", value: this.summary.bySeverity.issueMap.high.length },
        { name: "Medium", value: this.summary.bySeverity.issueMap.medium.length },
        { name: "Low", value: this.summary.bySeverity.issueMap.low.length },
        { name: "Unknown", value: this.summary.bySeverity.issueMap.unknown.length },
      ]);
    },
  });
  issueGraphConfig = this.getDefaultGraphConfig('Filtered Issues');
  issueTotalDataFetcher = new DataFetcher({
    fetch: (arg, resolve) => {
      if (!this.summary) { return resolve.asNoData(); }
      return resolve.asGoodData([
        // { name: "Critical", value: this.summary.bySeverity.issueMap.critical.length },
        { name: "High", value: this.summary.bySeverity.issueMapTotal.high.length },
        { name: "Medium", value: this.summary.bySeverity.issueMapTotal.medium.length },
        { name: "Low", value: this.summary.bySeverity.issueMapTotal.low.length },
        { name: "Unknown", value: this.summary.bySeverity.issueMapTotal.unknown.length },
      ]);
    },
  });
  issueTotalGraphConfig = this.getDefaultGraphConfig('Total Issues');
  
  constructor(
    public app: AppService,
    private covService: ExtNativeCoverityService,
    private routeObserver: RouteObservingService,
  ) {
    super('ext-native-security-coverity-report-preview-page');
    autoSub(this, this.routeObserver.eventNavigationdEnd.subscribe(_ => {
      const routeData = this.routeObserver.routeData as RouteData<CoverityReportRouteParams>;
      if (routeData?.pageParams) { this.loadData(routeData?.pageParams); }
    }));
  }

  ngOnInit() {

  }

  getDefaultGraphConfig(title: string) {
    return new SwimlaneAdvancedPieChartGraphConfig({
      label: title,
      colorScheme: { domain: ['red', 'orange', 'green', 'gray'] }
    });
  }

  async loadData(routeParams: CoverityReportRouteParams) {
    const summary = await this.covService.loadFromUrl(routeParams.settingsPath);
    this.summary = summary;
    this.issueDataFetcher.nudge();
    this.issueTotalDataFetcher.nudge();
    console.log(this.summary);
  }

  ngOnDestroy() { autoUnsub(this); this.destroy(); }

}
