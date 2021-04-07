/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export const globalLogFormatter = {
  format(message: string, data?: any) {
    return ``;
  }
};

export class GanymedeServerLogger {
  static defaultInterceptor: (message: string, data?: any) => boolean = null;
}
