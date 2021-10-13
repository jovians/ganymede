/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as express from 'express';
import { ServerConst, ServerConstDataGlobal } from './const';
import { saltedSha512, SecureChannel, SecureChannelPayload, SecureChannelPeer, SecureChannelTypes } from '../../components/util/shared/crypto/secure.channel';
import { Class } from '@jovian/type-tools';
import { SecureChannelWorkerClient } from './http.shim.worker.security';
import { AsyncWorkerClient } from '../../components/util/server/async.worker.proc';
import { nullProxyFunction } from '../../components/util/server/async.null.proxy';
import { completeConfig } from '../../components/util/shared/common';
import { HttpMethod, HttpCode, httpRest } from './http.models';
import * as defaultConfig from './http.shim.default.config.json';
import * as defaultGlobalConfig from './const.global.config.json';

export { HttpMethod, HttpCode };

export enum ReqProcessor {
  AUTH = 'AUTH',
  BASIC = 'BASIC',
  DECRYPT = `DECRYPT`,
  ENCRYPT = `ENCRYPT`,
}

export interface ServerStartOptions {
  port: number;
}

export class GanymedeHttpServerApi {
  server?: GanymedeHttpServer;
  path = '';
  apiPath?: string;
  apiVersion?: string;
  rootMount?: boolean;
  rootVersionMount?: boolean;
  public?: boolean;
  fullpath?: string = '';
  method = HttpMethod.GET;
  pre?: string[];
  handler?: (op: HttpOp) => any;
  handlerName?: string;
  post?: string[];
}

export enum HttpBaseLib {
  EXPRESS = 'EXPRESS',
}

export interface GanymedeHttpServerConfig {
  type: HttpBaseLib;
  scopeName?: string;
  debug?: {
    showErrorStack?: boolean;
  };
  cache?: {
    defaultCacheParser?: CacheParser;
  };
  security?: {
    noauth?: boolean;
    accessor?: {
      baseToken?: string;
      baseTokenBuffer?: Buffer;
      timeHashed?: boolean;
      timeWindow?: number;
      required?: boolean;
    };
    secureChannel?: {
      enabled?: boolean;
      strict?: boolean;
      required?: boolean;
      encryption?: SecureChannelTypes;
      publicKey?: string;
      signingKey?: string;
    };
  };
  workers?: {
    secureChannelWorkers?: {
      initialCount?: number;
    }
  };
  startOptions?: ServerStartOptions;
}

