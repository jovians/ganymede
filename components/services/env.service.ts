/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable, isDevMode } from '@angular/core';
import { ElectronInteractions } from '../util/common/electron.utils';

@Injectable({
  providedIn: 'root'
})
export class EnvService {

  // OS & Device Detect
  os: string;
  isMac: boolean;
  isWindows: boolean;
  isLinux: boolean;
  isAndroid: boolean;
  isIX: boolean;
  isIXWebApp: boolean;
  isIPhone: boolean;
  isIPad: boolean;
  isMobile: boolean;

  // Browser Detect
  browser: string;
  isFirefox: boolean;
  isSafari: boolean;
  isBadSafari: boolean;
  isWeirdSafari: boolean;
  isChrome: boolean;
  isEdge: boolean;
  isIE: boolean;
  isElectron: boolean;

  electron: ElectronInteractions;

  licenseValid = true;

  devMode: boolean = true;

  constructor() {
    this.devMode = isDevMode();
    const env = this as any;
    const envPrepare = () => {
      const nv = navigator;
      const ua = nv.userAgent;
      const ual = ua.toLowerCase();
      const nptu = nv.platform.toUpperCase();
      const hn = location.hostname;
      const uas = ua.split(' ');
      const uae = uas[uas.length - 1];
      function mobileCheck() {
        let check = false;
        // tslint:disable-next-line: max-line-length
        ((a) => { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) { check = true; } }) (
          // tslint:disable-next-line: no-string-literal
          ua || nv.vendor || window['opera']
        );
        return check;
      }
      function getBrowser() {
        let tem;
        let M = ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(M[1])) {
          tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
          return {name: 'IE', version: (tem[1] || '')};
        }
        if (M[1] === 'Chrome') {
          tem = ua.match(/\b(OPR|Edge)\/(\d+)/);
          if (tem !== null) { return {name: tem[1].replace('OPR', 'Opera'), version: tem[2]}; }
        }
        M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, '-?'];
        tem = ua.match(/version\/(\d+)/i);
        if (tem !== null) { M.splice(1, 1, tem[1]); }
        return { name: M[0], version: M[1] };
      }

      // OS Detect
      const browserInfo = getBrowser();
      browserInfo.version = parseInt(browserInfo.version, 10);
      env.isMac = nptu.indexOf('MAC') !== -1; if (env.isMac) { env.os = 'mac'; }
      env.isWindows = nptu.indexOf('WIN') !== -1; if (env.isWindows) { env.os = 'win'; }
      env.isLinux = nptu.indexOf('LINUX') !== -1; if (env.isLinux) { env.os = 'linux'; }
      env.isAndroid = nptu.indexOf('ANDROID') !== -1; if (env.isAndroid) { env.os = 'andro'; }
      env.isIX = (ua.match(/(iPad|iPhone|iPod)/g) ? true : false ); if (env.isIX) { env.os = 'ios'; }
      env.isIXWebApp = false; // (_nptu.standalone == true);
      env.isIPhone = (ua.match(/(iPhone|iPod)/g) ? true : false );
      env.isIPad = (ua.match(/(iPad)/g) ? true : false );
      env.isMobile = mobileCheck();
      if (!env.os) { env.os = 'other'; }

      // Browser Detect
      env.isFirefox = uae.indexOf('Firefox/') >= 0;  if (env.isFirefox) { env.browser = 'firefox'; }
      env.isSafari = (nv.vendor === 'Apple Computer, Inc.'); if (env.isSafari) { env.browser = 'safari'; }
      env.isBadSafari = (env.isIX && env.isSafari && browserInfo.version < 10);
      env.isWeirdSafari = (env.isBadSafari && !env.isIXWebApp);
      env.isChrome = ua.indexOf(' Chrome/') >= 0; if (env.isChrome) { env.browser = 'chrome'; }
      env.isEdge = ( ua.match(/(Edge)/g) ? true : false ); if (env.isEdge) { env.browser = 'edge'; }
      env.isIE = (ua.indexOf('MSIE ') > 0 || ua.indexOf('Trident/') > 0) && !env.isChrome && !env.isFirefox && !env.isSafari && !env.isEdge;
      env.isElectron = ua.indexOf('Electron/') >= 0; if (env.isElectron) { env.browser = 'electron'; }
      if (!env.browser) { env.browser = 'other'; }
    };
    envPrepare();

    if (this.isElectron) { this.electron = new ElectronInteractions(); }
  }
}
