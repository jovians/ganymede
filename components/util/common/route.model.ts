/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { RouterEvent, UrlMatchResult, UrlSegment } from '@angular/router';

export const baseRouteData = {};

export const currentRoute = {
  routeData: null as RouteData,
  routeChildData: null as RouteDataNavigatableContent,
};

export interface RouteDataTemplate {
  layout?: string;
  scrollbar?: 'show' | 'hide';
}

export interface RouteDataNavigatableContent {
  name: string;
  path?: string;
  link?: string;
  type?: string;
  md?: string;
  root?: string;
  leftNavType?: string;
  hasContent?: boolean;
  children?: RouteDataNavigatableContent[];
  component?: any;
  canActivate?: any;
  layout?: any;
  data?: any;
}

export interface RouteDataPage {
  name?: string;
  path?: string;
  link?: string;
  type?: string;
  root?: string;
  mountpath?: string;
  nolang?: boolean;
  children?: RouteDataNavigatableContent[];
}

export interface RouteMatchableDefinition {
  path?: string;
  matcher?: (segments: UrlSegment[]) => UrlMatchResult;
  exceptions?: {[path: string]: any};
  component: any;
  canActivate: any[];
  data: RouteData;
  basePath: string;
}

export interface RouteData<T = any> {
  templateData: RouteDataTemplate;
  pageData: RouteDataPage;
  pageParams?: T;
  reuse?: boolean;
  pathOverwrite?: ({from: string, to: string} | ((path: string, e?: RouterEvent) => (string | void)))[];
  staticOnly?: boolean;
  dynamicRoutes?: { pattern: string; resolver: string | ((path: string) => Promise<any>); }[];
}
