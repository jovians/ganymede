/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { AppService } from 'src/app/ganymede/components/services/app.service';
import { CoverityIssueTypesFormatV1, CoverityIssueTypesListFormatV1, CoverityIssueV2, CoverityRawIssueV2, CoverityReportPreviewV2, CoverityReportSettings, CoverityReportSummaryView } from '../../coverity.models';

@Injectable({
  providedIn: 'root'
})
export class ExtNativeCoverityService {

  langMap: {[lang: string]: boolean} = {};

  constructor(public app: AppService) { }
  
  loadFromUrl(url: string): Promise<CoverityReportSummaryView> {
    const summary: CoverityReportSummaryView = {
      settings: null,
      typeMap: {},
      localIndexCounter: 0,
      raw: {
        issueListTotal: [],
        comparisonIssueListTotal: [],
      },
      byOccurrence: {
        issueList: [],
        issueListTotal: [],
        comparisonIssueList: [],
        comparisonIssueListTotal: [],
        deltaIssueList: [],
      },
      byFile: {
        issueMap: {},
        issueMapTotal: {},
        comparisonIssueMap: {},
        comparisonIssueMapTotal: {},
        deltaIssueMap: {},
      },
      bySeverity: {
        issueMap: { critical: [], high: [], medium: [], low: [], unknown: [] },
        issueMapTotal: { critical: [], high: [], medium: [], low: [], unknown: [] },
        comparisonIssueMap: { critical: [], high: [], medium: [], low: [], unknown: [] },
        comparisonIssueMapTotal: { critical: [], high: [], medium: [], low: [], unknown: [] },
        deltaIssueMap: { critical: [], high: [], medium: [], low: [], unknown: [] },
      },
    };
    return new Promise<CoverityReportSummaryView>(resolve => {
      const resolver: FetchResolveStatus = {
        typeMapResolved: false,
        issuesResolved: false,
        comparisonResolved: false,
        tryResolving: () => {
          if (resolver.typeMapResolved && resolver.issuesResolved && resolver.comparisonResolved) {
            return resolve(summary);
          }
        }
      };
      this.app.http.get<CoverityReportSettings>(url).subscribe(settings => {
        if (!settings.issueTypesFile) { settings.issueTypesFile = 'issueTypes.json'; }
        if (!settings.reportPreviewFile) { settings.reportPreviewFile = 'preview-report.json'; }
        if (!settings.referenceFile) { settings.referenceFile = {}; }
        if (!settings.referenceFile.source) { settings.referenceFile.source = 'static-hashed'; }
        if (!settings.referenceFile.folder) { settings.referenceFile.folder = 'files'; }
        summary.settings = settings;
        this.app.http.get<CoverityIssueTypesListFormatV1>(`${settings.resultsFolder}/${settings.issueTypesFile}`).subscribe(res => {
          for (const issueType of res.issue_type) {
            const lang = issueType['code-language'];
            summary.typeMap[`${issueType.type}::${lang}`] = this.processIssueType(issueType);
          }
          resolver.typeMapResolved = true;
          this.fetchReportFiles(summary, resolver);
        });
      });
    });
    
  }

  processIssueType(info: CoverityIssueTypesFormatV1) {
    if (info.description.en.indexOf('sb_checker_ref.html') >= 0) {
      try {
        info.description.en = info.description.en.replace(
          `/doc/en/spotbugs/sb_checker_ref.html#${info.type}`,
          `https://spotbugs.readthedocs.io/en/stable/bugDescriptions.html#${info.type.split('.')[1].replace(/_/g, '-').toLowerCase()}`)
      } catch (e) {}
    }
    if (info['code-language']) { this.langMap[info['code-language']] = true; }
    return info;
  }

