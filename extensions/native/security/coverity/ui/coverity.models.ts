/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export interface CoverityReportRouteParams {
  settingsPath: string;
}

export interface CoverityReportSettings {
  includePaths: {
    type: 'contains' | 'startsWith' | 'endsWith' | 'exactly',
    pattern: string;
  }[];
  ignorePaths: {
    type: 'contains' | 'startsWith' | 'endsWith' | 'exactly',
    pattern: string;
  }[];
  referenceFile: {
    source?: 'static-hashed' | string;
    folder?: 'files' | string;
  };
  codePath: string;
  resultsFolder: 'output' | string;
  issueTypesFile: 'issueTypes.json' | string;
  reportPreviewFile: 'preview-report.json' | string;
  comparisonReport: 'NONE' | string;
  comparisonReportName: 'Current ToT' | string;
}

export interface CoverityIssueTypesFormatV1 {
  cim_checker_properties: {
    category: string;
    cweCategory: number;
    impact: string;
    qualityKind: boolean;
    ruleStrength: string;
    securityKind: boolean;
    subcategory: string;
    testKind: boolean;
  };
  'code-language': string;
  description: { [lang: string]: string; };
  local_effect: { [lang: string]: string; };
  name: { [lang: string]: string; };
  origin: string;
  subtype: string;
  type: string;
}

export interface CoverityRawIssueOccurenceV2 {
  checker: string;
  componentDefaultOwner: string;
  componentDefaultOwnerLdapServer: string;
  componentName: string;
  extra: string;
  file: string;
  function: string;
  language: string;
  mainEventDescription: string;
  mainEventLineNumber: number;
  mainEventHash: string; // added
  mergeWithLowercaseFile: boolean;
  score: number
  subcategory: string;
}

export interface CoverityRawIssueV2 {
  cid: number;
  customTriage?: any;
  firstDetectedDateTime: string; // date string UTC
  mergeKey: string;
  typeAndLang?: string;
  occurrences: CoverityRawIssueOccurenceV2[];
  ownerLdapServerName: string;
  presentInComparisonSnapshot: boolean;
  triage: {
    action: string;
    classification: string;
    externalReference: string;
    fixTarget: string;
    legacy: string;
    owner: string;
    severity: string;
  };
}

export interface CoverityIssueV2 {
  cid: number;
  localIndex: number;
  firstDetected: Date;
  mergeKey: string;
  typeAndLang?: string;
  kind?: CoverityIssueTypesFormatV1;
  severity: string;
  checker: string;
  componentDefaultOwner: string;
  componentDefaultOwnerLdapServer: string;
  componentName: string;
  extra: string;
  file: string;
  fileRef?: {
    content?: string;
    slice?: string;
    highlightedContent?: string;
  };
  fileNameHash: string;
  withinSameFile?: CoverityIssueV2[];
  relPath: string;
  function: string;
  language: string;
  mainEventDescription: string;
  mainEventLineNumber: number;
  mergeWithLowercaseFile: boolean;
  score: number
  subcategory: string;
  ownerLdapServerName: string;
  presentInComparisonSnapshot: boolean;
  triageAction: string;
  triageClassification: string;
  triageExternalReference: string;
  triageFixTarget: string;
  triageLegacy: string;
  triageOwner: string;
  triageSeverity: string;
  excluded?: boolean;
  excludedReason?: string;
}

export interface CoverityIssueTypesListFormatV1 {
  format_version: 1;
  type: string;
  issue_type: CoverityIssueTypesFormatV1[];
}

export interface CoverityIssueTypeMapV2 {
  [typeAndLang: string]: CoverityIssueTypesFormatV1;
}

export interface CoverityReportPreviewV2 {
  header: {
    format: string;
    version: 2;
  };
  analysisInfo: {
    command: string;
    comparisonSnapshotId: string;
    ownerAssignmentRule: string;
    reportTimestamp: string; // date string UTC
    user: string;
  };
  issueInfo: CoverityRawIssueV2[];
}

export interface CoverityReportSummaryView {
  localIndexCounter: number;
  typeMap?: CoverityIssueTypeMapV2;
  settings?: CoverityReportSettings;
  raw: {
    issueListTotal?: CoverityRawIssueV2[];
    comparisonIssueListTotal?: CoverityRawIssueV2[];
  };
  byOccurrence: {
    issueList?: CoverityIssueV2[];
    issueListTotal?: CoverityIssueV2[];
    comparisonIssueList?: CoverityIssueV2[];
    comparisonIssueListTotal?: CoverityIssueV2[];
    deltaIssueList?: CoverityIssueV2[];
  };
  byFile: {
    issueMap?: { [fileName: string]: CoverityIssueV2[] };
    issueMapTotal?: { [fileName: string]: CoverityIssueV2[] };
    comparisonIssueMap?: { [fileName: string]: CoverityIssueV2[] };
    comparisonIssueMapTotal?: { [fileName: string]: CoverityIssueV2[] };
    deltaIssueMap?: { [fileName: string]: CoverityIssueV2[] };
  };
  bySeverity: {
    issueMap?: CoverityReportSummaryViewBySeverity;
    issueMapTotal?: CoverityReportSummaryViewBySeverity;
    comparisonIssueMap?: CoverityReportSummaryViewBySeverity;
    comparisonIssueMapTotal?: CoverityReportSummaryViewBySeverity;
    deltaIssueMap?: CoverityReportSummaryViewBySeverity;
  };
}

interface CoverityReportSummaryViewBySeverity {
  critical: CoverityIssueV2[];
  high: CoverityIssueV2[];
  medium: CoverityIssueV2[];
  low: CoverityIssueV2[];
  unknown: CoverityIssueV2[];
}