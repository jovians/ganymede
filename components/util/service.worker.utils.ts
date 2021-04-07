/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ganylog } from './console.util';
import { PreInitUtils } from './preinit.util';
import { getGanymedeAppData } from '../ganymede.app.interface';

export class ServiceWorkerUtil {

  static initialized = false;
  static announceSent = false;
  static async initialize() {
    if (ServiceWorkerUtil.initialized) { return; }
    ServiceWorkerUtil.initialized = true;

    if (!('serviceWorker' in navigator)) { return; }

    const app = getGanymedeAppData();
    const serviceWorkers = await ServiceWorkerUtil.getServiceWorkersList();

    if (!app.features.serviceWorker || !app.features.serviceWorker.enabled) {
      for (const reg of serviceWorkers) { reg.unregister(); }
      return;
    }

    navigator.serviceWorker.onmessage = e => { ServiceWorkerUtil.handleMessages(e); };
    if (serviceWorkers.length > 0) { ServiceWorkerUtil.sendAnnounce(); }

    if (serviceWorkers.length === 0 ||
        (PreInitUtils.preinitDataPrevious && PreInitUtils.preinitData.versionInfo &&
          PreInitUtils.preinitDataPrevious.versionInfo.sw !== PreInitUtils.preinitData.versionInfo.sw)) {
      if (!navigator.onLine) {
        ganylog('SW', 'Cannot Register New Service Worker: Network Not Live');
        return;
      }
      ganylog('SW', `service worker version changed detected ; registering new service worker...`);
      const v = PreInitUtils.preinitData.versionInfo ? PreInitUtils.preinitData.versionInfo.sw : 0;
      const regOptions: any = {
        enabled: true,
        scope: '.',
        registrationStrategy: 'registerImmediately'
      };
      navigator.serviceWorker.register('/sw.js?v=' + v, regOptions)
        .then(reg => {
          ganylog('SW', 'registration succeeded, scope=' + reg.scope);
          setTimeout(() => { if (!ServiceWorkerUtil.announceSent) { ServiceWorkerUtil.sendAnnounce(); } }, 100);
        })
        .catch(registrationError => {
          ganylog('SW', 'registration failed');
          // tslint:disable-next-line: no-console
          console.log(registrationError);
        });
    }
  }

  static handleMessages(e) {
    if (!e.data || !e.data.type) {
      return;
    }
    switch (e.data.type) {
      case 'NEW_CLIENT':
        ganylog('SW', 'service worker connected.');
        break;
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
