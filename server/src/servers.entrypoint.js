"use strict";
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
exports.ServerEntryPoint = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var auth_server_1 = require("./auth.server");
var const_1 = require("./const");
var extensions_1 = require("./extensions");
var secure_channel_1 = require("../../components/util/shared/crypto/secure.channel");
var fs = require("fs");
var axios = require("axios");
var dns = require("dns");
var cluster = require('cluster');
var compileOnly = (process.argv.filter(function (arg) { return arg === 'compileOnly'; }).length > 0);
var ServerEntryPoint = /** @class */ (function () {
    function ServerEntryPoint() {
    }
    ServerEntryPoint.start = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, arg, currentEnv, destorInfo, destorData, matchedDestors, tryCount, _b, _c, target, urlObj, hostname, ip, res, _d, matchedDestors_1, destor, res, pubkeyB64, verified, e_1, _e, _f, baseModuleName, authServer, _g, _h, nativeExt, extData, globalConfData, extKey;
            return __generator(this, function (_j) {
                switch (_j.label) {
                    case 0:
                        if (ServerEntryPoint.started) {
                            return [2 /*return*/];
                        }
                        for (_i = 0, _a = process.argv; _i < _a.length; _i++) {
                            arg = _a[_i];
                            if (arg === '--prod') {
                                const_1.ServerConst.data.prod = true;
                            }
                        }
                        if (!cluster.isMaster) return [3 /*break*/, 13];
                        currentEnv = 'test';
                        destorInfo = { list: [] };
                        if (!!compileOnly) return [3 /*break*/, 12];
                        destorData = fs.existsSync('config/.ganymede.topology.json') ?
                            JSON.parse(fs.readFileSync('config/.ganymede.topology.json', 'utf8'))
                            : JSON.parse(fs.readFileSync('.ganymede.topology.json', 'utf8'));
                        currentEnv = destorData.env;
                        matchedDestors = [];
                        tryCount = 0;
                        _b = 0, _c = destorData.destor.targets;
                        _j.label = 1;
                    case 1:
                        if (!(_b < _c.length)) return [3 /*break*/, 5];
                        target = _c[_b];
                        ++tryCount;
                        urlObj = new URL(target.endpoint);
                        hostname = urlObj.hostname;
                        return [4 /*yield*/, dnsLookUp(hostname)];
                    case 2:
                        ip = _j.sent();
                        if (!ip) {
                            console.log("[Destor resolve #" + (tryCount - 1) + "] unable to resolve " + hostname + ", trying next...");
                            return [3 /*break*/, 4];
                        }
                        return [4 /*yield*/, destorGet(target)];
                    case 3:
                        res = _j.sent();
                        if (!res) {
                            return [3 /*break*/, 4];
                        }
                        matchedDestors.push(target);
                        _j.label = 4;
                    case 4:
                        _b++;
                        return [3 /*break*/, 1];
                    case 5:
                        if (matchedDestors.length === 0) {
                            console.log("No destor profiles are available, exiting.");
                            process.exit(0);
                        }
                        _d = 0, matchedDestors_1 = matchedDestors;
                        _j.label = 6;
                    case 6:
                        if (!(_d < matchedDestors_1.length)) return [3 /*break*/, 11];
                        destor = matchedDestors_1[_d];
                        _j.label = 7;
                    case 7:
                        _j.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, axios.default.get(destor.endpoint, {
                                timeout: 7000,
                                headers: { Authorization: secure_channel_1.SecureChannel.getAccessorHeader('internal', destor.token) },
                            })];
                    case 8:
                        res = _j.sent();
                        if (res.status !== 200) {
                            return [3 /*break*/, 10];
                        }
                        pubkeyB64 = destor.trust.split('::')[1];
                        verified = secure_channel_1.SecureChannel.verifyStamp(res.data.result, pubkeyB64);
                        if (!verified) {
                            return [3 /*break*/, 10];
                        }
                        destorInfo.list.push(destor);
                        return [3 /*break*/, 10];
                    case 9:
                        e_1 = _j.sent();
                        console.log(e_1);
                        return [3 /*break*/, 10];
                    case 10:
                        _d++;
                        return [3 /*break*/, 6];
                    case 11:
                        if (destorInfo.list.length === 0) {
                            console.log("No destor profiles are available, exiting. 2");
                            process.exit(0);
                        }
                        console.log("[Destor resolved] discovered " + destorInfo.list.length + " active destor endpoints.");
                        _j.label = 12;
                    case 12:
                        // Default modules
                        if (const_1.ServerConst.data.base.modules && !compileOnly) {
                            for (_e = 0, _f = Object.keys(const_1.ServerConst.data.base.modules); _e < _f.length; _e++) {
                                baseModuleName = _f[_e];
                                console.log("Ganymede server module '" + baseModuleName + "' entrypoint (pid=" + process.pid + ")");
                                switch (baseModuleName) {
                                    case 'auth':
                                        authServer = new auth_server_1.AuthServer();
                                        authServer.start();
                                        break;
                                }
                            }
                        }
                        else if (compileOnly) {
                            console.log("ganymede main server modules have been compiled.");
                        }
                        // Spawn Worker & Log Worker
                        if (const_1.ServerConst.data.extensions) {
                            if (const_1.ServerConst.data.extensions.native) {
                                for (_g = 0, _h = Object.keys(const_1.ServerConst.data.extensions.native); _g < _h.length; _g++) {
                                    nativeExt = _h[_g];
                                    extData = const_1.ServerConst.data.extensions.native[nativeExt];
                                    globalConfData = const_1.ServerConst.data.global ? const_1.ServerConst.data.global : {};
                                    extData._extension_key = "native." + nativeExt;
                                    cluster.fork({
                                        BUILD_UUID: ServerEntryPoint.buildUuid,
                                        EXT_KEY: extData._extension_key,
                                        EXT_DATA_BASE64: Buffer.from(JSON.stringify(extData)).toString('base64'),
                                        DESTOR_INFO_BASE64: Buffer.from(JSON.stringify(destorInfo)).toString('base64'),
                                        DESTOR_ENV: currentEnv,
                                        GLOBAL_CONF_DATA_BASE64: Buffer.from(JSON.stringify(globalConfData)).toString('base64')
                                    });
                                }
                            }
                        }
                        return [3 /*break*/, 14];
                    case 13:
                        if (cluster.isWorker) {
                            extKey = process.env.EXT_KEY;
                            extensions_1.GanymedeServerExtensions.run(extKey, compileOnly);
                        }
                        _j.label = 14;
                    case 14:
                        ServerEntryPoint.started = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    ServerEntryPoint.buildUuid = fs.existsSync('.build.uuid') ? fs.readFileSync('.build.uuid', 'utf8') : '';
    ServerEntryPoint.started = false;
    return ServerEntryPoint;
}());
exports.ServerEntryPoint = ServerEntryPoint;
function dnsLookUp(host) {
    return new Promise(function (resolve) {
        dns.lookup(host, function (e, address) {
            if (e) {
                return resolve(null);
            }
            resolve(address);
        });
    });
}
function destorGet(target) {
    return new Promise(function (resolve) {
        var pubkeyB64 = target.trust.split('::')[1];
        axios.default.get(target.endpoint, { headers: { Authorization: secure_channel_1.SecureChannel.getAccessorHeader('internal', target.token) } }).then(function (r) {
            if (r.status && r.data.status === 'ok') {
                var verified = secure_channel_1.SecureChannel.verifyStamp(r.data.result, pubkeyB64);
                resolve(verified ? verified.payload : null);
            }
            else {
                resolve(null);
            }
        }).catch(function (e) {
            if (e.response) {
                console.log("[Destor resolution error] destor handshake failed for " + target.endpoint + ", returned with " +
                    (e.response.status + ": " + e.response.data.status));
            }
            else {
                console.log("[Destor resolution error] destor handshake failed for " + target.endpoint + ", returned with " + e.message);
            }
            resolve(null);
        });
    });
}
