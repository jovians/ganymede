/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, DetachedRouteHandle } from '@angular/router';
import { ganylog } from '../util/console.util';
import { RouteObservingService } from './route-observing.service';

declare var window: any;

interface SavedScroll {
  main: { target: Element; x: number; y: number; };
  others?: { target: Element; x: number; y: number; }[];
}

@Injectable({
  providedIn: 'root'
})
export class RouteReuser {

  scrollLocker: {} = {};
  storedRoutes = new Map<string, DetachedRouteHandle>();

  constructor(
    private routeObserver: RouteObservingService,
  ) {
    // Saving scroll save target scroll data as soon as new nav req is triggered.
    this.routeObserver.eventNavigationStart.subscribe(e => {
      // reuseSubPath
      const recognizedHandle: any = this.storedRoutes.get(e.url);
      if (recognizedHandle) {
        const lastUrl = recognizedHandle.componentRef.instance.lastUrl;
        if (e.url !== lastUrl) {
          window.ngRouter.navigate([lastUrl]);
        }
      }
      if (this.routeObserver.scrollSaveTarget) {
        const contArea = this.routeObserver.scrollSaveTarget.nativeElement;
        contArea.savedScrolls = {
          main: { target: contArea, x: contArea.scrollLeft, y: contArea.scrollTop, }
        } as SavedScroll;
      }
    });
    this.routeObserver.eventActivationStart.subscribe(e => {
      if (e.snapshot.data && e.snapshot.data.pathOverwrite) {
        const targetPath = this.activatedRouteToPath(e.snapshot);
        const overwriteList = e.snapshot.data.pathOverwrite;
        for (const overwrite of overwriteList) {
          if (overwrite && overwrite.call && overwrite.apply) {
            let newTarget = null;
            try { newTarget = overwrite(targetPath, e); } catch (e2) { ganylog('RouteReuser', e2); }
            if (typeof newTarget === 'string') {
              window.ngRouter.navigate([newTarget]);
              return;
            }
          } else if (targetPath === overwrite.from) {
            window.ngRouter.navigate([overwrite.to]);
            return;
          }
        }
      }
    });
  }

  shouldReuseRoute(before: ActivatedRouteSnapshot, curr: ActivatedRouteSnapshot): boolean {
    return before.routeConfig === curr.routeConfig;
  }
  retrieve(route: ActivatedRouteSnapshot): DetachedRouteHandle {
    const path = this.getPath(route);
    if (path === null) { return null; }
    const cached = this.storedRoutes.get(path);
    if (!cached) { return null; }
    const compoRef = (cached as any).componentRef;
    if (compoRef && compoRef.instance && compoRef.instance.onRouteRestore) {
      compoRef.instance.onRouteRestore();
    }
    return cached as DetachedRouteHandle;
  }
  shouldAttach(route: ActivatedRouteSnapshot): boolean {
    let doAttach = false;
    const path = this.getPath(route);
    if (path === null) { return false; }
    if (this.routeHasData(route) && route.routeConfig.data.reuse) {
      doAttach = this.storedRoutes.has(path) ? true : false;
      if (doAttach) {
        const cached = this.storedRoutes.get(path);
        const savedScrolls: SavedScroll = (cached as any).savedScrolls;
        if (savedScrolls) {
          savedScrolls.main.target.scrollLeft = savedScrolls.main.x;
          savedScrolls.main.target.scrollTop = savedScrolls.main.y;
          const scrollLocker = this.scrollLocker = {};
          setTimeout(() => {
            if (scrollLocker !== this.scrollLocker) { return; }
            savedScrolls.main.target.scrollLeft = savedScrolls.main.x;
            savedScrolls.main.target.scrollTop = savedScrolls.main.y;
          }, 0);
        }
      } else {
        if (this.routeObserver.scrollSaveTarget) {
          this.routeObserver.scrollSaveTarget.nativeElement.scrollTop = 0;
        }
      }
    }
    return doAttach;
  }
  shouldDetach(route: ActivatedRouteSnapshot): boolean {
    if (this.routeHasData(route)) {
      return route.routeConfig.data.reuse ? true : false;
    }
    return false;
  }
  store(route: ActivatedRouteSnapshot, detachedTree: DetachedRouteHandle) {
    if (!detachedTree) { return; }
    const path = this.getPath(route);
    if (path === null || path === undefined) { return; }
    const compoRef = (detachedTree as any).componentRef;
    if (this.routeObserver.scrollSaveTarget) {
      (detachedTree as any).savedScrolls = this.routeObserver.scrollSaveTarget.nativeElement.savedScrolls;
    }
    if (compoRef && compoRef.instance && compoRef.instance.onRouteSave) {
      compoRef.instance.onRouteSave();
    }
    const compo = compoRef.instance;
    this.storedRoutes.set(path, detachedTree);
    if (path !== this.routeObserver.currentUrl) {
      this.storedRoutes.set(this.routeObserver.currentUrl, detachedTree);
    }
    compo.lastUrl = this.routeObserver.currentUrl;
  }
  activatedRouteToPath(route: ActivatedRouteSnapshot) {
    const paths = [];
    for (const seg of route.url) {
      paths.push(seg.path);
    }
    return `/${paths.join('/')}`;
  }
  private routeHasData(route: ActivatedRouteSnapshot) {
    return route && route.routeConfig && route.routeConfig.data;
  }
  private getPath(route: ActivatedRouteSnapshot): string {
    if (route.routeConfig) {
      if (route.routeConfig.path !== null && route.routeConfig.path !== undefined) {
        return '/' + route.routeConfig.path;
      } else if ((route.routeConfig as any).basePath) {
        return '/' + (route.routeConfig as any).basePath;
      }
    }
    return null;
  }
}
