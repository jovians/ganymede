"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthServer = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var axios = require("axios");
var http_shim_1 = require("./http.shim");
var config_importer_1 = require("./config.importer");
var scopeName = "authsrv;pid=".concat(process.pid);
var authServerConfig = config_importer_1.secretsConfig === null || config_importer_1.secretsConfig === void 0 ? void 0 : config_importer_1.secretsConfig.authServer;
var authData = authServerConfig === null || authServerConfig === void 0 ? void 0 : authServerConfig.auth;
var wsDefaultOptions = {
    port: 7002,
    perMessageDeflate: {
        zlibDeflateOptions: {
            // See zlib defaults.
            chunkSize: 1024, memLevel: 7, level: 3
        },
        zlibInflateOptions: { chunkSize: 10 * 1024 },
        // Other options settable:
        clientNoContextTakeover: true,
        serverNoContextTakeover: true,
        serverMaxWindowBits: 10,
        concurrencyLimit: 10,
        threshold: 1024 // Size (in bytes) below which messages should not be compressed.
    }
};
var AuthServer = /** @class */ (function (_super) {
    __extends(AuthServer, _super);
    function AuthServer() {
        var _this = _super.call(this, {
            type: http_shim_1.HttpBaseLib.EXPRESS,
            scopeName: scopeName,
            security: {
                accessor: { required: true, baseToken: authData.tokenRoot },
                secureChannel: { enabled: true, required: true, signingKey: authData.key },
            },
            startOptions: { port: 7010 },
        }) || this;
        _this.handlers = {};
        _this.apiVersion = 'v1';
        _this.apiPath = _this.configGlobal.api.basePath;
        _this.addDefaultProcessor(http_shim_1.ReqProcessor.BASIC);
        return _this;
        // this.shellWorker = this.addWorker(ShellPassthruWorkerClient);
        // const config = completeConfig<typeof wsDefaultOptions>({ port: 7002 }, wsDefaultOptions);
        // this.wss = new WebSocket.Server(config);
        // let client;
        // this.wss.on('connection', (ws, req) => {
        //   try {
        //     const target = uuidv4();
        //     const reqArgsStr = Buffer.from(req.url.split('/wss/__xterm_wss__/?a=').pop(), 'base64').toString('utf8');
        //     const args = JSON.parse(reqArgsStr);
        //     const sessionId = args.sessionId;
        //     const ctrlSequence = String.fromCharCode(16, 16) + sessionId;
        //     const ctrlSequenceBuffer = Buffer.from(ctrlSequence, 'ascii');
        //     const ctrlSequenceLength = ctrlSequence.length;
        //     ws.sessionId = sessionId;
        //     ws.ip = req.headers['x-real-ip'];
        //     this.handlers[target] = ws; // single handler per target
        //     ws.on('message', (message: Buffer) => {
        //       try {
        //         if (message.length > 1 && message[0] === 16 && message[1] === 16 &&
        //             message.compare(ctrlSequenceBuffer, 0, ctrlSequenceLength, 0, ctrlSequenceLength) === 0) {
        //           const ctrlPayload = message.slice(ctrlSequenceLength).toString('utf8');
        //           const ctrlLines = ctrlPayload.split('\n');
        //           const ctrlAction = ctrlLines.shift();
        //           const ctrlEncoding = ctrlLines.shift();
        //           const ctrlData = ctrlLines.join('\n');
        //           switch (ctrlAction) {
        //             case 'resize': {
        //               const decoded = JSON.parse(ctrlData);
        //               const cols = decoded.cols ? decoded.cols : 80;
        //               const rows = decoded.rows ? decoded.rows : 24;
        //               this.shellWorker.resize(cols, rows);
        //               break;
        //             }
        //           }
        //           return;
        //         }
        //         this.shellWorker.inputData(message.toString('base64'));
        //       } catch (e) { console.log(e); }
        //     });
        //     ws.on('close', () => {
        //       this.handlers[target] = null;
        //       // console.log(`Handler for '${target}' disconnected. (ip=${ws.ip}, wsid=${ws.uuid})`);
        //     });
        //     client = ws;
        //   } catch (e) {
        //     console.log(e);
        //   }
        // });
        // this.shellWorker.output$.subscribe(data => {
        //   if (client) { client.send(data); }
        // });
        // this.shellWorker.close$.subscribe(_ => {
        //   if (client) { client.send(client.ctrlPattern + 'closed'); }
        // });
    }
    AuthServer.prototype.proxyRequest = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var paramsCopy, url, method, timeout, headers, newHeaders, _i, _a, headerName, headerValue, reqOpts, proxyRequestFunction;
            return __generator(this, function (_b) {
                paramsCopy = JSON.parse(JSON.stringify(op.req.params));
                url = paramsCopy.__url;
                method = paramsCopy.__method ? paramsCopy.__method : http_shim_1.HttpMethod.GET;
                timeout = paramsCopy.__timeout ? paramsCopy.__timeout : 7000;
                headers = paramsCopy.__headers ? paramsCopy.__headers : '';
                if (paramsCopy.__url) {
                    delete paramsCopy.__url;
                }
                if (paramsCopy.__method) {
                    delete paramsCopy.__method;
                }
                if (paramsCopy.__headers) {
                    delete paramsCopy.__headers;
                }
                if (paramsCopy.__timeout) {
                    delete paramsCopy.__timeout;
                }
                if (paramsCopy.__enc) {
                    delete paramsCopy.__enc;
                }
                newHeaders = {};
                for (_i = 0, _a = headers.split(','); _i < _a.length; _i++) {
                    headerName = _a[_i];
                    headerValue = op.req.getHeader(headerName);
                    if (headerValue) {
                        newHeaders[headerName] = headerValue;
                    }
                }
                reqOpts = { timeout: timeout, headers: newHeaders, params: paramsCopy, };
                switch (method) {
                    case 'GET': {
                        proxyRequestFunction = axios.default.get;
                        break;
                    }
                    case 'PUT': {
                        proxyRequestFunction = axios.default.put;
                        break;
                    }
                    case 'POST': {
                        proxyRequestFunction = axios.default.post;
                        break;
                    }
                    case 'PATCH': {
                        proxyRequestFunction = axios.default.patch;
                        break;
                    }
                    case 'DELETE': {
                        proxyRequestFunction = axios.default.delete;
                        break;
                    }
                }
                op.waitFor(function (resolve) {
                    proxyRequestFunction.apply(axios.default, [url, reqOpts]).then(function (res) {
                        if (typeof res.data === 'string') {
                            op.res.returnJson({ message: res.data });
                        }
                        else {
                            op.res.returnJson(res.data);
                        }
                        resolve();
                    }).catch(function (e) {
                        var res = e.response;
                        if (res) {
                            op.res.returnNotOk(res.status, "Proxy request failed: ".concat(res.data));
                        }
                        else {
                            op.res.returnNotOk(500, "Proxy request failed: ".concat(e.message));
                        }
                        resolve();
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    AuthServer.prototype.terminalIn = function (op) {
        console.log('terminal-called');
        this.shellWorker.inputData(op.req.params.command);
        op.res.returnJson({});
    };
    __decorate([
        http_shim_1.HTTP.GET("/proxy-request")
    ], AuthServer.prototype, "proxyRequest", null);
    __decorate([
        http_shim_1.HTTP.GET("/terminal-in")
    ], AuthServer.prototype, "terminalIn", null);
    return AuthServer;
}(http_shim_1.GanymedeHttpServer));
exports.AuthServer = AuthServer;
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
