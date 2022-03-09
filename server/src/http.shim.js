"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HttpCacheOp = exports.CacheEntry = exports.CacheDef = exports.CacheParser = exports.GanymedePostHandler = exports.GanymedePreHandler = exports.HttpOp = exports.GanymedeHttpPathResolution = exports.GanymedeHttpResponse = exports.GanymedeHttpRequest = exports.GanymedeHttpServer = exports.HTTP = exports.HttpBaseLib = exports.GanymedeHttpServerApi = exports.ReqProcessor = exports.HttpCode = exports.HttpMethod = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var express = require("express");
var secure_channel_1 = require("../../components/util/shared/crypto/secure.channel");
var http_shim_worker_security_1 = require("./http.shim.worker.security");
var async_null_proxy_1 = require("../../components/util/server/async.null.proxy");
var common_1 = require("../../components/util/shared/common");
var http_models_1 = require("./http.models");
Object.defineProperty(exports, "HttpMethod", { enumerable: true, get: function () { return http_models_1.HttpMethod; } });
Object.defineProperty(exports, "HttpCode", { enumerable: true, get: function () { return http_models_1.HttpCode; } });
var defaultConfig = require("./http.shim.default.config.json");
var defaultGlobalConfig = require("./const.global.config.json");
var ReqProcessor;
(function (ReqProcessor) {
    ReqProcessor["AUTH"] = "AUTH";
    ReqProcessor["BASIC"] = "BASIC";
    ReqProcessor["DECRYPT"] = "DECRYPT";
    ReqProcessor["ENCRYPT"] = "ENCRYPT";
})(ReqProcessor = exports.ReqProcessor || (exports.ReqProcessor = {}));
var GanymedeHttpServerApi = /** @class */ (function () {
    function GanymedeHttpServerApi() {
        this.path = '';
        this.fullpath = '';
        this.method = http_models_1.HttpMethod.GET;
    }
    return GanymedeHttpServerApi;
}());
exports.GanymedeHttpServerApi = GanymedeHttpServerApi;
var HttpBaseLib;
(function (HttpBaseLib) {
    HttpBaseLib["EXPRESS"] = "EXPRESS";
})(HttpBaseLib = exports.HttpBaseLib || (exports.HttpBaseLib = {}));
function methodsRegister(methods, path, apiOptions) {
    var _this = this;
    path = path.replace(/\/\//g, '/');
    return function (target, propertyKey, descriptor) {
        var logic = descriptor.value;
        var methodMap = {};
        var handler = function (op) { return __awaiter(_this, void 0, void 0, function () {
            var api, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        api = methodMap[op.method];
                        if (!api) {
                            return [2 /*return*/, op.endWithError(http_models_1.HttpCode.NOT_FOUND, "METHOD_NOT_FOUND", "Method ".concat(op.method, " not found for '").concat(api.fullpath, "'"))];
                        }
                        return [4 /*yield*/, Promise.resolve(logic.apply(api.server, [op]))];
                    case 1:
                        result = _a.sent();
                        // console.log('post test');
                        return [2 /*return*/, result];
                }
            });
        }); };
        for (var _i = 0, methods_1 = methods; _i < methods_1.length; _i++) {
            var method = methods_1[_i];
            var methodApi = { method: method, path: path, handlerName: propertyKey };
            if (apiOptions) {
                Object.assign(methodApi, apiOptions);
            }
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
exports.HTTP = {
    GET: function (path, apiOptions) {
        return methodsRegister([http_models_1.HttpMethod.GET], path, apiOptions);
    },
    POST: function (path, apiOptions) {
        return methodsRegister([http_models_1.HttpMethod.POST], path, apiOptions);
    },
    PATCH: function (path, apiOptions) {
        return methodsRegister([http_models_1.HttpMethod.PATCH], path, apiOptions);
    },
    DELETE: function (path, apiOptions) {
        return methodsRegister([http_models_1.HttpMethod.DELETE], path, apiOptions);
    },
    METHODS: function (methods, path, apiOptions) {
        return methodsRegister(methods, path, apiOptions);
    },
};
var GanymedeHttpServer = /** @class */ (function () {
    function GanymedeHttpServer(config, globalConf, beforeSuper) {
        this.publicInfo = {};
        this.publicInfoString = '';
        this.apiPath = 'api';
        this.apiVersion = 'v1';
        this.apiMap = {};
        this.apiPathList = [];
        this.pathTree = {};
        this.defaultProcessors = [];
        this.secureChannels = {};
        this.workerFleet = {};
        this.cacheData = {};
        this.state = {
            apiRegistered: false,
            apiRegisterStack: null,
        };
        if (beforeSuper) {
            beforeSuper();
        }
        this.configGlobal = (0, common_1.completeConfig)(globalConf ? globalConf : {}, defaultGlobalConfig);
        this.config = this.normalizeServerConfig(config);
        this.preHandler = new GanymedePreHandler();
        this.postHandler = new GanymedePostHandler();
        if (this.config.security.secureChannel.enabled && this.config.security.secureChannel.signingKey) {
            var channelKey = this.config.security.secureChannel.signingKey;
            if (!this.config.security.secureChannel.publicKey) {
                this.config.security.secureChannel.publicKey = secure_channel_1.SecureChannel.getPublicKeyFrom(channelKey);
            }
            for (var i = 0; i < this.config.workers.secureChannelWorkers.initialCount; ++i) {
                this.addWorker(http_shim_worker_security_1.SecureChannelWorkerClient, {
                    workerId: i, scopeName: this.config.scopeName, signingKey: channelKey,
                });
            }
        }
        // this.pickWorker().import('./http.shim.worker.extension').then(async () => {});
        this.setBaseLayer();
        this.setSecureChannelHandler();
    }
    GanymedeHttpServer.prototype.registerApis = function () {
        if (this.state.apiRegistered) {
            throw new Error("Cannot register apis twice; already registered from ".concat(this.state.apiRegisterStack));
        }
        this.state.apiRegistered = true;
        this.state.apiRegisterStack = new Error().stack;
        for (var _i = 0, _a = this.apiRegistrations; _i < _a.length; _i++) {
            var api = _a[_i];
            api.server = this;
            this.register(api);
        }
    };
    GanymedeHttpServer.prototype.normalizeServerConfig = function (config) {
        if (!config.scopeName) {
            config.scopeName = "httpshim;pid=".concat(process.pid);
        }
        var newConfig = (0, common_1.completeConfig)(config, defaultConfig);
        newConfig.debug.showErrorStack = true;
        return newConfig;
    };
    GanymedeHttpServer.prototype.addDefaultProcessor = function () {
        var processors = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            processors[_i] = arguments[_i];
        }
        if (this.state.apiRegistered) {
            throw new Error("addDefaultProcessor must be called before api registration");
        }
        for (var _a = 0, processors_1 = processors; _a < processors_1.length; _a++) {
            var proc = processors_1[_a];
            this.defaultProcessors.push(proc);
        }
    };
    GanymedeHttpServer.prototype.cacheDefine = function (init) {
        if (this.cacheData[init.path]) {
            throw new Error("Cache path '".concat(init.path, "' is already defined."));
        }
        var def = new CacheDef(init);
        this.cacheData[def.path] = new CacheEntry({
            value: null,
            hits: 0,
            version: 0,
            def: def,
        });
        return def;
    };
    GanymedeHttpServer.prototype.addWorker = function (workerClass, workerData) {
        if (!workerData) {
            workerData = {};
        }
        if (!this.workerFleet[workerClass.name]) {
            this.workerFleet[workerClass.name] = { workers: [] };
        }
        var workersReg = this.workerFleet[workerClass.name];
        var worker = new workerClass(workerData);
        workersReg.workers.push(worker);
        return worker;
    };
    GanymedeHttpServer.prototype.pickWorker = function (workerClass) {
        if (!this.workerFleet[workerClass.name]) {
            return async_null_proxy_1.nullProxyFunction;
        }
        var workers = this.workerFleet[workerClass.name].workers;
        if (workers.length === 0) {
            return async_null_proxy_1.nullProxyFunction;
        }
        return this.workerFleet[workerClass.name].workers[0];
    };
    GanymedeHttpServer.prototype.setBaseLayer = function () {
        switch (this.config.type) {
            case HttpBaseLib.EXPRESS:
                this.baseApp = express();
                var secOptions_1 = this.configGlobal.http.securityHeaders;
                if (secOptions_1.profile === 'allow-all') {
                    this.baseApp.use(function (req, res, next) {
                        if (secOptions_1.allowRequestOrigin) {
                            res.header('Access-Control-Allow-Origin', secOptions_1.allowRequestOrigin);
                        }
                        if (secOptions_1.allowRequestHeaders) {
                            res.header('Access-Control-Allow-Headers', secOptions_1.allowRequestOrigin);
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
    };
    GanymedeHttpServer.prototype.setSecureChannelHandler = function () {
        // this.register({
        //   method: HttpMethod.GET, path: `/encrypted-channel`,
        //   pre: [], handler: async (op) => {
        //     // const key = this.getPathParam('key', q, r); if (!key) { return; }
        //     // const vc = await this.getVCenterByKey(key, r); if (!vc) { return; }
        //     // const heatData = await vc.failureHeat();
        //     // return r.okJsonResult(heatData);
        //   }
        // });
    };
    GanymedeHttpServer.prototype.setFinalLayer = function () {
        switch (this.config.type) {
            case HttpBaseLib.EXPRESS:
                // TODO
                break;
        }
    };
    GanymedeHttpServer.prototype.getServerPublicInfo = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, op.res.returnJsonPreserialized(this.publicInfoString)];
            });
        });
    };
    GanymedeHttpServer.prototype.newSecureChannel = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var accessInfo, peerInfo, channel, stamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accessInfo = this.checkAccessor(op);
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        peerInfo = {
                            ecdhPublicKey: Buffer.from(accessInfo.channelPublicKey, 'base64'),
                            iden: null, data: null,
                        };
                        return [4 /*yield*/, this.pickWorker(http_shim_worker_security_1.SecureChannelWorkerClient).newChannel(peerInfo)];
                    case 1:
                        channel = _a.sent();
                        this.secureChannels[channel.channelId] = channel;
                        return [4 /*yield*/, this.stamp()];
                    case 2:
                        stamp = _a.sent();
                        return [2 /*return*/, op.res.returnJson(__assign(__assign({}, stamp), { channelId: channel.channelId, publicKey: channel.localKeyPair.publicKey.toString('base64') }))];
                }
            });
        });
    };
    GanymedeHttpServer.prototype.encryptedOperation = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var args, resolved, api;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.getDecryptedPayload(op);
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        if (!op.req.decryptedPayloadObject) {
                            return [2 /*return*/, op.endWithError(http_models_1.HttpCode.UNAUTHORIZED, "NON_JSON_PAYLOAD", "Supplied secure payload is not JSON format")];
                        }
                        args = op.req.decryptedPayloadObject;
                        resolved = this.pathResolve(args.path);
                        if (!resolved) {
                            return [2 /*return*/, op.endWithError(http_models_1.HttpCode.NOT_FOUND, "PATH_NOT_FOUND", "Encrypted access to unknown path: '".concat(args.path, "'"))];
                        }
                        api = resolved.methods[op.method];
                        if (!api) {
                            return [2 /*return*/, op.endWithError(http_models_1.HttpCode.NOT_FOUND, "METHOD_NOT_FOUND", "Method ".concat(op.method, " not found for '").concat(api.fullpath, "'"))];
                        }
                        Object.assign(op.req.params, resolved.params);
                        Object.assign(op.req.params, args.data);
                        return [4 /*yield*/, api.handler(op)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // this.apiRoot.get('/encrypted-channel', async (req, res) => { this.encryptedChannel(new ReqRes(req, res)); });
    //   this.apiRoot.get('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });
    //   this.apiRoot.put('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });
    //   this.apiRoot.post('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });
    //   this.apiRoot.delete('/encrypted-api', async (req, res) => { this.encryptedApi(new ReqRes(req, res)); });
    GanymedeHttpServer.prototype.addRegistration = function (api) {
        if (!this.apiRegistrations) {
            this.apiRegistrations = [];
        }
        this.apiRegistrations.push(api);
    };
    GanymedeHttpServer.prototype.register = function (api) {
        var apiVersion = api.apiVersion ? api.apiVersion : this.apiVersion;
        var apiPath = api.apiPath ? api.apiPath : this.apiPath;
        var finalMountPath = api.rootMount ? '' : "/".concat(apiPath, "/").concat(apiVersion);
        var fullpath = "".concat(finalMountPath, "/").concat(api.path).replace(/\/\//g, '/');
        api.fullpath = fullpath;
        this.pathResolve(fullpath, api);
        var apiKey = "".concat(api.method, " ").concat(api.fullpath);
        this.apiPathList.push(apiKey);
        this.apiMap[apiKey] = api;
        if (!api.pre) {
            api.pre = [];
        }
        api.pre = __spreadArray(__spreadArray([], this.defaultProcessors, true), api.pre, true);
        switch (this.config.type) {
            case HttpBaseLib.EXPRESS:
                switch (api.method) {
                    case http_models_1.HttpMethod.GET: return this.baseApp.get(fullpath, expressHandler(this, api));
                    case http_models_1.HttpMethod.POST: return this.baseApp.post(fullpath, expressHandler(this, api));
                    case http_models_1.HttpMethod.PATCH: return this.baseApp.patch(fullpath, expressHandler(this, api));
                    case http_models_1.HttpMethod.DELETE: return this.baseApp.delete(fullpath, expressHandler(this, api));
                }
                break;
        }
    };
    GanymedeHttpServer.prototype.beforeStart = function () { };
    GanymedeHttpServer.prototype.afterStart = function () { };
    GanymedeHttpServer.prototype.addPublicInfo = function (info) {
        Object.assign(this.publicInfo, info);
    };
    GanymedeHttpServer.prototype.start = function (options) {
        if (!options) {
            options = this.config.startOptions;
        }
        if (!options) {
            throw new Error("Cannot start server without start options.");
        }
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
    };
    GanymedeHttpServer.prototype.stamp = function () {
        return __awaiter(this, void 0, void 0, function () {
            var payload, payloadB64, sig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        payload = this.timeAuth();
                        payloadB64 = Buffer.from(payload, 'ascii').toString('base64');
                        return [4 /*yield*/, this.pickWorker(http_shim_worker_security_1.SecureChannelWorkerClient).signMessage(payloadB64)];
                    case 1:
                        sig = _a.sent();
                        return [2 /*return*/, { payload: payload, sig: sig }];
                }
            });
        });
    };
    GanymedeHttpServer.prototype.checkAccessor = function (op) {
        var authorizationHeader = op.req.getHeader('Authorization');
        var accessorConf = this.config.security.accessor;
        if (accessorConf.required) {
            if (!authorizationHeader) {
                return op.raise(http_models_1.HttpCode.UNAUTHORIZED, "NO_AUTH_HEADER", "Authorization header does not exist");
            }
            if (!authorizationHeader.startsWith('Accessor')) {
                return op.raise(http_models_1.HttpCode.UNAUTHORIZED, "NO_ACCESSOR", "Authorization header must start with Accessor");
            }
        }
        else {
            return { accessor: null, t: 0, channelPublicKey: '' };
        }
        var authSplit = authorizationHeader.split('_');
        var accessorExpression = authSplit[0].split(' ')[1];
        var timeWindow = this.config.security.accessor.timeWindow;
        if (!accessorConf.baseTokenBuffer) {
            accessorConf.baseTokenBuffer = Buffer.from(accessorConf.baseToken, 'base64');
        }
        var accessData = secure_channel_1.SecureChannel.verifyAccessor(accessorExpression, accessorConf.baseTokenBuffer, timeWindow);
        if (!accessData) {
            return op.raise(http_models_1.HttpCode.UNAUTHORIZED, "BAD_ACCESSOR", "Not a valid accessor");
        }
        return __assign(__assign({}, accessData), { channelPublicKey: authSplit[1] });
    };
    GanymedeHttpServer.prototype.getSecureChannel = function (op) {
        var accessInfo = this.checkAccessor(op);
        if (op.error) {
            return op.endWithError();
        }
        var channelId = accessInfo.channelPublicKey;
        var channel = this.secureChannels[channelId];
        if (!channel) {
            return op.endWithError(http_models_1.HttpCode.UNAUTHORIZED, "NO_SECURE_CHANNEL", "secure_channel_not_found");
        }
        op.secureChannel = channel;
        return channel;
    };
    GanymedeHttpServer.prototype.getDecryptedPayload = function (op) {
        if (op.req.decryptedPayload) {
            return op.req.decryptedPayload;
        }
        var channel = this.getSecureChannel(op);
        if (op.error) {
            return op.endWithError();
        }
        var payload = channel.parseWrappedPayloadBase64(op.req.encryptedPayload);
        if (!payload || !payload.__scp) {
            return op.endWithError(http_models_1.HttpCode.UNAUTHORIZED, 'NO_SECURE_PAYLOAD', 'Secure payload not found');
        }
        op.req.decryptedPayload = channel.decryptSecureChannelPayloadIntoString(payload);
        if (isJsonString(op.req.decryptedPayload)) {
            op.req.decryptedPayloadObject = JSON.parse(op.req.decryptedPayload);
        }
        return op.req.decryptedPayload;
    };
    GanymedeHttpServer.prototype.handlePre = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var allPassed, _i, _a, preType, preFunc, passed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        allPassed = true;
                        if (!op.api.pre) return [3 /*break*/, 4];
                        _i = 0, _a = op.api.pre;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        preType = _a[_i];
                        preFunc = this.preHandler.byType[preType];
                        if (!preFunc) {
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, preFunc(op)];
                    case 2:
                        passed = _b.sent();
                        if (!passed) {
                            allPassed = false;
                            return [3 /*break*/, 4];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, allPassed];
                }
            });
        });
    };
    GanymedeHttpServer.prototype.handlePost = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var allPassed, _i, _a, postType, postFunc, passed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        allPassed = true;
                        if (!op.api.post) return [3 /*break*/, 4];
                        _i = 0, _a = op.api.post;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        postType = _a[_i];
                        postFunc = this.postHandler.byType[postType];
                        if (!postFunc) {
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, postFunc(op)];
                    case 2:
                        passed = _b.sent();
                        if (!passed) {
                            allPassed = false;
                            return [3 /*break*/, 4];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, allPassed];
                }
            });
        });
    };
    GanymedeHttpServer.prototype.pathResolve = function (path, newApi) {
        if (newApi === void 0) { newApi = null; }
        var paths = path.split('/');
        if (paths[0] === '') {
            paths.shift();
        }
        var paramCollector = {};
        var node = this.pathTree;
        for (var _i = 0, paths_1 = paths; _i < paths_1.length; _i++) {
            var pathSlot = paths_1[_i];
            var slot = decodeURIComponent(pathSlot.split('?')[0].split('#')[0]);
            if (slot === '__apidef__') {
                return null;
            }
            var isParam = slot.startsWith(':');
            if (node[slot]) {
                node = node[slot];
                continue;
            }
            var paramDef = node['?param-name?'];
            if (paramDef) {
                if (newApi && isParam && paramDef.slot !== slot) {
                    throw new Error("Cannot register a parameter slot ".concat(slot, ", ") +
                        "parameter ".concat(paramDef.slot, " has been registered by ").concat(paramDef.registeredPath));
                }
                paramCollector[paramDef.name] = slot;
                node = paramDef.nextNode;
                continue;
            }
            if (newApi) {
                var nextNode = {};
                if (isParam) {
                    node['?param-name?'] = { nextNode: nextNode, slot: slot, name: slot.substr(1), registeredPath: path };
                }
                node[slot] = nextNode;
                node = node[slot];
            }
            else {
                return null;
            }
        }
        if (!node) {
            return null;
        }
        if (newApi) {
            if (node.__apidef__ && node.__apidef__.methods[newApi.method]) {
                throw new Error("Cannot register api at ".concat(newApi.method, " ").concat(path, ", another api is already registered"));
            }
            if (!node.__apidef__) {
                node.__apidef__ = {
                    type: 'api',
                    path: path,
                    registeredPath: path,
                    methods: {},
                    params: {},
                };
            }
            node.__apidef__.methods[newApi.method] = newApi;
            return node.__apidef__;
        }
        var registeredDef = node.__apidef__;
        if (!registeredDef) {
            return null;
        }
        return {
            type: 'api',
            path: path,
            methods: registeredDef.methods,
            registeredPath: registeredDef.registeredPath,
            params: paramCollector,
        };
    };
    GanymedeHttpServer.prototype.timeAuth = function () { return 'proof-of-authenticity__t:gaia:ms:' + Date.now(); };
    __decorate([
        exports.HTTP.GET(secure_channel_1.SecureChannel.API_PATH_PUBLIC_INFO, { rootMount: true })
    ], GanymedeHttpServer.prototype, "getServerPublicInfo", null);
    __decorate([
        exports.HTTP.GET(secure_channel_1.SecureChannel.API_PATH_NEW_CHANNEL, { rootMount: true })
    ], GanymedeHttpServer.prototype, "newSecureChannel", null);
    __decorate([
        exports.HTTP.METHODS(http_models_1.httpRest, secure_channel_1.SecureChannel.API_PATH_SECURE_API, { rootMount: true })
    ], GanymedeHttpServer.prototype, "encryptedOperation", null);
    return GanymedeHttpServer;
}());
exports.GanymedeHttpServer = GanymedeHttpServer;
var GanymedeHttpRequest = /** @class */ (function () {
    function GanymedeHttpRequest(op) {
        this.body = null;
        this.bodyRaw = null;
        this.t = Date.now();
        this.op = op;
    }
    GanymedeHttpRequest.prototype.getHeader = function (headerName) {
        switch (this.op.server.config.type) {
            case HttpBaseLib.EXPRESS:
                return this.op.oriReq.header(headerName);
            default:
                return null;
        }
    };
    return GanymedeHttpRequest;
}());
exports.GanymedeHttpRequest = GanymedeHttpRequest;
var GanymedeHttpResponse = /** @class */ (function () {
    function GanymedeHttpResponse(op) {
        this.t = -1;
        this.dt = -1;
        this.ended = false;
        this.output = [];
        this.endingPayload = '';
        this.endingPayloadRaw = '';
        this.statusCode = 200;
        this.appErrorCode = 'GENERIC_ERROR';
        this.onends = [];
        this.op = op;
    }
    Object.defineProperty(GanymedeHttpResponse.prototype, "onend", {
        get: function () { return this.onends; },
        enumerable: false,
        configurable: true
    });
    GanymedeHttpResponse.prototype.send = function (payload) {
        if (this.ended) {
            return;
        }
        this.op.oriRes.send(payload);
        this.output.push(payload);
        return this;
    };
    GanymedeHttpResponse.prototype.end = function (payload) {
        if (this.ended) {
            return;
        }
        this.ended = true;
        this.t = Date.now();
        this.dt = this.t - this.req.t;
        for (var _i = 0, _a = this.onends; _i < _a.length; _i++) {
            var onend = _a[_i];
            try {
                if (onend) {
                    onend();
                }
            }
            catch (e) { }
        }
        this.endingPayload = payload;
        this.output.push(payload);
        return this;
    };
    GanymedeHttpResponse.prototype.status = function (num) {
        this.statusCode = num;
        return this;
    };
    GanymedeHttpResponse.prototype.returnCached = function (code, cached) {
        this.statusCode = code;
        return this.end(cached);
    };
    GanymedeHttpResponse.prototype.returnNotOk = function (code, message) {
        if (message === void 0) { message = ''; }
        var statusName = 'unclassified_server_error';
        switch (code) {
            case 400:
                statusName = 'bad_request';
                break;
            case 401:
                statusName = 'unauthorized';
                break;
            case 404:
                statusName = 'not_found';
                break;
            case 500:
                statusName = 'internal_server_error';
                break;
        }
        var resObj = { status: statusName, message: message };
        if (!message && this.op.errors.length > 0) {
            var e = this.op.errors[0].e;
            message = e.message;
            if (this.op.server.config.debug.showErrorStack) {
                resObj.stackTrace = e.stack;
            }
        }
        this.statusCode = code;
        return this.end(JSON.stringify(resObj));
    };
    GanymedeHttpResponse.prototype.okJsonPreserialized = function (serial) { return "{\"status\":\"ok\",\"result\":".concat(serial, "}"); };
    GanymedeHttpResponse.prototype.okJsonString = function (obj) { return JSON.stringify({ status: 'ok', result: obj }); };
    GanymedeHttpResponse.prototype.returnJsonPreserialized = function (serial) { return this.end("{\"status\":\"ok\",\"result\":".concat(serial, "}")); };
    GanymedeHttpResponse.prototype.returnJson = function (obj) { return this.end(JSON.stringify({ status: 'ok', result: obj })); };
    return GanymedeHttpResponse;
}());
exports.GanymedeHttpResponse = GanymedeHttpResponse;
var GanymedeHttpPathResolution = /** @class */ (function () {
    function GanymedeHttpPathResolution() {
    }
    return GanymedeHttpPathResolution;
}());
exports.GanymedeHttpPathResolution = GanymedeHttpPathResolution;
var HttpOp = /** @class */ (function () {
    function HttpOp(server, api, oriReq, oriRes) {
        if (oriReq === void 0) { oriReq = null; }
        if (oriRes === void 0) { oriRes = null; }
        this.server = server;
        this.api = api;
        this.oriReq = oriReq;
        this.oriRes = oriRes;
        this.error = null;
        this.errors = [];
        this.pendingSequential = [];
        this.pendingParallel = [];
        this.req = new GanymedeHttpRequest(this);
        this.res = new GanymedeHttpResponse(this);
        this.res.req = this.req;
        this.req.res = this.res;
        this.cache = new HttpCacheOp(this);
    }
    HttpOp.prototype.raise = function (httpStatusCode, appErrorCode, errorMessage) {
        if (!errorMessage) {
            errorMessage = appErrorCode + '';
        }
        var joinedMessage = "HTTP-".concat(httpStatusCode, " :: ").concat(appErrorCode, " :: ").concat(errorMessage);
        this.error = {
            op: this,
            t: Date.now(),
            httpStatusCode: httpStatusCode,
            appErrorCode: appErrorCode,
            errorMessage: errorMessage,
            e: new Error(joinedMessage),
        };
        this.errors.push(this.error);
        return null;
    };
    HttpOp.prototype.endWithError = function (httpStatusCode, appErrorCode, errorMessage) {
        if (httpStatusCode) {
            this.raise(httpStatusCode, appErrorCode, errorMessage);
        }
        this.res.returnNotOk(this.error.httpStatusCode, this.error.e.message);
        return null;
    };
    HttpOp.prototype.setResponse = function (endingPayload) {
        if (endingPayload) {
            this.res.endingPayload = endingPayload;
        }
    };
    HttpOp.prototype.addSequentialProcess = function (proc) {
        this.pendingSequential.push(proc);
        return proc;
    };
    HttpOp.prototype.waitFor = function (resolver) {
        var proc = new Promise(resolver);
        this.pendingSequential.push(proc);
        return proc;
    };
    HttpOp.prototype.run = function () {
        return __awaiter(this, void 0, void 0, function () {
            var preRes, _i, _a, prom;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.server.handlePre(this)];
                    case 1:
                        preRes = _b.sent();
                        if (!preRes) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.api.handler(this)];
                    case 2:
                        _b.sent();
                        _i = 0, _a = this.pendingSequential;
                        _b.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        prom = _a[_i];
                        return [4 /*yield*/, Promise.resolve(prom)];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, this.server.handlePost(this)];
                    case 7:
                        _b.sent();
                        if (this.secureChannel) {
                            this.res.endingPayloadRaw = this.res.endingPayload;
                            this.res.endingPayload = JSON.stringify({
                                status: 'encrypted',
                                format: 'json',
                                payload: this.secureChannel.createWrappedPayload(this.res.endingPayload),
                            });
                        }
                        this.finish();
                        return [2 /*return*/];
                }
            });
        });
    };
    HttpOp.prototype.finish = function () {
        switch (this.server.config.type) {
            case HttpBaseLib.EXPRESS:
                this.oriRes.status(this.res.statusCode).end(this.res.endingPayload);
                return null;
            default:
                throw new Error("Unknown base http library type: ".concat(this.server.config.type));
        }
    };
    return HttpOp;
}());
exports.HttpOp = HttpOp;
var GanymedePreHandler = /** @class */ (function () {
    function GanymedePreHandler() {
        var _a;
        this.byType = {};
        this.byType = (_a = {},
            _a[ReqProcessor.DECRYPT] = this.optionalDecrypt,
            _a[ReqProcessor.AUTH] = this.auth,
            _a[ReqProcessor.BASIC] = this.basic,
            _a);
    }
    GanymedePreHandler.prototype.auth = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var srvConfig = op.server.config;
                        if (srvConfig.security.noauth) {
                            return resolve(true);
                        }
                        switch (srvConfig.type) {
                            case HttpBaseLib.EXPRESS:
                                var authData = op.oriReq.headers.authorization;
                                if (authData) {
                                    if (authData.startsWith('Bearer ')) { // bearer token scheme
                                    }
                                    else if (authData.startsWith('Accessor ')) { // accessor scheme
                                    }
                                    else if (authData.startsWith('Signed ')) { // signature scheme
                                    }
                                    resolve(true);
                                }
                                else {
                                    op.res.returnNotOk(401);
                                    resolve(false);
                                }
                                break;
                        }
                    })];
            });
        });
    };
    GanymedePreHandler.prototype.basic = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        switch (op.server.config.type) {
                            case HttpBaseLib.EXPRESS:
                                op.oriRes.header('Content-Type', 'application/json');
                                // op.oriRes.header('Access-Control-Allow-Origin', '*');
                                // op.oriRes.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                                var errored_1 = false;
                                var chunks_1 = [];
                                op.oriReq.on('data', function (chunk) {
                                    chunks_1.push(chunk);
                                });
                                op.oriReq.on('end', function () {
                                    op.req.params = op.oriReq.params ? op.oriReq.params : {};
                                    var queryParamNames;
                                    if (op.oriReq.query && (queryParamNames = Object.keys(op.oriReq.query)).length > 0) {
                                        for (var _i = 0, queryParamNames_1 = queryParamNames; _i < queryParamNames_1.length; _i++) {
                                            var queryParamName = queryParamNames_1[_i];
                                            op.req.params[queryParamName] = op.oriReq.query[queryParamName];
                                        }
                                        if (op.req.params.__enc) {
                                            op.req.encryptedPayload = op.req.params.__enc;
                                        }
                                    }
                                    op.req.bodyRaw = Buffer.concat(chunks_1);
                                    var bod = op.req.body = op.req.bodyRaw.toString();
                                    if (isJsonString(bod)) {
                                        try {
                                            op.req.data = JSON.parse(bod);
                                        }
                                        catch (e) { }
                                    }
                                    resolve(true);
                                });
                                op.oriReq.on('error', function (_) { errored_1 = true; resolve(false); });
                                break;
                        }
                    })];
            });
        });
    };
    GanymedePreHandler.prototype.optionalDecrypt = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                    })];
            });
        });
    };
    return GanymedePreHandler;
}());
exports.GanymedePreHandler = GanymedePreHandler;
var GanymedePostHandler = /** @class */ (function () {
    function GanymedePostHandler() {
        var _a;
        this.byType = {};
        this.byType = (_a = {},
            _a[ReqProcessor.BASIC] = this.basic,
            _a[ReqProcessor.ENCRYPT] = this.optionalEncrypt,
            _a);
    }
    GanymedePostHandler.prototype.basic = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        switch (op.server.config.type) {
                            case HttpBaseLib.EXPRESS:
                                resolve(true);
                                break;
                        }
                    })];
            });
        });
    };
    GanymedePostHandler.prototype.optionalEncrypt = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        switch (op.server.config.type) {
                            case HttpBaseLib.EXPRESS:
                                resolve(true);
                                break;
                        }
                    })];
            });
        });
    };
    return GanymedePostHandler;
}());
exports.GanymedePostHandler = GanymedePostHandler;
var CacheParser;
(function (CacheParser) {
    CacheParser["JSON"] = "JSON";
})(CacheParser = exports.CacheParser || (exports.CacheParser = {}));
var CacheDef = /** @class */ (function () {
    function CacheDef(init) {
        this.keys = null;
        this.keysExceptLast = null;
        this.lastKey = null;
        this.maxOld = 0;
        this.matchExactly = false;
        this.defStack = '';
        if (init) {
            Object.assign(this, init);
        }
        if (this.path.indexOf('/') >= 0) {
            this.keys = [];
            var keys = this.path.split('/');
            keys.shift(); // discard base key
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var keyname = keys_1[_i];
                if (keyname.startsWith(':')) {
                    this.keys.push({ name: keyname.split(':')[1], type: 'param' });
                }
                else {
                    this.keys.push({ name: keyname, type: 'fixed' });
                }
            }
            this.lastKey = this.keys[this.keys.length - 1];
            this.keysExceptLast = this.keys.slice(0, -1);
        }
        if (!this.serializer) {
            this.serializer = CacheParser.JSON;
        }
    }
    return CacheDef;
}());
exports.CacheDef = CacheDef;
var CacheEntry = /** @class */ (function () {
    function CacheEntry(init) {
        if (init) {
            Object.assign(this, init);
        }
    }
    CacheEntry.prototype.asResponse = function () {
        if (this.serializedResponse) {
            return this.serializedResponse;
        }
    };
    CacheEntry.prototype.asSerialized = function () { return this.serialized; };
    CacheEntry.prototype.getData = function (option) {
        var nav = this.keyNavigate(option);
        return nav.target[nav.key];
    };
    CacheEntry.prototype.keyNavigate = function (option) {
        if (this.def.keys) {
            if (!this.rootNode) {
                this.rootNode = {};
            }
            var node = this.rootNode;
            for (var _i = 0, _a = this.def.keysExceptLast; _i < _a.length; _i++) {
                var keyInfo = _a[_i];
                var key = this.resolvePathKey(keyInfo, option);
                if (!node[key]) {
                    node[key.name] = {};
                }
                node = node[key];
            }
            var lastKeyStr = this.resolvePathKey(this.def.lastKey, option);
            return { key: lastKeyStr, target: node };
        }
        else {
            return { key: 'value', target: this };
        }
    };
    CacheEntry.prototype.resolvePathKey = function (keyInfo, opt) {
        var _a;
        var key;
        if (keyInfo.type === 'fixed') {
            key = keyInfo.name;
        }
        else {
            if (!(opt === null || opt === void 0 ? void 0 : opt.pathParams)) {
                throw new Error("Cannot naviagate cache path '".concat(this.def.path, "'. param not given"));
            }
            var paramValue = (_a = opt === null || opt === void 0 ? void 0 : opt.pathParams) === null || _a === void 0 ? void 0 : _a[keyInfo.name];
            if (!paramValue) {
                throw new Error("Cannot naviagate cache path '".concat(this.def.path, "'. param '").concat(keyInfo.name, "' not found"));
            }
            key = paramValue;
        }
        if (!key) {
            throw new Error("Cannot naviagate cache path '".concat(this.def.path, "; Params = ").concat(opt.pathParams));
        }
        return key;
    };
    return CacheEntry;
}());
exports.CacheEntry = CacheEntry;
var HttpCacheOp = /** @class */ (function () {
    function HttpCacheOp(op) {
        this.op = op;
    }
    HttpCacheOp.prototype.handler = function (cacheDef, option, dataResolver) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, matched;
            var _this = this;
            return __generator(this, function (_a) {
                if (!option) {
                    option = {};
                }
                if (!option.pathParams) {
                    option.pathParams = {};
                }
                if (this.op.req.params) {
                    Object.assign(option.pathParams, this.op.req.params);
                }
                entry = this.cacheEntryGet(cacheDef, option);
                matched = entry ? true : false;
                return [2 /*return*/, this.op.addSequentialProcess(new Promise(function (procResolve) {
                        var resolve = function (data, cacheEntry) {
                            if (matched && (cacheEntry === null || cacheEntry === void 0 ? void 0 : cacheEntry.serializedResponse)) {
                                _this.op.setResponse(cacheEntry.serializedResponse);
                                return procResolve();
                            }
                            var dataString;
                            var responseString;
                            switch (cacheDef.serializer) {
                                case CacheParser.JSON:
                                    dataString = option.serialized = JSON.stringify(data);
                                    responseString = option.serializedResponse = _this.op.res.okJsonPreserialized(dataString);
                                    break;
                            }
                            _this.cacheSet(cacheDef, data, option);
                            _this.op.setResponse(responseString);
                            return procResolve();
                        };
                        if (matched) {
                            resolve(entry.getData(option), entry);
                        }
                        else {
                            dataResolver(resolve);
                        }
                    }))];
            });
        });
    };
    HttpCacheOp.prototype.cacheEntryGet = function (cacheDef, option) {
        var cacheData = this.op.server.cacheData[cacheDef.path];
        if (!cacheData || !cacheData.hasValue) {
            return null;
        }
        var matchExactly = cacheDef.matchExactly ? true : (option.matchExactly ? true : false);
        if (matchExactly) {
            if (option && option.version && option.version !== cacheData.version) {
                return null; // looking to match time/version exactly, but didn't match.
            }
        }
        else {
            if (cacheData.def.maxOld !== 0 && // 0 means no expiry
                Date.now() - cacheData.version > cacheData.def.maxOld) {
                return null; // too old
            }
        }
        ++cacheData.hits;
        return cacheData;
    };
    HttpCacheOp.prototype.cacheSet = function (cacheDef, value, option) {
        if (!this.op.server.cacheData[cacheDef.path]) {
            throw new Error("Cache key '".concat(cacheDef.path, "' is not defined ahead-of-time for this server."));
        }
        var cacheData = this.op.server.cacheData[cacheDef.path];
        var setter = cacheData.keyNavigate(option);
        setter.target[setter.key] = value;
        if (option === null || option === void 0 ? void 0 : option.version) {
            cacheData.version = option.version;
        }
        else {
            cacheData.version = Date.now();
        }
        if (option === null || option === void 0 ? void 0 : option.serialized) {
            cacheData.serialized = option.serialized;
        }
        if (option === null || option === void 0 ? void 0 : option.serializedResponse) {
            cacheData.serializedResponse = option.serializedResponse;
        }
        cacheData.hasValue = true;
        return cacheData;
    };
    HttpCacheOp.prototype.cacheUnset = function (cacheDef) {
        var cacheData = this.op.server.cacheData[cacheDef.path];
        if (cacheData) {
            cacheData.hasValue = false;
        }
        return cacheData;
    };
    return HttpCacheOp;
}());
exports.HttpCacheOp = HttpCacheOp;
function expressHandler(server, api) {
    var _this = this;
    return function (oriReq, oriRes) { return __awaiter(_this, void 0, void 0, function () {
        var op;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    op = new HttpOp(server, api, oriReq, oriRes);
                    op.method = oriReq.method;
                    return [4 /*yield*/, op.run()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
}
function isJsonString(str) {
    return (str.startsWith('{') && str.endsWith('}')) || (str.startsWith('[') && str.endsWith(']'));
}