function methodsRegister(methods: HttpMethod[], path: string, apiOptions?: Partial<GanymedeHttpServerApi>) {
  path = path.replace(/\/\//g, '/');
  return (target: GanymedeHttpServer, propertyKey: string, descriptor: PropertyDescriptor) => {
    const logic = descriptor.value;
    const methodMap: {[method: string]: GanymedeHttpServerApi } = {};
    const handler = async (op: HttpOp) => {
      // console.log('pre test')
      const api = methodMap[op.method];
      if (!api) {
        return op.endWithError(HttpCode.NOT_FOUND, `METHOD_NOT_FOUND`, `Method ${op.method} not found for '${api.fullpath}'`);
      }
      const result = await Promise.resolve(logic.apply(api.server, [op]));
      // console.log('post test');
      return result;
    };
    for (const method of methods) {
      const methodApi: GanymedeHttpServerApi = { method, path, handlerName: propertyKey };
      if (apiOptions) { Object.assign(methodApi, apiOptions); }
      methodMap[method] = methodApi;
      methodApi.handler = handler;
      target.addRegistration(methodApi);
    }
    descriptor.value = handler;
  };
}

/**
 * HTTP api registration decorator
 */
export const HTTP = {
  GET: (path: string, apiOptions?: Partial<GanymedeHttpServerApi>) => {
    return methodsRegister([HttpMethod.GET], path, apiOptions);
  },
  POST: (path: string, apiOptions?: Partial<GanymedeHttpServerApi>) => {
    return methodsRegister([HttpMethod.POST], path, apiOptions);
  },
  PATCH: (path: string, apiOptions?: Partial<GanymedeHttpServerApi>) => {
    return methodsRegister([HttpMethod.PATCH], path, apiOptions);
  },
  DELETE: (path: string, apiOptions?: Partial<GanymedeHttpServerApi>) => {
    return methodsRegister([HttpMethod.DELETE], path, apiOptions);
  },
  METHODS: (methods: HttpMethod[], path: string, apiOptions?: Partial<GanymedeHttpServerApi>) => {
    return methodsRegister(methods, path, apiOptions);
  },
};

export class GanymedeHttpServer {
  config: GanymedeHttpServerConfig;
  configGlobal: ServerConstDataGlobal;
  publicInfo: any = {};
  publicInfoString: string = '';
  baseApp: any;
  apiPath: string = 'api';
  apiVersion: string = 'v1';
  apiRegistrations: GanymedeHttpServerApi[];
  apiMap: {[key: string]: any; } = {};
  apiPathList: string[] = [];
  pathTree: {[key: string]: any; } = {};
  preHandler: GanymedePreHandler;
  postHandler: GanymedePostHandler;
  defaultProcessors: ReqProcessor[] = [];
  secureChannels: {[channelId: string]: SecureChannel} = {};
  workerFleet: { [workerFleetClassName: string]: { workers: AsyncWorkerClient[]; } } = {};
  cacheData: {[key: string]: CacheEntry} = {};
  extData: any;
  state = {
    apiRegistered: false,
    apiRegisterStack: null,
  };

  constructor(config: GanymedeHttpServerConfig, globalConf?: ServerConstDataGlobal, beforeSuper?: () => any) {
    if (beforeSuper) { beforeSuper(); }
    this.configGlobal = completeConfig(globalConf ? globalConf : {}, defaultGlobalConfig);
    this.config = this.normalizeServerConfig(config);
    this.preHandler = new GanymedePreHandler();
    this.postHandler = new GanymedePostHandler();
    if (this.config.security.secureChannel.enabled && this.config.security.secureChannel.signingKey) {
      const channelKey = this.config.security.secureChannel.signingKey;
      if (!this.config.security.secureChannel.publicKey) {
        this.config.security.secureChannel.publicKey = SecureChannel.getPublicKeyFrom(channelKey);
      }
      for (let i = 0; i < this.config.workers.secureChannelWorkers.initialCount; ++i) {
        this.addWorker(SecureChannelWorkerClient, {
          workerId: i, scopeName: this.config.scopeName, signingKey: channelKey,
        });
      }
    }
    // this.pickWorker().import('./http.shim.worker.extension').then(async () => {});
    this.setBaseLayer();
    this.setSecureChannelHandler();
  }

  registerApis() {
    if (this.state.apiRegistered) {
      throw new Error(`Cannot register apis twice; already registered from ${this.state.apiRegisterStack}`);
    }
    this.state.apiRegistered = true;
    this.state.apiRegisterStack = new Error().stack;
    for (const api of this.apiRegistrations) {
      api.server = this;
      this.register(api);
    }
  }

  normalizeServerConfig(config: GanymedeHttpServerConfig) {
    if (!config.scopeName) { config.scopeName = `httpshim;pid=${process.pid}`; }
    config = completeConfig(config, defaultConfig);
    config.debug.showErrorStack = true;
    return config;
  }

  addDefaultProcessor(...processors: ReqProcessor[]) {
    if (this.state.apiRegistered) {
      throw new Error(`addDefaultProcessor must be called before api registration`);
    }
    for (const proc of processors) {
      this.defaultProcessors.push(proc);
    }
  }

  cacheDefine<T = any>(init?: Partial<CacheDef<T>>) {
    if (this.cacheData[init.path]) {
      throw new Error(`Cache path '${init.path}' is already defined.`);
    }
    const def = new CacheDef<T>(init);
    this.cacheData[def.path] = new CacheEntry<T>({
      value: null,
      hits: 0,
      version: 0,
      def,
    });
    return def;
  }

  addWorker<T extends AsyncWorkerClient>(workerClass: Class<T>, workerData: {[key: string]: any; }) {
    if (!this.workerFleet[workerClass.name]) {
      this.workerFleet[workerClass.name] = { workers: [] };
    }
    const workersReg = this.workerFleet[workerClass.name];
    const worker = new workerClass(workerData);
    workersReg.workers.push(worker);
    return worker;
  }

  pickWorker<T extends AsyncWorkerClient>(workerClass: Class<T>): T {
    if (!this.workerFleet[workerClass.name]) {
      return nullProxyFunction;
    }
    const workers = this.workerFleet[workerClass.name].workers;
    if (workers.length === 0) {
      return nullProxyFunction;
    }
    return this.workerFleet[workerClass.name].workers[0] as T;
  }

  setBaseLayer() {
    switch (this.config.type) {
      case HttpBaseLib.EXPRESS:
        this.baseApp = express();
        const secOptions = this.configGlobal.http.securityHeaders;
        if (secOptions.profile === 'allow-all') {
          this.baseApp.use((req, res, next) => {
            if (secOptions.allowRequestOrigin) {
              res.header('Access-Control-Allow-Origin', secOptions.allowRequestOrigin);
            }
            if (secOptions.allowRequestHeaders) {
              res.header('Access-Control-Allow-Headers', secOptions.allowRequestOrigin);
            }
            if (req.method === 'OPTIONS') {
              res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
              return res.end();
            }
            next();
          });
        }
        break;
    }
  }

  setSecureChannelHandler() {
    // this.register({
    //   method: HttpMethod.GET, path: `/encrypted-channel`,
    //   pre: [], handler: async (op) => {
    //     // const key = this.getPathParam('key', q, r); if (!key) { return; }
    //     // const vc = await this.getVCenterByKey(key, r); if (!vc) { return; }
    //     // const heatData = await vc.failureHeat();
    //     // return r.okJsonResult(heatData);
    //   }
    // });
  }

  setFinalLayer() {
    switch (this.config.type) {
      case HttpBaseLib.EXPRESS:
        // TODO
        break;
    }
  }

  @HTTP.GET(SecureChannel.API_PATH_PUBLIC_INFO, { rootMount: true })
  async getServerPublicInfo(op: HttpOp) {
    return op.res.returnJsonPreserialized(this.publicInfoString);
  }

  @HTTP.GET(SecureChannel.API_PATH_NEW_CHANNEL, { rootMount: true })
  async newSecureChannel(op: HttpOp) {
    const accessInfo = this.checkAccessor(op); if (op.error) { return op.endWithError(); }
    const peerInfo: SecureChannelPeer = {
      ecdhPublicKey: Buffer.from(accessInfo.channelPublicKey, 'base64'),
      iden: null, data: null,
    };
    const channel = await this.pickWorker(SecureChannelWorkerClient).newChannel(peerInfo);
    this.secureChannels[channel.channelId] = channel;
    const stamp = await this.stamp();
    return op.res.returnJson({
      ...stamp,
      channelId: channel.channelId,
      publicKey: channel.localKeyPair.publicKey.toString('base64'),
    });
  }

  @HTTP.METHODS(httpRest, SecureChannel.API_PATH_SECURE_API, { rootMount: true })
  async encryptedOperation(op: HttpOp) {
    this.getDecryptedPayload(op); if (op.error) { return op.endWithError(); }
    if (!op.req.decryptedPayloadObject) {
      return op.endWithError(HttpCode.UNAUTHORIZED, `NON_JSON_PAYLOAD`, `Supplied secure payload is not JSON format`);
    }
    const args = op.req.decryptedPayloadObject as { id: string; path: string; data: any };
    const resolved = this.pathResolve(args.path);
    if (!resolved) {
      return op.endWithError(HttpCode.NOT_FOUND, `PATH_NOT_FOUND`, `Encrypted access to unknown path: '${args.path}'`);
    }
    const api = resolved.methods[op.method];
    if (!api) {
      return op.endWithError(HttpCode.NOT_FOUND, `METHOD_NOT_FOUND`, `Method ${op.method} not found for '${api.fullpath}'`);
    }
    Object.assign(op.req.params, resolved.params);
    Object.assign(op.req.params, args.data);
    await api.handler(op);
  }

  // this.apiRoot.get('/encrypted-channel', async (req, res) => { this.encryptedChannel(new ReqRes(req, res)); });
  //   this.apiRoot.get('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });
  //   this.apiRoot.put('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });
  //   this.apiRoot.post('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });
  //   this.apiRoot.delete('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });

  addRegistration(api: GanymedeHttpServerApi) {
    if (!this.apiRegistrations) { this.apiRegistrations = []; }
    this.apiRegistrations.push(api);
  }

  register(api: GanymedeHttpServerApi) {
    const apiVersion = api.apiVersion ? api.apiVersion : this.apiVersion;
    const apiPath = api.apiPath ? api.apiPath : this.apiPath;
    const finalMountPath = api.rootMount ? '' : `/${apiPath}/${apiVersion}`;
    const fullpath = `${finalMountPath}/${api.path}`.replace(/\/\//g, '/');
    api.fullpath = fullpath;
    this.pathResolve(fullpath, api);
    const apiKey = `${api.method} ${api.fullpath}`;
    this.apiPathList.push(apiKey);
    this.apiMap[apiKey] = api;
    if (!api.pre) { api.pre = []; }
    api.pre = [...this.defaultProcessors, ...api.pre];
    switch (this.config.type) {
      case HttpBaseLib.EXPRESS:
        switch (api.method) {
          case HttpMethod.GET: return this.baseApp.get(fullpath, expressHandler(this, api));
          case HttpMethod.POST: return this.baseApp.post(fullpath, expressHandler(this, api));
          case HttpMethod.PATCH: return this.baseApp.patch(fullpath, expressHandler(this, api));
          case HttpMethod.DELETE: return this.baseApp.delete(fullpath, expressHandler(this, api));
        }
        break;
    }
  }

  beforeStart() {}
  afterStart() {}

  addPublicInfo(info: {[infoKey: string]: any}) {
    Object.assign(this.publicInfo, info);
  }

  start(options?: ServerStartOptions) {
    if (!options) { options = this.config.startOptions; }
    if (!options) { throw new Error(`Cannot start server without start options.`); }
    this.addPublicInfo({
      accessorRequired: this.config.security.accessor.required,
      secureChannelScheme: this.config.security.secureChannel.encryption,
      secureChannelPublicKey: this.config.security.secureChannel.publicKey,
      secureChannelStrict: this.config.security.secureChannel.strict,
      secureChannelRequired: this.config.security.secureChannel.required,
    });
    this.registerApis();
    this.addPublicInfo({ apiPathList: this.apiPathList });
    this.publicInfoString = JSON.stringify(this.publicInfo, null, 4);
    switch (this.config.type) {
      case HttpBaseLib.EXPRESS:
        this.beforeStart();
        this.baseApp.listen(options.port);
        this.afterStart();
        break;
    }
    return true;
  }

  async stamp() {
    const payload = this.timeAuth();
    const payloadB64 = Buffer.from(payload, 'ascii').toString('base64');
    const sig = await this.pickWorker(SecureChannelWorkerClient).signMessage(payloadB64);
    return { payload, sig };
  }

  checkAccessor(op: HttpOp) {
    const authorizationHeader = op.req.getHeader('Authorization');
    const accessorConf = this.config.security.accessor;
    if (accessorConf.required) {
      if (!authorizationHeader) {
        return op.raise(HttpCode.UNAUTHORIZED, `NO_AUTH_HEADER`, `Authorization header does not exist`);
      }
      if (!authorizationHeader.startsWith('Accessor')) {
        return op.raise(HttpCode.UNAUTHORIZED, `NO_ACCESSOR`, `Authorization header must start with Accessor`);
      }
    } else {
      return { accessor: null, t: 0, channelPublicKey: '' };
    }
    const authSplit = authorizationHeader.split('_');
    const accessorExpression = authSplit[0].split(' ')[1];
    const timeWindow = this.config.security.accessor.timeWindow;
    if (!accessorConf.baseTokenBuffer) {
      accessorConf.baseTokenBuffer = Buffer.from(accessorConf.baseToken, 'base64');
    }
    const accessData = SecureChannel.verifyAccessor(accessorExpression, accessorConf.baseTokenBuffer, timeWindow);
    if (!accessData) {
      return op.raise(HttpCode.UNAUTHORIZED, `BAD_ACCESSOR`, `Not a valid accessor`);
    }
    return { ...accessData, channelPublicKey: authSplit[1] };
  }

  getSecureChannel(op: HttpOp) {
    const accessInfo = this.checkAccessor(op); if (op.error) { return op.endWithError(); }
    const channelId = accessInfo.channelPublicKey;
    const channel = this.secureChannels[channelId];
    if (!channel) {
      return op.endWithError(HttpCode.UNAUTHORIZED, `NO_SECURE_CHANNEL`, `secure_channel_not_found`);
    }
    op.secureChannel = channel;
    return channel;
  }

  getDecryptedPayload(op: HttpOp) {
    if (op.req.decryptedPayload) { return op.req.decryptedPayload; }
    const channel = this.getSecureChannel(op); if (op.error) { return op.endWithError(); }
    const payload: SecureChannelPayload = channel.parseWrappedPayloadBase64(op.req.encryptedPayload);
    if (!payload || !payload.__scp) {
      return op.endWithError(HttpCode.UNAUTHORIZED, 'NO_SECURE_PAYLOAD', 'Secure payload not found');
    }
    op.req.decryptedPayload = channel.decryptSecureChannelPayloadIntoString(payload);
    if (isJsonString(op.req.decryptedPayload)) {
      op.req.decryptedPayloadObject = JSON.parse(op.req.decryptedPayload);
    }
    return op.req.decryptedPayload;
  }

  async handlePre(op: HttpOp) {
    let allPassed = true;
    if (op.api.pre) {
      for (const preType of op.api.pre) {
        const preFunc = this.preHandler.byType[preType];
        if (!preFunc) { continue; }
        const passed = await preFunc(op);
        if (!passed) { allPassed = false; break; }
      }
    }
    return allPassed;
  }

  async handlePost(op: HttpOp) {
    let allPassed = true;
    if (op.api.post) {
      for (const postType of op.api.post) {
        const postFunc = this.postHandler.byType[postType];
        if (!postFunc) { continue; }
        const passed = await postFunc(op);
        if (!passed) { allPassed = false; break; }
      }
    }
    return allPassed;
  }

  private pathResolve(path: string, newApi: GanymedeHttpServerApi = null): GanymedeHttpPathResolution {
    const paths = path.split('/');
    if (paths[0] === '') { paths.shift(); }
    const paramCollector = {};
    let node = this.pathTree;
    for (const pathSlot of paths) {
      const slot = decodeURIComponent(pathSlot.split('?')[0].split('#')[0]);
      if (slot === '__apidef__') { return null; }
      const isParam = slot.startsWith(':');
      if (node[slot]) {
        node = node[slot];
        continue;
      }
      const paramDef = node['?param-name?'];
      if (paramDef) {
        if (newApi && isParam && paramDef.slot !== slot) {
          throw new Error(`Cannot register a parameter slot ${slot}, ` +
                          `parameter ${paramDef.slot} has been registered by ${paramDef.registeredPath}`);
        }
        paramCollector[paramDef.name] = slot;
        node = paramDef.nextNode;
        continue;
      }
      if (newApi) {
        const nextNode = {};
        if (isParam) {
          node['?param-name?'] = { nextNode, slot, name: slot.substr(1), registeredPath: path };
        }
        node[slot] = nextNode;
        node = node[slot];
      } else {
        return null;
      }
    }
    if (!node) { return null; }
    if (newApi) {
      if (node.__apidef__ && node.__apidef__.methods[newApi.method]) {
        throw new Error(`Cannot register api at ${newApi.method} ${path}, another api is already registered`);
      }
      if (!node.__apidef__) {
        node.__apidef__ = {
          type: 'api',
          path,
          registeredPath: path,
          methods: {},
          params: {},
        } as GanymedeHttpPathResolution;
      }
      node.__apidef__.methods[newApi.method] = newApi;
      return node.__apidef__;
    }
    const registeredDef = node.__apidef__ as GanymedeHttpPathResolution;
    if (!registeredDef) {
      return null;
    }
    return {
      type: 'api',
      path,
      methods: registeredDef.methods,
      registeredPath: registeredDef.registeredPath,
      params: paramCollector,
    } as GanymedeHttpPathResolution;
  }

  private timeAuth() { return 'proof-of-authenticity__t:gaia:ms:' + Date.now(); }

}

export class GanymedeHttpRequest {
  op: HttpOp;
  res: GanymedeHttpResponse;
  data: any;
  body: string = null;
  bodyRaw: Buffer = null;
  headers: {[headerName: string]: string};
  params: {[paramName: string]: any};
  encryptedPayload: string;
  decryptedPayload: string;
  decryptedPayloadObject: object | any[];
  t = Date.now();
  constructor(op: HttpOp) {
    this.op = op;
  }
  getHeader(headerName: string): string {
    switch (this.op.server.config.type) {
      case HttpBaseLib.EXPRESS:
        return this.op.oriReq.header(headerName);
      default:
        return null;
    }
  }
}

export class GanymedeHttpResponse {
  op: HttpOp;
  req: GanymedeHttpRequest;
  headers: {[headerName: string]: string};
  t = -1;
  dt = -1;
  ended = false;
  output = [];
  endingPayload: string | Buffer = '';
  endingPayloadRaw: string | Buffer = '';
  statusCode: number = 200;
  appErrorCode: number | string = 'GENERIC_ERROR';
  private onends: (() => any)[] = [];
  constructor(op: HttpOp) {
    this.op = op;
  }
  get onend() { return this.onends; }
  send(payload: string) {
    if (this.ended) { return; }
    this.op.oriRes.send(payload);
    this.output.push(payload);
    return this;
  }
  end(payload: string) {
    if (this.ended) { return; }
    this.ended = true;
    this.t = Date.now();
    this.dt = this.t - this.req.t;
    for (const onend of this.onends) { try { if (onend) { onend(); } } catch (e) {} }
    this.endingPayload = payload;
    this.output.push(payload);
    return this;
  }
  status(num: number) {
    this.statusCode = num;
    return this;
  }
  returnCached(code: number, cached: string) {
    this.statusCode = code;
    return this.end(cached);
  }
  returnNotOk(code: number, message: any = '') {
    let statusName = 'unclassified_server_error';
    switch (code) {
      case 400: statusName = 'bad_request'; break;
      case 401: statusName = 'unauthorized'; break;
      case 404: statusName = 'not_found'; break;
      case 500: statusName = 'internal_server_error'; break;
    }
    const resObj: any = {status: statusName, message };
    if (!message && this.op.errors.length > 0) {
      const e = this.op.errors[0].e;
      message = e.message;
      if (this.op.server.config.debug.showErrorStack) { resObj.stackTrace = e.stack; }
    }
    this.statusCode = code;
    return this.end(JSON.stringify(resObj));
  }

  okJsonPreserialized(serial: string) { return `{"status":"ok","result":${serial}}`; }
  okJsonString(obj: any) { return JSON.stringify({ status: 'ok', result: obj }); }
  returnJsonPreserialized(serial: string) { return this.end(`{"status":"ok","result":${serial}}`); }
  returnJson(obj: any) { return this.end(JSON.stringify({ status: 'ok', result: obj })); }
}

export class GanymedeHttpPathResolution {
  type: 'api' | 'resource';
  path: string;
  methods: {[method: string]: GanymedeHttpServerApi};
  registeredPath: string;
  params: {[paramName: string]: string};
}

export interface GanymedeErrorObject {
  op: HttpOp;
  t: number;
  e: Error;
  errorMessage: string;
  httpStatusCode: number;
  appErrorCode: number | string;
}

export class HttpOp {
  method: HttpMethod;
  req: GanymedeHttpRequest;
  res: GanymedeHttpResponse;
  error: GanymedeErrorObject = null;
  errors: GanymedeErrorObject[] = [];
  secureChannel: SecureChannel;
  cache: HttpCacheOp;
  pendingSequential: Promise<any>[] = [];
  pendingParallel: Promise<any>[] = [];
  constructor(
    public server: GanymedeHttpServer,
    public api: GanymedeHttpServerApi,
    public oriReq: any = null,
    public oriRes: any = null,
  ) {
    this.req = new GanymedeHttpRequest(this);
    this.res = new GanymedeHttpResponse(this);
    this.res.req = this.req;
    this.req.res = this.res;
    this.cache = new HttpCacheOp(this);
  }
  raise(httpStatusCode: number, appErrorCode: number | string, errorMessage?: string): null {
    if (!errorMessage) { errorMessage = appErrorCode + ''; }
    const joinedMessage = `HTTP-${httpStatusCode} :: ${appErrorCode} :: ${errorMessage}`;
    this.error = {
      op: this,
      t: Date.now(),
      httpStatusCode,
      appErrorCode,
      errorMessage,
      e: new Error(joinedMessage),
    };
    this.errors.push(this.error);
    return null;
  }
  endWithError(httpStatusCode?: number, appErrorCode?: number | string, errorMessage?: string): null {
    if (httpStatusCode) {
      this.raise(httpStatusCode, appErrorCode, errorMessage);
    }
    this.res.returnNotOk(this.error.httpStatusCode, this.error.e.message);
    return null;
  }
  setResponse(endingPayload?: string | Buffer) {
    if (endingPayload) { this.res.endingPayload = endingPayload; }
  }
  addSequentialProcess(proc: Promise<any>) {
    this.pendingSequential.push(proc);
    return proc;
  }
  waitFor(resolver: (resolve) => void) {
    const proc = new Promise(resolver);
    this.pendingSequential.push(proc);
    return proc;
  }
  async run() {
    const preRes = await this.server.handlePre(this);
    if (preRes) {
      await this.api.handler(this);
      for (const prom of this.pendingSequential) {
        await Promise.resolve(prom);
      }
    }
    await this.server.handlePost(this);
    if (this.secureChannel) {
      this.res.endingPayloadRaw = this.res.endingPayload;
      this.res.endingPayload = JSON.stringify({
        status: 'encrypted',
        format: 'json',
        payload: this.secureChannel.createWrappedPayload(this.res.endingPayload),
      });
    }
    this.finish();
  }
  private finish(): null {
    switch (this.server.config.type) {
      case HttpBaseLib.EXPRESS:
        this.oriRes.status(this.res.statusCode).end(this.res.endingPayload);
        return null;
      default:
        throw new Error(`Unknown base http library type: ${this.server.config.type}`);
    }
  }
}

export class GanymedePreHandler {
  byType: {[preType: string]: (op: HttpOp) => Promise<boolean> } = {};
  constructor() {
    this.byType = {
      [ReqProcessor.DECRYPT]: this.optionalDecrypt,
      [ReqProcessor.AUTH]: this.auth,
      [ReqProcessor.BASIC]: this.basic,
    };
  }
  async auth(op: HttpOp) {
    return new Promise<boolean>(resolve => {
      const srvConfig = op.server.config;
      if (srvConfig.security.noauth) { return resolve(true); }
      switch (srvConfig.type) {
        case HttpBaseLib.EXPRESS:
          const authData = op.oriReq.headers.authorization;
          if (authData) {
            if (authData.startsWith('Bearer ')) { // bearer token scheme

            } else if (authData.startsWith('Accessor ')) { // accessor scheme

            }  else if (authData.startsWith('Signed ')) { // signature scheme

            }
            resolve(true);
          } else {
            op.res.returnNotOk(401);
            resolve(false);
          }
          break;
      }
    });
  }
  async basic(op: HttpOp) {
    return new Promise<boolean>(resolve => {
      switch (op.server.config.type) {
        case HttpBaseLib.EXPRESS:
          op.oriRes.header('Content-Type', 'application/json');
          // op.oriRes.header('Access-Control-Allow-Origin', '*');
          // op.oriRes.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
          let errored = false;
          const chunks: Buffer[] = [];
          op.oriReq.on('data', chunk => {
            chunks.push(chunk);
          });
          op.oriReq.on('end', () => {
            op.req.params = op.oriReq.params ? op.oriReq.params : {};
            let queryParamNames;
            if (op.oriReq.query && (queryParamNames = Object.keys(op.oriReq.query)).length > 0) {
              for (const queryParamName of queryParamNames) {
                op.req.params[queryParamName] = op.oriReq.query[queryParamName];
              }
              if (op.req.params.__enc) {
                op.req.encryptedPayload = op.req.params.__enc;
              }
            }
            op.req.bodyRaw = Buffer.concat(chunks);
            const bod = op.req.body = op.req.bodyRaw.toString();
            if (isJsonString(bod)) {
              try {
                op.req.data = JSON.parse(bod);
              } catch (e) {}
            }
            resolve(true);
          });
          op.oriReq.on('error', _ => { errored = true; resolve(false); });
          break;
      }
    });
  }
  async optionalDecrypt(op: HttpOp) {
    return new Promise<boolean>(resolve => {

    });
  }
}

export class GanymedePostHandler {
  byType: {[postType: string]: (op: HttpOp) => Promise<boolean> } = {};
  constructor() {
    this.byType = {
      [ReqProcessor.BASIC]: this.basic,
      [ReqProcessor.ENCRYPT]: this.optionalEncrypt,
    };
  }
  async basic(op: HttpOp) {
    return new Promise<boolean>(resolve => {
      switch (op.server.config.type) {
        case HttpBaseLib.EXPRESS:
          resolve(true);
          break;
      }
    });
  }
  async optionalEncrypt(op: HttpOp) {
    return new Promise<boolean>(resolve => {
      switch (op.server.config.type) {
        case HttpBaseLib.EXPRESS:
          resolve(true);
          break;
      }
    });
  }
}

export enum CacheParser {
  JSON = 'JSON'
}

export class CacheDef<T = any> {
  path: string;
  class: Class<T>;
  keys: { name: string; type: 'param' | 'fixed'; }[] = null;
  keysExceptLast: { name: string; type: 'param' | 'fixed'; }[] = null;
  lastKey: { name: string; type: 'param' | 'fixed'; } = null;
  serializer: CacheParser;
  maxOld: number = 0;
  matchExactly: boolean = false;
  defStack: string = '';
  constructor(init?: Partial<CacheDef<T>>) {
    if (init) { Object.assign(this, init); }
    if (this.path.indexOf('/') >= 0) {
      this.keys = [];
      const keys = this.path.split('/');
      keys.shift(); // discard base key
      for (const keyname of keys) {
        if (keyname.startsWith(':')) {
          this.keys.push({ name: keyname.split(':')[1], type: 'param' });
        } else {
          this.keys.push({ name: keyname, type: 'fixed' });
        }
      }
      this.lastKey = this.keys[this.keys.length - 1];
      this.keysExceptLast = this.keys.slice(0, -1);
    }
    if (!this.serializer) { this.serializer = CacheParser.JSON; }
  }
}

export interface CacheAccessOption {
  version?: number | string;
  pathParams?: {[name: string]: string};
  serialized?: string | Buffer;
  serializedResponse?: string | Buffer;
  matchExactly?: boolean;
}

export class CacheEntry<T = any> {
  hasValue?: boolean;
  value: T;
  rootNode: any;
  version: number | string;
  serialized?: string | Buffer;
  serializedResponse?: string | Buffer;
  hits: number;
  def: CacheDef<T>;
  constructor(init?: Partial<CacheEntry>) { if (init) { Object.assign(this, init); } }
  asResponse(): string | Buffer {
    if (this.serializedResponse) { return this.serializedResponse; }
  }
  asSerialized(): string | Buffer { return this.serialized; }
  getData(option?: CacheAccessOption) {
    const nav = this.keyNavigate(option);
    return nav.target[nav.key] as T;
  }
  keyNavigate(option?: CacheAccessOption) {
    if (this.def.keys) {
      if (!this.rootNode) { this.rootNode = {}; }
      let node = this.rootNode;
      for (const keyInfo of this.def.keysExceptLast) {
        const key = this.resolvePathKey(keyInfo, option);
        if (!node[key]) { node[key.name] = {}; }
        node = node[key];
      }
      const lastKeyStr = this.resolvePathKey(this.def.lastKey, option);
      return { key: lastKeyStr, target: node as any };
    } else {
      return { key: 'value', target: this as any };
    }
  }
  resolvePathKey(keyInfo: { name: string; type: 'param' | 'fixed'; }, opt?: CacheAccessOption) {
    let key;
    if (keyInfo.type === 'fixed') {
      key = keyInfo.name;
    } else {
      if (!opt?.pathParams) {
        throw new Error(`Cannot naviagate cache path '${this.def.path}'. param not given`);
      }
      const paramValue = opt?.pathParams?.[keyInfo.name];
      if (!paramValue) {
        throw new Error(`Cannot naviagate cache path '${this.def.path}'. param '${keyInfo.name}' not found`);
      }
      key = paramValue;
    }
    if (!key) {
      throw new Error(`Cannot naviagate cache path '${this.def.path}; Params = ${opt.pathParams}`);
    }
    return key;
  }
}


export class HttpCacheOp {
  constructor(public op: HttpOp) {}
  async handler<T>(cacheDef: CacheDef<T>, option: CacheAccessOption,
                   dataResolver: (resolve: (data: T) => void) => void) {
    if (!option) { option = {}; }
    if (!option.pathParams) { option.pathParams = {}; }
    if (this.op.req.params) {
      Object.assign(option.pathParams, this.op.req.params);
    }
    const entry = this.cacheEntryGet(cacheDef, option);
    const matched = entry ? true : false;
    return this.op.addSequentialProcess(new Promise<void>(procResolve => {
      const resolve = (data: T, cacheEntry?: CacheEntry<T>) => {
        if (matched && cacheEntry?.serializedResponse) {
            this.op.setResponse(cacheEntry.serializedResponse as string);
            return procResolve();
        }
        let dataString;
        let responseString;
        switch (cacheDef.serializer) {
          case CacheParser.JSON:
            dataString = option.serialized = JSON.stringify(data);
            responseString = option.serializedResponse = this.op.res.okJsonPreserialized(dataString);
            break;
        }
        this.cacheSet(cacheDef, data, option);
        this.op.setResponse(responseString);
        return procResolve();
      };
      if (matched) {
        resolve(entry.getData(option), entry);
      } else {
        dataResolver(resolve);
      }
    }));
  }
  cacheEntryGet(cacheDef: CacheDef, option?: CacheAccessOption) {
    const cacheData = this.op.server.cacheData[cacheDef.path];
    if (!cacheData || !cacheData.hasValue) { return null; }
    const matchExactly = cacheDef.matchExactly ? true : (option.matchExactly ? true : false);
    if (matchExactly) {
      if (option && option.version && option.version !== cacheData.version) {
        return null; // looking to match time/version exactly, but didn't match.
      }
    } else {
      if (cacheData.def.maxOld !== 0 && // 0 means no expiry
          Date.now() - (cacheData.version as number) > cacheData.def.maxOld) {
        return null; // too old
      }
    }
    ++cacheData.hits;
    return cacheData;
  }
  cacheSet<T>(cacheDef: CacheDef<T>, value: T, option?: CacheAccessOption) {
    if (!this.op.server.cacheData[cacheDef.path]) {
      throw new Error(`Cache key '${cacheDef.path}' is not defined ahead-of-time for this server.`);
    }
    const cacheData = this.op.server.cacheData[cacheDef.path];
    const setter = cacheData.keyNavigate(option);
    setter.target[setter.key] = value;
    if (option?.version) {
      cacheData.version = option.version;
    } else {
      cacheData.version = Date.now();
    }
    if (option?.serialized) {
      cacheData.serialized = option.serialized;
    }
    if (option?.serializedResponse) {
      cacheData.serializedResponse = option.serializedResponse;
    }
    cacheData.hasValue = true;
    return cacheData;
  }
  cacheUnset(cacheDef: CacheDef) {
    const cacheData = this.op.server.cacheData[cacheDef.path];
    if (cacheData) { cacheData.hasValue = false; }
    return cacheData;
  }
}

function expressHandler(server: GanymedeHttpServer, api: GanymedeHttpServerApi) {
  return async (oriReq, oriRes) => {
    const op = new HttpOp(server, api, oriReq, oriRes);
    op.method = oriReq.method;
    await op.run();
  };
}

function isJsonString(str: string) {
  return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'));
}
