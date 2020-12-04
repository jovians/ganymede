import { Subject } from 'rxjs';

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
}

export class GanymedeAppData {
  name: string = 'Ganymede App';
  fullname = `Sample Ganymede App`;
  toptitle = ``;
  subtitle = ``;

  logo = `${baseIcoPath}/apple-icon.png`;
  logoTitle = `${baseImgPath}/.png`;
  // logoTitleVertical = `${baseImgPath}/.png`;

  icon = `${baseIcoPath}/apple-icon.png`;

  loginImage = `${baseImgPath}/s.jpg`;

  landingVideo = `${baseVidPath}/devops_landing.mp4`;

  template;

  routes;

  lang = 'en';
  langList = ['en'];

  defaultUserContentsPath = '/assets/user-contents';

  routeData = new Subject<any>();

  features: GanymedeAppFeatures = {
    preinit: {}
  };

  constructor(initializer?: Partial<GanymedeAppData>) {
    if (initializer) {
      Object.assign(this, initializer);
    }
  }
}

export function getGanymedeAppData(): GanymedeAppData {
  if (!isNodeJs) {
    return self.ganymedeAppData as GanymedeAppData;
  }
}
