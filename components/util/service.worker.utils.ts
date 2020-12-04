import { ganylog } from './console.util';
import { PreInitUtils } from './preinit.util';

export class ServiceWorkerUtil {

  static async initialize() {

    await PreInitUtils.entrypoint();

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        action: 'versions',
        versionInfo: PreInitUtils.preinitDataPrevious.versionInfo
      });
      const hostnameOnly = location.hostname.split(':')[0];
      navigator.serviceWorker.controller.postMessage({
        action: 'setAllowedDomains',
        hostname: hostnameOnly,
        domains: [hostnameOnly],
      });
    }

    if ('serviceWorker' in navigator) {
      if (!PreInitUtils.preinitDataPrevious.versionInfo ||
          (PreInitUtils.preinitDataPrevious &&
            PreInitUtils.preinitDataPrevious.versionInfo.sw !== PreInitUtils.preinitData.versionInfo.sw)) {
        if (!navigator.onLine) {
          ganylog('SW', 'Cannot Register New Service Worker: Network Not Live');
          return;
        }
        ganylog('SW', 'service worker version changed detected; registering new service worker...');
        // localStorage.setItem('swv',ver_info.sw);
        const v = PreInitUtils.preinitData.versionInfo ? PreInitUtils.preinitData.versionInfo.sw : 0;
        navigator.serviceWorker.register('/sw.js?v=' + v);
      }
      navigator.serviceWorker.onmessage = e => {
        console.log(e);
      };
    }
  }
}
