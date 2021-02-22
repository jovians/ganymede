/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ServiceWorkerUtil } from '../util/service.worker.utils';

@Injectable({
  providedIn: 'root'
})
export class ApiCallerService {
  constructor(private http: HttpClient) {
    const uniqueSession = Math.random().toString(36).substring(2, 15)
                      + Math.random().toString(36).substring(2, 15);
    Object.defineProperty(window, 'uniqueSession', { get: () => uniqueSession });
    // if ('serviceWorker' in navigator) {
    //   window.addEventListener('load', () => {
    //     navigator.serviceWorker.register('sw.js').then((registration) => {
    //       console.log('Service worker registered with scope: ', registration.scope);
    //     }, (err) => {
    //       console.log('ServiceWorker registration failed: ', err);
    //     });
    //   });
    // }
    ServiceWorkerUtil.initialize();
  }
}
