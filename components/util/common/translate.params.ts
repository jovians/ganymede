/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { TranslateService } from '@ngx-translate/core';

export function globallyExtendTranslateParam() {
  Object.defineProperty(Object.prototype, 'tparam', {
    // tslint:disable-next-line: object-literal-shorthand
    value: function(params) {
      if (!params) { return {}; }
      // tslint:disable-next-line: no-string-literal
      const translate = window['ngxTranslateService'] as TranslateService;
      if (typeof params === 'object') {
        for (const key of Object.keys(params)) {
          if (params[key] && typeof params[key] === 'string') {
            params[key] = translate.instant(params[key]);
          }
        }
        return params;
      } else if (typeof params === 'string') {
        params = params.replace(' ', ',').replace(';', ',');
        const paramsArray = params.split(',');
        const paramsObject: any = {};
        for (const paramExpression of paramsArray) {
          if (!paramExpression) { continue; }
          if (paramExpression.indexOf('=') === -1) {
            const value = this[paramExpression];
            if (value !== undefined) {
              if (typeof value === 'string') {
                paramsObject[paramExpression] = translate.instant(value);
              } else {
                paramsObject[paramExpression] = value;
              }
            }
          } else {
            const kv = paramExpression.split('=');
            const key = kv[0].trim();
            const thisKey = kv[1].trim();
            const value = this[thisKey];
            if (value !== undefined) {
              if (typeof value === 'string') {
                paramsObject[key] = translate.instant(value);
              } else {
                paramsObject[key] = value;
              }
            }
          }
        }
        return paramsObject;
      }
    }
  });
}
