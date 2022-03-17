/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { PrismHighlightService } from 'src/app/ganymede/components/services/prism-highlight.service';
import { Components } from 'src/app/ui.components';
import { CoverityIssueV2, CoverityReportSummaryView } from '../../coverity.models';
import { ExtNativeCoverityService } from '../shared/ext-native-coverity.service';

@Component({
  selector: 'gany-ext-native-sec-cov-report-preview-issues',
  templateUrl: './cov-report-preview-issues.component.html',
  styleUrls: ['./cov-report-preview-issues.component.scss']
})
export class CovReportPreviewIssuesComponent implements OnInit {
  static registration = Components.register(CovReportPreviewIssuesComponent, () => require('./cov-report-preview-issues.component.json'));

  @Input() title = 'Scan Result';
  @Input() caveatDescription = '';
  @Input() issueMap: {[fileName: string]: CoverityIssueV2[]} = {};
  @Input() summary: CoverityReportSummaryView = null;
  @Input() isDeltaView = false;
  @Input() lineVicinity = 3;
  
  fileCache: {[fileName: string]: { content?: string, issues: CoverityIssueV2[] }} = {};;
  collapseAll = false;

  constructor(
    private covService: ExtNativeCoverityService,
    private prism: PrismHighlightService,
  ) {
    
  }

  ngOnInit() {
    
  }

  toggleCollapseAll() {
    this.collapseAll = !this.collapseAll;
  }

  langClass(issue: CoverityIssueV2) {
    this.prism.getLanguageClass(issue.language)
  }

  filesCount() {
    return this.issueMap ? Object.keys(this.issueMap).length : 0;
  }

  issuesCount() {
    if (!this.issueMap) { return 0; }
    let count = 0;
    for (const key of Object.keys(this.issueMap)) {
      count += this.issueMap[key].length;
    }
    return count;
  }

  severityIs(issue: CoverityIssueV2, compare: string) {
    return issue.kind.cim_checker_properties.impact.toLocaleLowerCase() === compare; 
  }

  fetchIssueFile(issue: CoverityIssueV2) {
    if (this.fileCache[issue.file]) {
      this.fileCache[issue.file].issues.push(issue);
      return '';
    }
    if (!this.fileCache[issue.file]) { this.fileCache[issue.file] = { issues: [] }; }
    let path = this.summary.settings.resultsFolder;
    if (this.summary.settings.referenceFile.folder) {
      path += `/${this.summary.settings.referenceFile.folder}`;
    }
    path += `/${this.covService.referenceFileOf(issue)}`;
    this.covService.getFile(path).then(content => {
      if (content) {
        // issue.kind.cim_checker_properties.impact = 'High'
        for (const issue2 of this.fileCache[issue.file].issues) {
          issue2.fileRef = { content, slice: this.getSlice(issue2, content) };
        }
        this.prism.nudgeHighlight(this, false, 1000);
      }
    });
    return '';
  }

  getSlice(issue: CoverityIssueV2, content: string) {
    const lines = content.split('\n');
    lines.unshift('');
    let from = issue.mainEventLineNumber - this.lineVicinity;
    let to = issue.mainEventLineNumber + this.lineVicinity + 1;
    if (from < 1) { from = 1; }
    if (to > lines.length) { to = lines.length; }
    const slice = [];
    for (let i = from; i < to; ++i) {
      slice.push(lines[i]);
    }
    return slice.join('\n');
  }

  lineStart(issue: CoverityIssueV2) {
    let from = issue.mainEventLineNumber - this.lineVicinity;
    if (from < 1) { from = 1; }
    return from;
  }

  getFileNameOnly(issue: CoverityIssueV2) {
    return issue.relPath.indexOf('/') >= 0 ? issue.relPath.split('/').slice(-1)[0] : issue.relPath;
  }

  getIssue(issue) {
    console.log(issue);
    // const firstOcc = issue.occurrences[0];
    // this.summary.typeMap[``]
  }

}

