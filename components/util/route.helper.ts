/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { RouterEvent, UrlMatchResult, UrlSegment } from '@angular/router';
import { ResourceGuard } from '../services/resource-guard';

const baseRouteData = {};

export let currentRouteChildData: RouteDataNavigatableContent = null;

export let currentRouteData: RouteData = null;

export function getBaseRouteData(baseRoute: string) {
  const segs = location.pathname.split('/'); segs.shift();
  // console.log(segs);
  return baseRouteData[baseRoute];
}

export function consumeSubDir(path: string, routeData?: RouteData, exceptions?: {[path: string]: any}) {
  const pathSplit = path.split('/');
  const matcher = (segments: UrlSegment[]) => {
    currentRouteChildData = routeData as any;
    currentRouteData = routeData;
    if (exceptions) {
      const fullPath = segments.map(seg => seg.path).join('/');
      if (exceptions[fullPath]) {
        return null;
      }
    }
    // match base path
    for (let i = 0; i < pathSplit.length; ++i) {
      if (pathSplit[i] !== segments[i].path) {
        return null;
      }
    }
    ResourceGuard.routeStatic = true;
    ResourceGuard.routeNeedsResolution = false;
    ResourceGuard.routeResolver = null;
    if (routeData) {
      baseRouteData[path] = routeData;
      let lastTruthyNode = routeData.pageData;
      let node = routeData.pageData;
      for (let i = 0; i < segments.length; ++i) {
        const seg = segments[i];
        if (!node || node.path !== seg.path) {
          ResourceGuard.routeStatic = false;
          break;
        }
        const nextPath = segments[i + 1] ? segments[i + 1].path : null;
        node = node.children ? node.children.filter(child => child.path === nextPath)[0] : null;
        if (node) { lastTruthyNode = node; }
      }
      if (lastTruthyNode) {
        currentRouteChildData = lastTruthyNode as any;
      } else {
        currentRouteChildData = routeData as any;
      }
    }
    if (!ResourceGuard.routeStatic) {
      if (routeData.staticOnly) {
        ResourceGuard.routeNeedsResolution = false;
      } else if (routeData.dynamicRoutes && routeData.dynamicRoutes.length > 0) {
        const joinedPath = segments.map(a => a.path).join('/');
        for (const dynaRoute of routeData.dynamicRoutes) {
          if (!dynaRoute.pattern.endsWith('*')) { continue; }
          if (joinedPath.startsWith(dynaRoute.pattern.split('*')[0])) {
            ResourceGuard.routeNeedsResolution = true;
            if (typeof dynaRoute.resolver === 'string') {
              ResourceGuard.routeResolver = (lookUpPath: string): Promise<any> => {
                return new Promise(resolve => {
                  const req = new XMLHttpRequest();
                  req.open('GET', dynaRoute.resolver + '?path=' + lookUpPath, true);
                  req.onreadystatechange = () => {
                    if (req.readyState !== 4) { return; }
                    if (req.status !== 200) { return resolve(null); }
                    try {
                      resolve(JSON.parse(req.responseText));
                    } catch (e) { resolve(null); }
                  };
                  req.send();
                });
              };
            } else {
              ResourceGuard.routeResolver = dynaRoute.resolver as (path: string) => Promise<any>;
            }
            break;
          }
        }
      }
    }
    return { consumed: segments }  as UrlMatchResult;
  };
  return matcher;
}

export function asRouteBasic(subdir: string, routeData: RouteData, otherParams?: any) {
  const exceptions: {[path: string]: any} = {};
  const otherRouteDivisions: RouteMatchableDefinition[] = [];
  const routeDef: RouteMatchableDefinition =  {
    matcher: consumeSubDir(subdir, routeData, exceptions),
    exceptions,
    component: null,
    canActivate: [ResourceGuard],
    data: routeData,
    basePath: subdir,
  };
  if (otherParams) { Object.assign(routeDef, otherParams); }
  if (routeData.pageData) {
    routeData.pageData.path = subdir;
  }
  if (routeData.pageData.children) {
    const basepath = routeData.pageData.mountpath ?
                      routeData.pageData.mountpath + '/' + routeData.pageData.path
                    : routeData.pageData.path;
    for (const childRoute of routeData.pageData.children) {
      childRoute.link = basepath + '/' + childRoute.path;
      if (childRoute.component) { exceptions[childRoute.link] = childRoute; }
      if (childRoute.children) {
        for (const childRoute2 of childRoute.children) {
          childRoute2.link = basepath + '/' + childRoute.path + '/' + childRoute2.path;
          if (childRoute2.component) { exceptions[childRoute2.link] = childRoute2; }
        }
      }
    }
  }
  for (const exceptedRoute of Object.keys(exceptions)) {
    const route = exceptions[exceptedRoute];
    otherRouteDivisions.push({
      path: exceptedRoute,
      component: route.component,
      canActivate: [ResourceGuard],
      data: routeData,
      basePath: subdir,
    });
  }
  return {
    main: routeDef,
    others: otherRouteDivisions
  };
}

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
  canActivate: (typeof ResourceGuard)[];
  data: RouteData;
  basePath: string;
}

export interface RouteData {
  templateData: RouteDataTemplate;
  pageData: RouteDataPage;
  reuse?: boolean;
  pathOverwrite?: ({from: string, to: string} | ((path: string, e?: RouterEvent) => (string | void)))[];
  staticOnly?: boolean;
  dynamicRoutes?: { pattern: string; resolver: string | ((path: string) => Promise<any>); }[];
}
