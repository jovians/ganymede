/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as fs from 'fs';
import { GanymedeHttpServer, HttpOp, HttpBaseLib, HTTP, ReqProcessor, HttpCode } from '../../server/src/http.shim';
// import { DestorWorkerClient } from './destor.worker';

const scopeName = `destor;pid=${process.pid}`;
const conf = fs.existsSync('config/ganymede.secrets.json') ?
                JSON.parse(fs.readFileSync('config/ganymede.secrets.json', 'utf8'))
              : JSON.parse(fs.readFileSync('ganymede.secrets.json', 'utf8'));
const destorData = conf.destor;
const sharedSecrets = conf.secret;
const envSpecificSecrets = conf.envSpecificSecret;
const authData = destorData?.auth;
export let rootAccessToken = authData.tokenRoot;
export let trustInfo = authData.trust;

const testAuthTopology = {
  type: 'endpoints',
  endpoints: [
    { endpoint: 'destor-endpoint', token: rootAccessToken, trust: trustInfo },
    { endpoint: 'http://host.docker.internal:17070', token: rootAccessToken, trust: trustInfo },
    { endpoint: 'http://localhost:17070', token: rootAccessToken, trust: trustInfo },
  ]
};

// DESTOR: Dynamically evoloving service topology orchestration resource
export class DestorInstance extends GanymedeHttpServer {

  authTopology: {[envName: string]: any} = {
    dev: testAuthTopology,
    stg: testAuthTopology,
    prod: testAuthTopology,
  };
  authTopologyCached: {[envName: string]: string} = {
    dev: JSON.stringify(this.authTopology.dev),
    stg: JSON.stringify(this.authTopology.stg),
    prod: JSON.stringify(this.authTopology.prod),
  };

  constructor() {
    super({
      type: HttpBaseLib.EXPRESS,
      scopeName,
      security: {
        accessor: { required: true, baseToken: authData.tokenRoot },
        secureChannel: { enabled: true, required: true, signingKey: authData.key },
      },
      startOptions: { port: 17070 },
    });
    this.apiVersion = 'v1';
    this.apiPath = this.configGlobal.destor.basePath;
    this.addDefaultProcessor(ReqProcessor.BASIC);
  }

  @HTTP.GET(`/`, { rootMount: true })
  async rootProofOfAuthenticity(op: HttpOp) {
    this.checkAccessor(op); if (op.error) { return op.endWithError(); }
    const stamp = await this.stamp();
    return op.res.returnJson({ ...stamp });
  }

  @HTTP.GET(`/secret-resolve/:env`)
  async secretResolve(op: HttpOp) {
    const requestedPath = JSON.parse(JSON.stringify(op.req.params.path));
    requestedPath.shift(); // remove first '<secret.'
    const env = op.req.params.env;
    let secret = null;
    if (envSpecificSecrets[env]) {
      secret = this.resolveSecretFromStore(requestedPath, envSpecificSecrets[env]);
      if (secret !== null) { return op.res.returnJson({ value: secret }); }
    }
    secret = this.resolveSecretFromStore(requestedPath, sharedSecrets);
    if (secret !== null) { return op.res.returnJson({ value: secret }); }
    return op.endWithError(HttpCode.NOT_FOUND, `SECRET_NOT_FOUND`, `Cannot find ${op.req.params.path.join('.')} (env=${env})`);
  }

  @HTTP.GET(`/auth-server/:env`)
  async authServerResolve(op: HttpOp) {
    // const requestedPath = op.req.params.path;
    // requestedPath.shift(); // remove first '<secret.'
    // let at = secretData;
    // for (const pathname of requestedPath) {
    //   at = at[pathname];
    //   if (at === undefined) { break; }
    // }
    // if (at === undefined) {
    //   return op.endWithError(HttpCode.NOT_FOUND, `SECRET_NOT_FOUND`, `Cannot find`);
    // }
    // return op.res.returnJson({ value: at });
  }

  private resolveSecretFromStore(secretPath: string[], store: any) {
    let at = store;
    for (const pathname of secretPath) {
      at = at[pathname];
      if (at === undefined) { break; }
    }
    if (at === undefined) {
      return null;
    }
    return at;
  }
}

export const mainDestor = new DestorInstance();
mainDestor.start();
