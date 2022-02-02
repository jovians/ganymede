/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Components } from 'src/app/ui.components';
import { CoverityIssueV2, CoverityReportSummaryView } from '../../coverity.models';
import { ExtNativeCoverityService } from '../shared/ext-native-coverity.service';

declare var Prism;
if (Prism) {
  Prism.plugins.filterHighlightAll.reject.addSelector('pre[tabindex] > code');
}

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
  
  fileCache: {[fileName: string]: { content?: string, issues: CoverityIssueV2[] }} = {};
  highlightLocker = {};
  collapseAll = false;
  occasionalChecker;

  constructor(private covService: ExtNativeCoverityService) {
    
  }

  ngOnInit() {
    
  }

  toggleCollapseAll() {
    this.collapseAll = !this.collapseAll;
  }

  nudgeHighlight() {
    const locker = this.highlightLocker = {};
    setTimeout(() => {
      if (locker !== this.highlightLocker) { return; }
      Prism.highlightAll();
    }, 1000);
  }

  langClass(issue: CoverityIssueV2) {
    switch(issue.language.toLowerCase()) {
      case 'c/c++': return 'language-clike';
      case 'cuda': return 'language-clike';
      case 'c#': return 'language-csharp';
      case 'java': return 'language-java';
      case 'apex': return 'language-apex';
      case 'kotlin': return 'language-kotlin';
      case 'text': return 'language-text';
      case 'vb.net': return 'language-vbnet';
      case 'scala': return 'language-scala';
      case 'fortran': return 'language-fortran';
      case 'go': return 'language-go';
      case 'html': return 'language-markup';
      case 'javascript': return 'language-javascript';
      case 'objective-c': return 'language-objectivec';
      case 'php': return 'language-php';
      case 'python': return 'language-python';
      case 'html': return 'language-markup';
      case 'ruby': return 'language-ruby';
      case 'swift': return 'language-swift';
      case 'typescript': return 'language-typescript';
      default: return 'language-text';
    }
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
        this.nudgeHighlight();
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

