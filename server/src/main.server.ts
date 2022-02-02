/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as fs from 'fs';
import * as axios from 'axios';
import { GanymedeHttpServer, HTTP, HttpBaseLib, HttpMethod, HttpOp, ReqProcessor } from './http.shim';
import { secretsConfig } from './config.importer';

const scopeName = `main;pid=${process.pid}`;
const mainServerConfig = secretsConfig?.mainServer;
const authData = mainServerConfig?.auth;

export class AuthServer extends GanymedeHttpServer {

  constructor() {
    super({
      type: HttpBaseLib.EXPRESS,
      scopeName,
      security: {
        accessor: { required: true, baseToken: authData.tokenRoot },
        secureChannel: { enabled: true, required: true, signingKey: authData.key },
      },
      startOptions: { port: 7010 },
    });
    this.apiVersion = 'v1';
    this.apiPath = this.configGlobal.api.basePath;
    this.addDefaultProcessor(ReqProcessor.BASIC);
  }

  @HTTP.GET(`/proxy-request`)
  async proxyRequest(op: HttpOp) {
    const paramsCopy = JSON.parse(JSON.stringify(op.req.params));
    const url = paramsCopy.__url;
    const method: HttpMethod = paramsCopy.__method ? paramsCopy.__method : HttpMethod.GET;
    const timeout = paramsCopy.__timeout ? paramsCopy.__timeout : 7000;
    const headers = paramsCopy.__headers ? paramsCopy.__headers : '';
    if (paramsCopy.__url) { delete paramsCopy.__url; }
    if (paramsCopy.__method) { delete paramsCopy.__method; }
    if (paramsCopy.__headers) { delete paramsCopy.__headers; }
    if (paramsCopy.__timeout) { delete paramsCopy.__timeout; }
    if (paramsCopy.__enc) { delete paramsCopy.__enc; }
    const newHeaders: {[headerName: string]: string} = {};
    for (const headerName of headers.split(',')) {
      const headerValue = op.req.getHeader(headerName);
      if (headerValue) { newHeaders[headerName] = headerValue; }
    }
    const reqOpts = { timeout, headers: newHeaders, params: paramsCopy, };
    let proxyRequestFunction: <T = any, R = axios.AxiosResponse<T>>(url: string, config?: axios.AxiosRequestConfig) => Promise<R>;
    switch (method) {
      case 'GET': { proxyRequestFunction = axios.default.get; break; }
      case 'PUT': { proxyRequestFunction = axios.default.put; break; }
      case 'POST': { proxyRequestFunction = axios.default.post; break; }
      case 'PATCH': { proxyRequestFunction = axios.default.patch; break; }
      case 'DELETE': { proxyRequestFunction = axios.default.delete; break; }
    }
    op.waitFor(resolve => {
      proxyRequestFunction.apply(axios.default, [url, reqOpts]).then(res => {
        if (typeof res.data === 'string') {
          op.res.returnJson({ message: res.data });
        } else {
          op.res.returnJson(res.data);
        }
        resolve();
      }).catch(e => {
        const res = e.response;
        if (res) {
          op.res.returnNotOk(res.status, `Proxy request failed: ${res.data}`);
        } else {
          op.res.returnNotOk(500, `Proxy request failed: ${e.message}`);
        }
        resolve();
      });
    });
  }

}
