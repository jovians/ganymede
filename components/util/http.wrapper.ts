/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { HttpErrorResponse, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { GanymedeAppData } from '../ganymede.app.interface';
import { makeid } from './crypto/makeid';

let appData: GanymedeAppData;

export interface HttpWrapperData<T> {
  interceptId?: string;
  condition: string | RegExp | ((path: string) => boolean);
  requestIntercept: (req: HttpRequest<T>, util?: typeof HttpWrap)
    => (Promise<HttpRequest<T> | void> | void);
  responseIntercept: (res: HttpResponse<T>, util?: typeof HttpWrap)
    => (Promise<HttpResponse<T> | void> | void);
  timeout?: number;
}

export class HttpWrap {
  static initialOverrideLoaded = false;
  static currentIntercepts: { [id: string]: HttpWrapperData<any> } = {};
  static overrideByExactMatch: { [path: string]: HttpWrapperData<any> } = {};
  static overrideList: HttpWrapperData<any>[] = [];
  static overrideCount = 0;

  static add<T = any>(
    condition: string | RegExp | ((path: string) => boolean),
    requestIntercept?: (req: HttpRequest<T>, util?: typeof HttpWrap)
      => (Promise<HttpRequest<T> | void> | void),
    responseIntercept?: (res: HttpResponse<T>, util?: typeof HttpWrap)
      => (Promise<HttpResponse<T> | void> | void),
  ) {
    const reg = { condition, requestIntercept, responseIntercept };
    if (typeof condition === 'string') {
      HttpWrap.overrideByExactMatch[condition] = reg;
      ++HttpWrap.overrideCount;
    } else {
      HttpWrap.overrideList.push(reg);
      ++HttpWrap.overrideCount;
    }
  }

  static release<T = any>(interceptor: HttpWrapperData<T>) {
    if (HttpWrap.currentIntercepts[interceptor.interceptId]) {
      delete HttpWrap.currentIntercepts[interceptor.interceptId];
    }
  }

  static match<T = any>(req: HttpRequest<any>): HttpWrapperData<T> {
    if (!appData || HttpWrap.overrideCount === 0) {
      return null;
    }
    const path = req.url.startsWith('/') ? req.url.substr(1) : req.url;
    if (appData.requestIntercept.type === 'simple') {
      let matched: HttpWrapperData<T>;
      if (HttpWrap.overrideByExactMatch[path]) {
        matched = HttpWrap.overrideByExactMatch[path];
      } else {
        for (const intc of HttpWrap.overrideList) {
          if (typeof intc.condition === 'string') {
            // string
          } else if (intc.condition instanceof RegExp) {
            if (intc.condition.test(path)) { matched = intc; break; }
          } else {
            if (intc.condition(path)) { matched = intc; break; }
          }
        }
      }
      if (matched) {
        const interceptId = makeid(32);
        const interceptor = HttpWrap.currentIntercepts[interceptId] = {
          interceptId,
          condition: matched.condition,
          requestIntercept: matched.requestIntercept,
          responseIntercept: matched.responseIntercept,
        };
        return interceptor;
      }
    } else {
      // TODO
    }
    return null;
  }
  static loadInitialIntercepts(extraInit?: (http: typeof HttpWrap) => void) {
    if (HttpWrap.initialOverrideLoaded) { return; }
    HttpWrap.initialOverrideLoaded = true;
    appData = (window as any).ganymedeAppData;
    if (appData.requestIntercept.initialize) { appData.requestIntercept.initialize(); }
    if (extraInit) { extraInit(HttpWrap); }
  }
  static headersOverride(headers: HttpHeaders, newHeaders: {[headerName: string]: string}) {
    const headersData = {};
    for (const headerName of headers.keys()) {
      if (newHeaders[headerName]) {
        headersData[headerName] = newHeaders[headerName];
      } else {
        headersData[headerName] = headers.get(headerName);
      }
    }
    return new HttpHeaders(headersData);
  }

  static jsonContent(res: HttpResponse<any>, statusCode: number, content: any) {
    const contentJson = JSON.stringify(content);
    return new HttpResponse<any>({
      url: res.url,
      headers: HttpWrap.headersOverride(res.headers, {
        'content-type': 'application/json; charset=utf-8',
        'content-length': contentJson.length.toString()
      }),
      status: statusCode,
      body: content,
    });
  }
  static textContent(res: HttpResponse<any>, statusCode: number, text: string) {
    return new HttpResponse<any>({
      url: res.url,
      headers: HttpWrap.headersOverride(res.headers, {
        'content-type': 'text/plain; charset=utf-8',
        'content-length': text.length.toString()
      }),
      status: statusCode,
      body: text,
    });
  }
  static htmlContent(res: HttpResponse<any>, statusCode: number, html: string) {
    return new HttpResponse<any>({
      url: res.url,
      headers: HttpWrap.headersOverride(res.headers, {
        'content-type': 'text/html; charset=utf-8',
        'content-length': html.length.toString()
      }),
      status: statusCode,
      body: html,
    });
  }
}
