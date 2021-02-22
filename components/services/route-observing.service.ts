/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RouteObservingService {

  private currentUrlSegmentString: string;
  private routeChangeSubject: Subject<string> = new Subject<string>();

  constructor() { }

  get currentUrl() { return this.currentUrlSegmentString; }
  get routeChange() { return this.routeChangeSubject; }

  push(url: string) {
    this.routeChangeSubject.next(url);
  }

  setUrlSegment(url: string) {
    this.currentUrlSegmentString = url;
    this.routeChangeSubject.next(url);
  }

  subscribe(observer: (url: string) => void): Subscription {
    return this.routeChangeSubject.subscribe(observer);
  }

}