  fetchReportFiles(summary: CoverityReportSummaryView, resolver: FetchResolveStatus) {
    const settings = summary.settings;
    this.app.http.get<CoverityReportPreviewV2>(`${settings.resultsFolder}/${settings.reportPreviewFile}`).subscribe(async res => {
      summary.raw.issueListTotal = [];
      summary.byOccurrence.issueList = [];
      summary.byOccurrence.issueListTotal = [];
      summary.byFile.issueMap = {};
      summary.byFile.issueMapTotal = {};
      summary.bySeverity.issueMap = { critical: [], high: [], medium: [], low: [], unknown: [] };
      summary.bySeverity.issueMapTotal = { critical: [], high: [], medium: [], low: [], unknown: [] };
      for (const issue of res.issueInfo) {
        summary.raw.issueListTotal.push(issue);
        const processedList = this.processIntoIssues(issue, summary);
        summary.byOccurrence.issueListTotal.push(...processedList);
        for (const issue2 of processedList) {
          if (!summary.byFile.issueMapTotal[issue2.file]) { summary.byFile.issueMapTotal[issue2.file] = []; }
          issue2.withinSameFile = summary.byFile.issueMapTotal[issue2.file];
          summary.byFile.issueMapTotal[issue2.file].push(issue2);
          summary.bySeverity.issueMapTotal[issue2.severity].push(issue2);
        }
        const processedFiltered = processedList.filter(i => this.shouldBeIncluded(i, settings));
        summary.byOccurrence.issueList.push(...processedFiltered);
        for (const issue2 of processedFiltered) {
          if (!summary.byFile.issueMap[issue2.file]) { summary.byFile.issueMap[issue2.file] = []; }
          summary.byFile.issueMap[issue2.file].push(issue2);
          summary.bySeverity.issueMap[issue2.severity].push(issue2);
        }
      }
      summary.byOccurrence.issueListTotal = summary.byOccurrence.issueListTotal.sort((a, b) => b.file.localeCompare(a.file));
      const allProms = [];
      for (const issue of summary.byOccurrence.issueListTotal) {
        allProms.push(this.app.service.crypto.sha256(issue.file).then(hash => {
          issue.fileNameHash = hash;
        }));
      }
      await Promise.all(allProms);
      summary.byOccurrence.issueList = summary.byOccurrence.issueList.sort((a, b) => b.file.localeCompare(a.file));
      for (const key of Object.keys(summary.byFile.issueMapTotal)) {
        summary.byFile.issueMapTotal[key] = summary.byFile.issueMapTotal[key].sort((a, b) => b.mainEventLineNumber - a.mainEventLineNumber);
      }
      for (const key of Object.keys(summary.byFile.issueMapTotal)) {
        summary.byFile.issueMapTotal[key] = summary.byFile.issueMapTotal[key].sort((a, b) => b.mainEventLineNumber - a.mainEventLineNumber);
      }
      resolver.issuesResolved = true;
      resolver.tryResolving();
    });
    if (settings.comparisonReport) {
      this.app.http.get<CoverityReportPreviewV2>(`${settings.resultsFolder}/${settings.comparisonReport}`).subscribe(async res => {
        summary.raw.comparisonIssueListTotal = [];
        summary.byOccurrence.comparisonIssueList = [];
        summary.byOccurrence.comparisonIssueListTotal = [];
        summary.byFile.comparisonIssueMap = {};
        summary.byFile.comparisonIssueMapTotal = {};
        summary.bySeverity.comparisonIssueMap = { critical: [], high: [], medium: [], low: [], unknown: [] };
        summary.bySeverity.comparisonIssueMapTotal = { critical: [], high: [], medium: [], low: [], unknown: [] };
        for (const issue of res.issueInfo) {
          summary.raw.comparisonIssueListTotal.push(issue);
          const processedList = this.processIntoIssues(issue, summary);
          summary.byOccurrence.comparisonIssueListTotal.push(...processedList);
          for (const issue2 of processedList) {
            if (!summary.byFile.comparisonIssueMapTotal[issue2.file]) { summary.byFile.comparisonIssueMapTotal[issue2.file] = []; }
            issue2.withinSameFile = summary.byFile.comparisonIssueMapTotal[issue2.file];
            summary.byFile.comparisonIssueMapTotal[issue2.file].push(issue2)
            summary.bySeverity.comparisonIssueMapTotal[issue2.severity].push(issue2);
          }
          const processedFiltered = processedList.filter(i => this.shouldBeIncluded(i, settings));
          summary.byOccurrence.comparisonIssueList.push(...processedFiltered);
          for (const issue2 of processedFiltered) {
            if (!summary.byFile.comparisonIssueMap[issue2.file]) { summary.byFile.comparisonIssueMap[issue2.file] = []; }
            summary.byFile.comparisonIssueMap[issue2.file].push(issue2)
            summary.bySeverity.comparisonIssueMap[issue2.severity].push(issue2);
          }
        }
        summary.byOccurrence.comparisonIssueListTotal = summary.byOccurrence.comparisonIssueListTotal.sort((a, b) => b.file.localeCompare(a.file));
        const allProms = [];
        for (const issue of summary.byOccurrence.comparisonIssueListTotal) {
          allProms.push(this.app.service.crypto.sha256(issue.file).then(hash => {
            issue.fileNameHash = hash;
          }));
        }
        await Promise.all(allProms);
        summary.byOccurrence.comparisonIssueList = summary.byOccurrence.comparisonIssueList.sort((a, b) => b.file.localeCompare(a.file));
        for (const key of Object.keys(summary.byFile.comparisonIssueMap)) {
          summary.byFile.comparisonIssueMap[key] = summary.byFile.comparisonIssueMap[key].sort((a, b) => b.mainEventLineNumber - a.mainEventLineNumber);
        }
        for (const key of Object.keys(summary.byFile.comparisonIssueMapTotal)) {
          summary.byFile.comparisonIssueMapTotal[key] = summary.byFile.comparisonIssueMapTotal[key].sort((a, b) => b.mainEventLineNumber - a.mainEventLineNumber);
        }
        resolver.comparisonResolved = true;
        resolver.tryResolving();
      });
    } else {
      resolver.comparisonResolved = true;
    }
  }

