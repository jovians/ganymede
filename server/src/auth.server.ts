/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as fs from 'fs';
import * as axios from 'axios';
import { GanymedeHttpServer, HTTP, HttpBaseLib, HttpMethod, HttpOp, ReqProcessor } from './http.shim';

const scopeName = `authsrv;pid=${process.pid}`;
const conf = fs.existsSync('config/ganymede.secrets.json') ?
                JSON.parse(fs.readFileSync('config/ganymede.secrets.json', 'utf8'))
              : JSON.parse(fs.readFileSync('ganymede.secrets.json', 'utf8'));
const authServerData = conf?.authServer;
const authData = authServerData?.auth;

export class AuthServer extends GanymedeHttpServer {

  constructor() {
    super({
      type: HttpBaseLib.EXPRESS,
      scopeName,
      security: {
        accessor: { required: true, baseToken: authData.tokenRoot },
        secureChannel: { enabled: true, required: true, signingKey: authData.key },
      },
      startOptions: { port: 7000 },
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

// {

//   port: number = 7220;
//   workers: AuthWorkerClient[] = [];
//   workerCount = 2;
//   apiRoot: Express.Application;

//   async start(data: any) {
//     if (data.port) { this.port = data.port; }
//     try {

//       if (authServerData && authData) {
//         for (let i = 0; i < this.workerCount; ++i) {
//           const workerData = {
//             workerFile: AuthWorkerClient.workerFile,
//             workerId: i,
//             scopeName,
//             signingKey: authData.key,
//           };
//           this.workers.push(new AuthWorkerClient(workerData));
//         }
//       }

//       this.apiRoot = Express();
//       // support application/json type post data
//       this.apiRoot.use(BodyParser.json());
//       // support application/x-www-form-urlencoded post data
//       this.apiRoot.use(BodyParser.urlencoded({ extended: false }));

//       this.apiRoot.use((req, res, next) => {
//         res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
//         res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
//         next();
//       });

//       this.apiRoot.get('/api/ganymede/auth/deviceTimestamp', async (req, res) => {
//         const cookieRaw = req.headers.cookie;
//         let target;
//         let secret;
//         if (cookieRaw) { target = cookieRaw.split('gany_dev_ss_token='); }
//         if (target && target.length > 2) { return res.end(''); } // deny spoof
//         if (!cookieRaw || target.length === 1) {
//           const keypair = FourQ.generateKeyPair();
//           secret = keypair.secretKey.toString('base64').replace('+', '-').replace('/', '.').replace('=', '_');
//           // seed =  crypto.randomBytes(36).toString('base64').replace('+', '-').replace('/', '.');
//           res.cookie('gany_dev_ss_token', secret, {
//             expires: new Date(Date.now() + 3155695200), // 100 years
//             httpOnly: true,
//             secure: ServerConst.data.prod ? true : false
//           });
//         } else {
//           secret = target[1].split('; ')[0].replace('-', '+').replace('.', '/').replace('_', '=');
//         }
//         const t = Date.now();
//         const nonce =  crypto.randomBytes(6).toString('base64');
//         const msg = Buffer.from(`${ServerConst.data.salts.browserTimestamp}:${nonce}:${t}`);
//         const hash = crypto.createHash('sha256').update(msg).digest('base64');
//         return res.end(`${Date.now()}::${nonce}::${hash}`);
//       });

//       if (appData.features.preinit) {
//         this.apiRoot.get('/api/ganymede/preinit', async (req, res) => {
//           const ret: any = {};
//           let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
//           if (ip.startsWith('::ffff')) { ip = ip.split('::ffff:')[1]; }
//           let swMeta;
//           try {
//             swMeta = fs.statSync('../../../assets-root/sw.js');
//             swMeta = JSON.parse(swMeta);
//           } catch (e) {}
//           ret.sw = swMeta ? Math.floor(swMeta.mtimeMs) : 0;
//           res.set('Last-Modified', Date.now() + ', ' + ip);
//           res.set('Content-Type', 'application/json');
//           res.end(JSON.stringify(ret));
//         });
//       }

//       console.log(`Auth server initialized... (port=${this.port})`);
//       this.apiRoot.listen(this.port);

//     } catch(e) { console.log(e); }
//   }

//   terminationHandler(e) {
//     console.log(e, 'test');
//     if (e && e.preventDefault) { e.preventDefault(); }
//   }

// }

// function getcookie(req) {
//   var cookie = req.headers.cookie;
//   // user=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
//   return cookie.split('; ');
// }
