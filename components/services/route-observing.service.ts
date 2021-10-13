/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ElementRef, Injectable } from '@angular/core';
import { ActivatedRoute, ActivationStart, NavigationEnd, NavigationStart, RouteConfigLoadEnd, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { currentRoute } from '../util/common/route.model';

@Injectable({
  providedIn: 'root'
})
export class RouteObservingService {

  router: Router;
  route: ActivatedRoute;

  scrollSaveTarget: ElementRef = null;
  scrollSaveTargetOthers: ElementRef[] = [];

  differentComponentSibiling = false;

  eventNavigationStart: Subject<NavigationStart> = new Subject<NavigationStart>();
  eventNavigationdEnd: Subject<NavigationEnd> = new Subject<NavigationEnd>();
  eventActivationStart: Subject<ActivationStart> = new Subject<ActivationStart>();
  eventConfigLoadEnd: Subject<RouteConfigLoadEnd> = new Subject<RouteConfigLoadEnd>();
  eventRouteChange: Subject<string> = new Subject<string>();

  private currentUrlSegmentString: string = window.location.pathname;

  constructor() {}

  get currentUrl() { return this.currentUrlSegmentString; }
  get routeData() { return currentRoute.routeData; }
  get routeChildData() { return currentRoute.routeChildData; }

  setRoute(route: ActivatedRoute) {
    this.route = route;
  }

  setRouter(router: Router) {
    this.router = router;
    this.router.events.subscribe(e => {
      // console.log(e);
      // Full list: https://angular.io/api/router/Event
      if (e instanceof NavigationStart) {
        this.eventNavigationStart.next(e);
      } else if (e instanceof ActivationStart) {
        this.eventActivationStart.next(e);
      } else if (e instanceof RouteConfigLoadEnd) {
        this.eventConfigLoadEnd.next(e);
      } else if (e instanceof NavigationEnd) {
        this.setUrlSegment(e.url);
        this.eventNavigationdEnd.next(e);
        setTimeout(() => {
          window.dispatchEvent(new Event('resize'));
        }, 0);
        window.dispatchEvent(new Event('resize'));
      } else { }
    });
  }

  setUrlSegment(url: string) {
    this.currentUrlSegmentString = url;
    this.eventRouteChange.next(url);
  }

}
