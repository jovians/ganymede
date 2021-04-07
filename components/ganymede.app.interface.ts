import { Subject } from 'rxjs';
import { debugController } from './util/debug.controller';
import { HttpErrorResponse, HttpRequest, HttpResponse } from '@angular/common/http';

const baseImgPath = '/assets/img';
const baseIcoPath = '/assets/ico';
const baseVidPath = '/assets/vid';

const self = new Function('return this')();
const isNodeJs = self.btoa === undefined;

export interface GanymedeAppFeatures {
  preinit?: {
    lastIp?: string;
    versionInfo?: {
      accessIp?: string;
    }
  };
  licenseFooter?: {
    messageHTML?: string;
  };
  serviceWorker?: {
    enabled?: boolean;
  };
  geolocate?: {
    enabled?: boolean;
  };
}

export class GanymedeAppData {
  name: string = 'Ganymede App';
  fullname = `Sample Ganymede App`;
  toptitle = ``;
  subtitle = ``;

  logo = `${baseIcoPath}/apple-icon.png`;
  // logoTitle = `${baseImgPath}/.png`;
  // logoTitleVertical = `${baseImgPath}/.png`;

  icon = `${baseIcoPath}/apple-icon.png`;

  loginImage = `${baseImgPath}/s.jpg`;

  landingPath = `/`;
  landingVideo = ``;

  template;

  routes;

  lang = 'en';
  langList = ['en'];

  defaultUserContentsPath = '/assets/user-contents';

  routeData = new Subject<any>();

  features: GanymedeAppFeatures = {
    preinit: {},
    licenseFooter: { messageHTML: 'Powered by Ganymede' },
    // serviceWorker: { enabled: true },
  };

  header = {
    alwaysOn: true, exceptRoutes: [],
    search: { enabled: false }
  };
  headerActions = [];

  footer = { alwaysOn: false, exceptRoutes: [] };
  footerActions = { left: [], middle: [], right: [] };

  requestIntercept: {
    type: string;
    initialize?: () => {};
  } = { type: 'simple' };

  debug = debugController;

  conf: any; // ganymede.conf.json content

  constructor(initializer?: Partial<GanymedeAppData>) {
    if (initializer) {
      const defaultFeatures = this.features;
      Object.assign(this, initializer);
      for (const featureName of Object.keys(defaultFeatures)) {
        if (!this.features[featureName]) {
          this.features[featureName] = defaultFeatures[featureName];
        }
      }
    }
  }
}

export function getGanymedeAppData(): GanymedeAppData {
  if (!isNodeJs) {
    return self.ganymedeAppData as GanymedeAppData;
  }
}
