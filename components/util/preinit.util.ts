/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { ganymedeAppData } from '../../../../../ganymede.app';

export class PreInitUtils {
  static preinitData: any = {};
  static preinitDataPrevious: any = {};
  static resolvedState: 'noinit' | 'resolved' | 'offline' | 'error' = 'noinit';
  static error: Error;
  static clientInfo: any = {};
  static initialized = false;
  static initializing = false;
  static initPromise: Promise<void>;
  static entrypoint(): Promise<void> {
    let cachedPreinitInfo = localStorage.getItem('gany_preinit_data') as any;
    cachedPreinitInfo = cachedPreinitInfo ? JSON.parse(cachedPreinitInfo) : {};
    if (PreInitUtils.initialized) { return new Promise<void>(resolve => { resolve(); }); }
    if (PreInitUtils.initializing) { return PreInitUtils.initPromise; }
    PreInitUtils.preinitDataPrevious = cachedPreinitInfo;
    PreInitUtils.initializing = true;
    const promise = new Promise<void>(resolve => {
      const appData = ganymedeAppData;
      if (!appData.features.preinit) { return resolve(); }
      if (appData.features.preinit as any === true || appData.features.preinit as any === 1) {
        appData.features.preinit = {};
      }
      appData.features.preinit.versionInfo = {};
      if (navigator.onLine) {
        const req = new XMLHttpRequest();
        req.open('GET', `/api/ganymede/preinit?t=${Date.now()}`, true);
        req.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
        req.setRequestHeader('cache-control', 'max-age=0');
        req.setRequestHeader('pragma', 'no-cache');
        req.onreadystatechange = () => {
          if (req.readyState !== 4) { return; }
          if (req.status !== 200) {
            PreInitUtils.error = new Error('');
            PreInitUtils.resolvedState = 'error';
            return resolve();
          }
          const headers = req.getAllResponseHeaders().toLowerCase().split('\n');
          try {
            appData.features.preinit.versionInfo = JSON.parse(req.responseText);
          } catch (e) {
            // console.log(req.responseText);
            PreInitUtils.resolvedState = 'error';
            return resolve();
          }
          for (const header of headers) {
            const colonPosition = header.indexOf(':');
            const headerName = header.substring(0, colonPosition).trim();
            const headerValue = header.substring(colonPosition + 1).trim();
            PreInitUtils.clientInfo[headerName] = headerValue;
            if (headerName === 'last-modified') {
              const accessIp = (headerValue.split(',').length === 2) ? headerValue.split(',')[1].trim() : '0.0.0.0';
              PreInitUtils.clientInfo['x-client-ip'] = accessIp;
              appData.features.preinit.versionInfo.accessIp = accessIp;
            }
          }
          if (localStorage) {
            const preinitDataNew = JSON.parse(JSON.stringify(PreInitUtils.preinitDataPrevious));
            preinitDataNew.versionInfo = appData.features.preinit.versionInfo;
            preinitDataNew.lastIp = appData.features.preinit.versionInfo.accessIp;
            localStorage.setItem('gany_preinit_data', JSON.stringify(preinitDataNew));
            PreInitUtils.preinitData = preinitDataNew;
          }
          resolve();
          PreInitUtils.resolvedState = 'resolved';
        };
        req.send();
      } else {
        if (PreInitUtils.preinitDataPrevious.versionInfo) {
          Object.assign(appData.features.preinit.versionInfo,
                          PreInitUtils.preinitDataPrevious
                            ? JSON.parse(PreInitUtils.preinitDataPrevious.versionInfo) : {});
        }
        if (PreInitUtils.preinitDataPrevious.lastIp) {
          appData.features.preinit.lastIp = PreInitUtils.preinitDataPrevious.lastIp;
        }
        PreInitUtils.resolvedState = 'offline';
        resolve();
      }
    });
    PreInitUtils.initPromise = promise;
    promise.then(() => {
      PreInitUtils.initialized = true;
      PreInitUtils.initializing = false;
    });
    return promise;
  }
}
