/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { PreInitUtils } from './preinit.util';
import { ganymedeAppData as appData } from '../../../../../../ganymede.app';

export class GeolocateUtils {

  static localeData = {
    ip: '0.0.0.0',
    city: 'Unknown',
    country: 'XX',
    hostname: 'unknown',
    loc: null,
    org: 'Unknown',
    postal: '00000',
    region: 'Unknown',
    resolved: false,
    cachedTime: 0,
  };

  static async initialize() {
    return new Promise(resolve => {
      if (!appData.conf.modules.geolocate) { return resolve(GeolocateUtils.localeData); }

      if (!localStorage) { return resolve(GeolocateUtils.localeData); }

      const lastIp = PreInitUtils.preinitData.lastIp;
      if (!lastIp) { return resolve(GeolocateUtils.localeData); }

      let a: any = localStorage.getItem('gany_geolocate/' + lastIp);
      if (a) {
        a = JSON.parse(a);
        GeolocateUtils.localeData = a;
      }

      if (navigator.onLine && !a || Date.now() - a.cachedTime > 2592000000) {
        const geo = appData.conf.modules.geolocate;
        const geolocateUrl = getGeolocateServerUrl(geo);
        const req = new XMLHttpRequest();
        req.open('GET', geolocateUrl);
        req.onreadystatechange = (e) => {
          if (req.readyState !== 4) { return; }
          if (req.status !== 200) { return resolve(GeolocateUtils.localeData); }
          a = JSON.parse(req.responseText);
          a.cachedTime = Date.now();
          a.resolved = true;
          localStorage.setItem('gany_geolocate/' + a.ip, JSON.stringify(a));
          if (lastIp !== a.ip) { localStorage.setItem('gany_geolocate/' + lastIp, JSON.stringify(a)); }
          GeolocateUtils.localeData = a;
          return resolve(GeolocateUtils.localeData);
        };
        req.send();
      }
    });
  }
}

function getGeolocateServerUrl(geo) {
  if (!geo.tokenParam) { geo.tokenParam = { name: 'token', type: 'query' }; }
  if (geo.tokenParam.type === 'query') {
    return `${geo.server}?${geo.tokenParam.name}=${geo.token}`;
  }
}
