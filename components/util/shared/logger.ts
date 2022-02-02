/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { GanymedeLoggerSettings } from '../../../defaults/ganymede.app.interface';
// import { ganymedeAppData } from '../../../defaults/ganymede.app.interface';

export class GanymedeLogger {
  info(...args) {
    // tslint:disable-next-line: no-console
    console.log(...args);
  }
  debug(...args) {
    // tslint:disable-next-line: no-console
    console.debug(...args);
  }
  error(...args) {
    // tslint:disable-next-line: no-console
    console.error(...args);
  }
  loadSettings(settings: GanymedeLoggerSettings) {

  }
}

export const log = new GanymedeLogger();
// ganymedeAppData.logger = log;

