/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ganylog } from './console.util';
import { PreInitUtils } from './preinit.util';
import { getGanymedeAppData } from '../ganymede.app.interface';

export class ServiceWorkerUtil {

  static announceSent = false;
  static async initialize() {

    if (!('serviceWorker' in navigator)) { return; }

    const app = getGanymedeAppData();
    const serviceWorkers = await ServiceWorkerUtil.getServiceWorkersList();

    if (app.features.serviceWorker && app.features.serviceWorker.enabled) {

      if (serviceWorkers.length > 0) {
        ServiceWorkerUtil.sendAnnounce();
      }

      navigator.serviceWorker.onmessage = e => {
        // console.log(e);
      };
      if (!PreInitUtils.preinitDataPrevious.versionInfo || serviceWorkers.length === 0 ||
          (PreInitUtils.preinitDataPrevious &&
            PreInitUtils.preinitDataPrevious.versionInfo.sw !== PreInitUtils.preinitData.versionInfo.sw)) {
        if (!navigator.onLine) {
          ganylog('SW', 'Cannot Register New Service Worker: Network Not Live');
          return;
        }
        ganylog('SW', 'service worker version changed detected; registering new service worker...');
        const v = PreInitUtils.preinitData.versionInfo ? PreInitUtils.preinitData.versionInfo.sw : 0;
        const regOptions: any = { enabled: true, registrationStrategy: 'registerImmediately' };
        navigator.serviceWorker.register('/sw.js?v=' + v, regOptions)
          .then(reg => {
            ganylog('SW', 'registration succeeded, scope=' + reg.scope);
            if (!ServiceWorkerUtil.announceSent) { ServiceWorkerUtil.sendAnnounce(); }
          })
          .catch(registrationError => {
            ganylog('SW', 'registration failed');
            // tslint:disable-next-line: no-console
            console.log(registrationError);
          });
      }

    } else {
      for (const reg of serviceWorkers) { reg.unregister(); }
    }
  }

  static async getServiceWorkersList() {
    return new Promise<ServiceWorkerRegistration[]>(resolve => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          resolve(registrations as any);
        }).catch(e => {
          resolve([]);
        });
      } else {
        resolve([]);
      }
    });
  }

  static async sendAnnounce() {
    return new Promise<boolean>(resolve => {
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        try {
          const hostnameOnly = location.hostname.split(':')[0];
          navigator.serviceWorker.controller.postMessage({
            action: 'set',
            hostname: hostnameOnly,
            domains: [hostnameOnly],
            versionInfo: PreInitUtils.preinitDataPrevious.versionInfo
          });
          ServiceWorkerUtil.announceSent = true;
        } catch (e) {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    });
  }

}
