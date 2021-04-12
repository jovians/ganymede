/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as express from 'express';
import { ServerConst } from './const';

export enum HttpMethod {
  NONE, GET, POST, PUT, PATCH, DELETE, OPTIONS
}

export enum Pre {
  AUTH = 'AUTH',
  BASIC = 'BASIC',
}

export enum Post {
  BASIC = 'BASIC',
}

export enum HttpResponseText {
  UNAUTHORIZED = 'UNAUTHORIZED',
}

export interface ServerStartOptions {
  port: number
}

export class GanymedeHttpServerApi {
  path = '';
  method = HttpMethod.GET;
  pre?: string[];
  handler: (q: GanymedeHttpRequest, r: GanymedeHttpResponse, a?: GanymedeHttpWrappedArgs) => any;
  post?: string[];
}

export interface GanymedeHttpWrappedArgs {
  api: GanymedeHttpServerApi;
  q: GanymedeHttpRequest;
  r: GanymedeHttpResponse;
  req: any;
  res: any;
}

export class GanymedeHttpServer {
  type: string;
  baseApp: any;
  globalConf: typeof ServerConst.data.global;
  preHandler: GanymedePreHandler;
  postHandler: GanymedePostHandler;
  constructor(type: string, globalConf: typeof ServerConst.data.global) {
    if (!type) { type = 'express'; }
    this.type = type;
    this.globalConf = globalConf;
    this.preHandler = new GanymedePreHandler();
    this.postHandler = new GanymedePostHandler();
    this.setBaseLayer();
  }

  setBaseLayer() {
    switch (this.type) {
      case 'express':
        this.baseApp = express();
        const secOptions = this.globalConf.http.securityHeaders;
        if (secOptions.profile === 'allow-all') {
          this.baseApp.use((req, res, next) => {
            if (req.method === 'OPTIONS') {
              if (secOptions.allowRequestOrigin) {
                res.header('Access-Control-Allow-Origin', secOptions.allowRequestOrigin);
              }
              if (secOptions.allowRequestHeaders) {
                res.header('Access-Control-Allow-Headers', secOptions.allowRequestOrigin);
              }
              res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
              return res.end();
            }
            next();
          });
        }
        break;
    }
  }

  setFinalLayer() {
    switch (this.type) {
      case 'express':
        // TODO
        break;
    }
  }

  register(api: GanymedeHttpServerApi) {
    switch (this.type) {
      case 'express':
        switch (api.method) {
          case HttpMethod.GET:
            this.baseApp.get(api.path, async (req, res) => {
              const { q, r } =  this.newQR(req, res);
              const a: GanymedeHttpWrappedArgs = { api, q, r, req, res };
              await this.handlePre(a);
              await api.handler(q, r, a);
              await this.handlePost(a);
            });
            break;
          case HttpMethod.POST:
            this.baseApp.post(api.path, async (req, res) => {
              const { q, r } =  this.newQR(req, res);
              const a: GanymedeHttpWrappedArgs = { api, q, r, req, res };
              await this.handlePre(a);
              await api.handler(q, r, a);
              await this.handlePost(a);
            })
            break;
        }
        break;
    }
  }

  start(options: ServerStartOptions) {
    switch (this.type) {
      case 'express':
        this.baseApp.listen(options.port);
        break;
    }
    return true;
  }

  private newQR(req, res) {
    return { q: new GanymedeHttpRequest(req, res), r: new GanymedeHttpResponse(req, res) };
  }

  private async handlePre(a: GanymedeHttpWrappedArgs) {
    if (a.api.pre) {
      for (const preType of a.api.pre) {
        const preFunc = this.preHandler.byType[preType];
        if (!preFunc) { continue; }
        const passed = await preFunc(a);
        if (!passed) { break; }
      }
    }
  }

  private async handlePost(a: GanymedeHttpWrappedArgs) {
    if (a.api.post) {
      for (const postType of a.api.post) {
        const postFunc = this.postHandler.byType[postType];
        if (!postFunc) { continue; }
        const passed = await postFunc(a);
        if (!passed) { break; }
      }
    }
  }
}

export class GanymedeHttpRequest {
  oriReq: any;
  oriRes: any;
  data: any;
  body: string = null;
  bodyRaw: Buffer = null;
  headers: {[headerName: string]: string};
  params: {[paramName: string]: string};
  constructor(oriReq, oriRes) {
    this.oriReq = oriReq;
    this.oriRes = oriRes;
  }
}

export class GanymedeHttpResponse {
  oriReq: any;
  oriRes: any;
  headers: {[headerName: string]: string};
  constructor(oriReq, oriRes) {
    this.oriReq = oriReq;
    this.oriRes = oriRes;
  }
  send(payload: string) {
    return this.oriRes.send(payload);
  }
  end(payload: string) {
    return this.oriRes.send(payload);
  }
  status(num: number) {
    return this.oriRes.status(num);
  }
  okJson(obj: any) {
    return this.oriRes.end(JSON.stringify({ status: 'ok', data: obj }));
  }
}

export class GanymedePreHandler {
  byType: {[preType: string]: (a: GanymedeHttpWrappedArgs) => Promise<boolean> } = {};
  constructor() {
    this.byType = {
      [Pre.BASIC]: this.basic,
    };
  }
  async auth(a: GanymedeHttpWrappedArgs) {
    return new Promise<boolean>(resolve => {
      const authData = a.req.headers['Authorization'];
      if (!authData) {
        if (authData.startsWith('Bearer ')) { // bearer token scheme

        } else if (authData.startsWith('Signed ')) { // signature scheme

        }
      } else {
        a.res.status(401).end(HttpResponseText.UNAUTHORIZED);
        resolve(false);
      }
    });
  }
  async basic(a: GanymedeHttpWrappedArgs) {
    return new Promise<boolean>(resolve => {
      let errored = false;
      const chunks: Buffer[] = [];
      a.req.on('data', chunk => {
        chunks.push(chunk);
      });
      a.req.on('end', () => {
        a.q.params = a.req.params;
        a.q.bodyRaw = Buffer.concat(chunks);
        a.q.body = a.q.bodyRaw.toString();
        if ((a.q.body.startsWith('{') && a.q.body.endsWith('}')) || (a.q.body.startsWith('[') && a.q.body.endsWith(']'))) {
          try {
            a.q.data = JSON.parse(a.q.body);
          } catch (e) {}
        }
        resolve(true);
      });
      a.req.on('error', _ => { errored = true; resolve(false); });
    });
  }
}

export class GanymedePostHandler {
  byType: {[postType: string]: (a: GanymedeHttpWrappedArgs) => Promise<boolean> } = {};
  constructor() {
    this.byType = {
      // [Post.BASIC]: this.basic,
    };
  }
  async basic(a: GanymedeHttpWrappedArgs) {
    
  }
}
