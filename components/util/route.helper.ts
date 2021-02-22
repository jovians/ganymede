/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Route, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';
import { ResourceGuard } from '../services/resource-guard';

const baseRouteData = {};

export function getBaseRouteData(baseRoute: string) {
  const segs = location.pathname.split('/'); segs.shift();
  console.log(segs);
  return baseRouteData[baseRoute];
}

export function consumeSubDir(path: string, routeData?: RouteData) {
  const pathSplit = path.split('/');
  const matcher = (segments: UrlSegment[]) => {
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
      let node = routeData.pageData;
      for (let i = 0; i < segments.length; ++i) {
        const seg = segments[i];
        if (!node || node.path !== seg.path) {
          ResourceGuard.routeStatic = false;
          break;
        }
        const nextPath = segments[i + 1] ? segments[i + 1].path : null;
        node = node.children ? node.children.filter(child => child.path === nextPath)[0] : null;
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
  children?: RouteDataNavigatableContent[];
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

export interface RouteData {
  templateData: RouteDataTemplate;
  pageData: RouteDataPage;
  staticOnly?: boolean;
  dynamicRoutes?: { pattern: string; resolver: string | ((path: string) => Promise<any>); }[];
}
