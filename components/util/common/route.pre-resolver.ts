/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { UrlSegment, DefaultUrlSerializer } from '@angular/router';
import { ganymedeAppData } from '../../../../../../ganymede.app';

const serializer = new DefaultUrlSerializer();

export async function preResolvePath(pathString?: string): Promise<any> {
  return new Promise(resolve => {
    if (!pathString) { pathString = location.pathname; }
    if (pathString === '/') { return resolve(null); }
    const paths = pathString.split('/'); // /my/path => ['', 'my', 'path']
    if (pathString.startsWith('/')) { paths.shift(); } // => ['my', 'path']
    const consumablePaths = JSON.parse(JSON.stringify(paths));
    const segs: UrlSegment[] = serializer.parse(pathString).root.children.primary.segments;
    let defaultRoute;
    let routeNode = ganymedeAppData.routes;
    let count = 0;
    while (consumablePaths.length > 0 && count < 32) {
      ++count;
      let resolvedNode = null;
      for (const route of routeNode) {
        if (route.matcher) {
          const consumed = route.matcher(segs);
          if (consumed) { return resolve(route); }
        } else if (route.path) {
          const pathPattern = route.path;
          const subpaths = pathPattern.split('/');
          if (consumablePaths.length > subpaths.length) { continue; }
          if (pathString.startsWith('/')) { paths.shift(); }
          let consumedCount = 0;
          for (let i = 0; i < consumablePaths.length; ++i) {
            const consumablePath = consumablePaths[i];
            if (subpaths[i].startsWith(':') || consumablePath === subpaths[i]) {
              ++consumedCount;
            } else { break; }
          }
          if (consumedCount > 0) { resolvedNode = route; }
          for (let i = 0; i < consumedCount; ++i) { consumablePaths.shift(); }
          if (consumablePaths.length === 0) { return resolve(resolvedNode); }
        } else {
          defaultRoute = route;
        }
      }
      if (!resolvedNode) {
        if (defaultRoute) {
          return resolve(defaultRoute);
        } else {
          return resolve(null);
        }
      } else {
        routeNode = resolvedNode;
      }
    }
    resolve(null);
  });
}
