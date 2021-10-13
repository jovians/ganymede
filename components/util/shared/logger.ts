/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { GanymedeLoggerSettings } from '../../ganymede.app.interface';
import { ganymedeAppData } from '../../../../../../ganymede.app';

export class GanymedeLogger {
  constructor(settings: GanymedeLoggerSettings) {

  }
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
}

export const log = new GanymedeLogger(ganymedeAppData.loggerSettings);
ganymedeAppData.logger = log;

