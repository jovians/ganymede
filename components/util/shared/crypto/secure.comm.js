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
exports.SecureComm = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var axios = require("axios");
var fourq_1 = require("@jovian/fourq");
var uuid_1 = require("uuid");
var secure_channel_1 = require("./secure.channel");
var SecureComm = /** @class */ (function () {
    function SecureComm(config) {
        this.errors = [];
        if (!config.token) {
            config.token = '';
        }
        if (!config.encryptedChannelPath) {
            config.encryptedChannelPath = secure_channel_1.SecureChannel.API_PATH_NEW_CHANNEL;
        }
        if (!config.encryptedApiPath) {
            config.encryptedApiPath = secure_channel_1.SecureChannel.API_PATH_SECURE_API;
        }
        if (!config.defaultTimeout) {
            config.defaultTimeout = 3600;
        }
        if (!config.defaultChannelExpire && config.defaultChannelExpire !== 0) {
            config.defaultChannelExpire = 3600;
        }
        this.config = config;
        this.pending = this.channelInit();
    }
    SecureComm.prototype.pushError = function (e) {
        this.error = e;
        this.errors.push(e);
    };
    SecureComm.prototype.getAuthHeader = function (token, channelPubKeyB64, channelExp) {
        var header = secure_channel_1.SecureChannel.getAccessorHeader('internal', token) + '_' + channelPubKeyB64;
        if (channelExp) {
            header = header + '_' + channelExp;
        }
        return header;
    };
    SecureComm.prototype.channelInit = function () {
        var _this = this;
        var config = this.config;
        var ecdhKeypair = fourq_1.FourQ.ecdhGenerateKeyPair();
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            var channelMyPubkey, res, pubkey, sigData, valid, peerInfo, channel, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        channelMyPubkey = ecdhKeypair.publicKey.toString('base64');
                        return [4 /*yield*/, axios.default.get("" + config.endpoint + config.encryptedChannelPath, {
                                timeout: 5000, headers: {
                                    Authorization: this.getAuthHeader(config.token, channelMyPubkey, config.defaultChannelExpire),
                                }
                            })];
                    case 1:
                        res = _a.sent();
                        if (res.status !== 200) {
                            return [2 /*return*/, resolve(false)];
                        }
                        pubkey = config.trust ? Buffer.from(config.trust.split('::')[1], 'base64') : null;
                        sigData = res.data.result;
                        if (config.trust) {
                            valid = secure_channel_1.SecureChannel.verifyStamp(sigData, pubkey);
                            if (!valid) {
                                return [2 /*return*/, resolve(false)];
                            }
                        }
                        peerInfo = { ecdhPublicKey: Buffer.from(sigData.publicKey, 'base64') };
                        if (config.trust) {
                            peerInfo.signaturePublicKey = pubkey;
                        }
                        channel = new secure_channel_1.SecureChannel(secure_channel_1.SecureChannelTypes.ECC_4Q, sigData.channelId, peerInfo, ecdhKeypair);
                        this.channel = channel;
                        this.pending = null;
                        return [2 /*return*/, resolve(true)];
                    case 2:
                        e_1 = _a.sent();
                        return [2 /*return*/, resolve(false)];
                    case 3: return [2 /*return*/];
                }
            });
        }); });
    };
    SecureComm.prototype.waitForChannel = function () {
        return __awaiter(this, void 0, void 0, function () {
            var res;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.pending) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.pending];
                    case 1:
                        res = _a.sent();
                        if (!res) {
                            return [2 /*return*/, false];
                        }
                        _a.label = 2;
                    case 2: return [2 /*return*/, true];
                }
            });
        });
    };
    SecureComm.prototype.get = function (reqObj) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reqObj.method = 'GET';
                        return [4 /*yield*/, this.makeRequest(reqObj)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SecureComm.prototype.post = function (reqObj) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        reqObj.method = 'POST';
                        return [4 /*yield*/, this.makeRequest(reqObj)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    SecureComm.prototype.makeRequest = function (reqObj) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var timeout, encPayload, reqPath, reqOpts;
                        var _this = this;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0: return [4 /*yield*/, this.waitForChannel()];
                                case 1:
                                    if (!(_a.sent())) {
                                        this.pushError(new Error("Unable to get channel on endpoint " + this.config.endpoint));
                                        return [2 /*return*/, resolve(null)];
                                    }
                                    try {
                                        timeout = reqObj.timeout ? reqObj.timeout : this.config.defaultTimeout;
                                        encPayload = this.channel.createWrappedPayloadBase64({
                                            id: (0, uuid_1.v4)(),
                                            path: reqObj.path,
                                            data: reqObj.data,
                                        });
                                        reqPath = (reqObj.useRawPath || this.config.useRawPath) ? reqObj.path : this.config.encryptedApiPath;
                                        if (!reqObj.path) {
                                            reqObj.path = '/';
                                        }
                                        if (!reqObj.path.startsWith('/')) {
                                            reqObj.path = '/' + reqObj.path;
                                        }
                                        reqOpts = { timeout: timeout, headers: { Authorization: this.getAuthHeader(this.config.token, this.channel.channelId) } };
                                        switch (reqObj.method) {
                                            case 'GET': {
                                                axios.default.get("" + this.config.endpoint + reqPath + "?__enc=" + encPayload, reqOpts)
                                                    .then(function (res) { resolve(_this.unwrapEncryptedResponse(res)); })
                                                    .catch(function (e) { _this.pushError(e); resolve(null); });
                                                break;
                                            }
                                            case 'PUT': {
                                                axios.default.put("" + this.config.endpoint + reqPath, reqOpts)
                                                    .then(function (res) { resolve(_this.unwrapEncryptedResponse(res)); })
                                                    .catch(function (e) { _this.pushError(e); resolve(null); });
                                                break;
                                            }
                                            case 'POST': {
                                                axios.default.post("" + this.config.endpoint + reqPath, reqOpts)
                                                    .then(function (res) { resolve(_this.unwrapEncryptedResponse(res)); })
                                                    .catch(function (e) { _this.pushError(e); resolve(null); });
                                                break;
                                            }
                                            case 'PATCH': {
                                                axios.default.patch("" + this.config.endpoint + reqPath, reqOpts)
                                                    .then(function (res) { resolve(_this.unwrapEncryptedResponse(res)); })
                                                    .catch(function (e) { _this.pushError(e); resolve(null); });
                                                break;
                                            }
                                            case 'DELETE': {
                                                axios.default.delete("" + this.config.endpoint + reqPath, reqOpts)
                                                    .then(function (res) { resolve(_this.unwrapEncryptedResponse(res)); })
                                                    .catch(function (e) { _this.pushError(e); resolve(null); });
                                                break;
                                            }
                                        }
                                    }
                                    catch (e) {
                                        this.pushError(e);
                                        resolve(null);
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    SecureComm.prototype.unwrapEncryptedResponse = function (res) {
        var responseText = this.channel.decryptSecureChannelPayloadIntoString(res.data.payload);
        switch (res.data.format) {
            case 'json':
                return JSON.parse(responseText);
            default:
                return null;
        }
    };
    return SecureComm;
}());
exports.SecureComm = SecureComm;