  shouldBeIncluded(issue: CoverityIssueV2, settings: CoverityReportSettings) {
    for (const rule of settings.includePaths) {
      let filterOut = (
        (rule.type === 'exactly' && issue.file !== rule.pattern) ||
        (rule.type === 'contains' && issue.file.indexOf(rule.pattern) === -1) ||
        (rule.type === 'startsWith' && !issue.file.startsWith(rule.pattern)) ||
        (rule.type === 'endsWith' && !issue.file.endsWith(rule.pattern))
      );
      if (filterOut) {
        issue.excluded = true;
        issue.excludedReason = `ignored issue ${issue.file}:${issue.mainEventLineNumber} due to includePaths:(${rule.type}):(${rule.pattern})`;
        return false;
      }
    }
    for (const rule of settings.ignorePaths) {
      let filterOut = (
        (rule.type === 'exactly' && issue.file === rule.pattern) ||
        (rule.type === 'contains' && issue.file.indexOf(rule.pattern) >= 0) ||
        (rule.type === 'startsWith' && issue.file.startsWith(rule.pattern)) ||
        (rule.type === 'endsWith' && issue.file.endsWith(rule.pattern))
      );
      if (filterOut) {
        issue.excluded = true;
        issue.excludedReason = `ignored issue ${issue.file}:${issue.mainEventLineNumber} due to ignorePaths:(${rule.type}):(${rule.pattern})`;
        return false;
      }
    }
    return true;
  }

  processIntoIssues(rawIssue: CoverityRawIssueV2, summary: CoverityReportSummaryView): CoverityIssueV2[] {
    const list: CoverityIssueV2[] = [];
    for (const occ of rawIssue.occurrences) {
      const typeAndLang = `${occ.checker}::${occ.language.toLocaleLowerCase()}`;
      let kind = summary.typeMap[typeAndLang];
      if (!kind) { kind = this.getUnknownIssueType(occ.checker, occ.language); }
      const severity = kind?.cim_checker_properties?.impact ? kind.cim_checker_properties.impact.toLocaleLowerCase() : 'unknown';
      const issue: CoverityIssueV2 = {
        cid: rawIssue.cid,
        firstDetected: new Date(rawIssue.firstDetectedDateTime),
        mergeKey: rawIssue.mergeKey,
        kind,
        severity,
        typeAndLang,
        localIndex: summary.localIndexCounter++,

        checker: occ.checker,
        componentDefaultOwner: occ.componentDefaultOwner,
        componentDefaultOwnerLdapServer: occ.componentDefaultOwnerLdapServer,
        componentName: occ.componentName,
        extra: occ.extra,
        file: occ.file,
        fileNameHash: '',
        relPath: occ.file.startsWith(summary.settings.codePath) ? occ.file.split(summary.settings.codePath)[1] : occ.file,
        function: occ.function,
        language: occ.language,
        mainEventDescription: occ.mainEventDescription,
        mainEventLineNumber: occ.mainEventLineNumber,
        mergeWithLowercaseFile: occ.mergeWithLowercaseFile,
        score: occ.score,
        subcategory: occ.subcategory,

        ownerLdapServerName: rawIssue.ownerLdapServerName,
        presentInComparisonSnapshot: rawIssue.presentInComparisonSnapshot,
        triageAction: rawIssue.triage.action,
        triageClassification: rawIssue.triage.classification,
        triageExternalReference: rawIssue.triage.externalReference,
        triageFixTarget: rawIssue.triage.fixTarget,
        triageLegacy: rawIssue.triage.legacy,
        triageOwner: rawIssue.triage.owner,
        triageSeverity: rawIssue.triage.severity,

        excluded: false,
        excludedReason: '',
      };
      if (issue.relPath.startsWith('/')) { issue.relPath = issue.relPath.slice(1); }
      list.push(issue);
    }
    return list;
  }

  fileNameOf(issue: CoverityIssueV2) {
    return issue.relPath.indexOf('/') >= 0 ? issue.relPath.split('/').slice(-1)[0] : issue.relPath;
  }

  referenceFileOf(issue: CoverityIssueV2) {
    return `${this.fileNameOf(issue)}.${issue.fileNameHash}.txt`;
  }

  getFile(url: string) {
    return new Promise<string>(resolve => {
      this.app.http.get(url, { responseType: 'text'}).subscribe(data => {
        resolve(data);
      }, e => {
        resolve(null);
      });
    });
  }

  getUnknownIssueType(identifier: string, lang: string, name?: string) {
    if (!name) { name = identifier; } 
    return {
      cim_checker_properties: {
        category: null,
        cweCategory: null,
        impact: 'Unknown',
        qualityKind: null,
        ruleStrength: null,
        securityKind: null,
        subcategory: null,
        testKind: null,
      },
      'code-language': lang,
      description: { en: '', },
      local_effect: { en: '', },
      name: { en: name, },
      origin: null,
      subtype: null,
      type: identifier,
    };
  }

}

interface FetchResolveStatus {
  typeMapResolved: boolean;
  issuesResolved: boolean;
  comparisonResolved: boolean;
  tryResolving: () => any;
}
