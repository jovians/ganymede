import { Injectable } from '@angular/core';

const baseImgPath = '/assets/img';
const baseIcoPath = '/assets/ico';
const baseVidPath = '/assets/vid';
const config = require('../../../../../ganymede.conf.json');

@Injectable({
  providedIn: 'root'
})
export class AppService {

  name = `Ganymede App`;
  fullname = `Sample Ganymede App`;
  toptitle = ``;
  subtitle = ``;

  logo = `${baseIcoPath}/apple-icon.png`;
  logoTitle = `${baseImgPath}/.png`;
  // logoTitleVertical = `${baseImgPath}/.png`;

  icon = `${baseIcoPath}/apple-icon.png`;

  loginImage = `${baseImgPath}/s.jpg`;

  landingVideo = `${baseVidPath}/devops_landing.mp4`;

  constructor() {}
}
