import { BehaviorSubject, Subject } from 'rxjs';

const baseImgPath = '/assets/img';
const baseIcoPath = '/assets/ico';
const baseVidPath = '/assets/vid';

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

  defaultMarkdownAssetPath = '/assets/md';

  routeData = new Subject<any>();

  constructor(initializer?: Partial<GanymedeAppData>) {
    if (initializer) {
      Object.assign(this, initializer);
    }
  }
}
