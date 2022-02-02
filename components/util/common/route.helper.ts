/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { UrlMatchResult, UrlSegment } from '@angular/router';
import { ResourceGuard } from '../../services/resource-guard';
import {
  baseRouteData, currentRoute, RouteDataPage,
  RouteData, RouteMatchableDefinition, RouteDataNavigatableContent
} from './route.model';

export { RouteData, RouteMatchableDefinition, RouteDataPage, RouteDataNavigatableContent };

export function getBaseRouteData(baseRoute: string) {
  const segs = location.pathname.split('/'); segs.shift();
  // console.log(segs);
  return baseRouteData[baseRoute];
}

export function consumeSubDir(path: string, routeData?: RouteData, exceptions?: {[path: string]: any}) {
  const pathSplit = path.split('/');
  const matcher = (segments: UrlSegment[]) => {
    currentRoute.routeChildData = routeData as any;
    currentRoute.routeData = routeData;
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
        currentRoute.routeChildData = lastTruthyNode as any;
      } else {
        currentRoute.routeChildData = routeData as any;
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

export function asRouteBasic<T = any>(subdir: string, routeData: RouteData<T>) {
  const exceptions: {[path: string]: any} = {};
  const otherRouteDivisions: RouteMatchableDefinition[] = [];
  const routeDef: RouteMatchableDefinition = {
    matcher: consumeSubDir(subdir, routeData, exceptions),
    exceptions,
    component: null,
    canActivate: [ResourceGuard],
    data: routeData,
    basePath: subdir,
  };
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
