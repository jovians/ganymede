import { Injectable } from '@angular/core';

const baseImgPath = '/assets/img';
const baseIcoPath = '/assets/ico';
const baseVidPath = '/assets/vid';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  name = `Ganymede App`;
  fullname = `Sample Ganymede App`;
  toptitle = ``;
  subtitle = ``;

  logo = `${baseIcoPath}/app-icon.png`;
  logoTitle = `${baseImgPath}/.png`;
  // logoTitleVertical = `${baseImgPath}/.png`;

  icon = `${baseIcoPath}/app-icon.png`;

  loginImage = `${baseImgPath}/s.jpg`;

  landingVideo = `${baseVidPath}/devops_landing.mp4`;

  constructor() {}
}
