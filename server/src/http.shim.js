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
exports.__esModule = true;
exports.GanymedePostHandler = exports.GanymedePreHandler = exports.GanymedeHttpResponse = exports.GanymedeHttpRequest = exports.GanymedeHttpServer = exports.GanymedeHttpServerApi = exports.HttpResponseText = exports.Post = exports.Pre = exports.HttpMethod = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var express = require("express");
var HttpMethod;
(function (HttpMethod) {
    HttpMethod[HttpMethod["NONE"] = 0] = "NONE";
    HttpMethod[HttpMethod["GET"] = 1] = "GET";
    HttpMethod[HttpMethod["POST"] = 2] = "POST";
    HttpMethod[HttpMethod["PUT"] = 3] = "PUT";
    HttpMethod[HttpMethod["PATCH"] = 4] = "PATCH";
    HttpMethod[HttpMethod["DELETE"] = 5] = "DELETE";
    HttpMethod[HttpMethod["OPTIONS"] = 6] = "OPTIONS";
})(HttpMethod = exports.HttpMethod || (exports.HttpMethod = {}));
var Pre;
(function (Pre) {
    Pre["AUTH"] = "AUTH";
    Pre["BASIC"] = "BASIC";
})(Pre = exports.Pre || (exports.Pre = {}));
var Post;
(function (Post) {
    Post["BASIC"] = "BASIC";
})(Post = exports.Post || (exports.Post = {}));
var HttpResponseText;
(function (HttpResponseText) {
    HttpResponseText["UNAUTHORIZED"] = "UNAUTHORIZED";
})(HttpResponseText = exports.HttpResponseText || (exports.HttpResponseText = {}));
var GanymedeHttpServerApi = /** @class */ (function () {
    function GanymedeHttpServerApi() {
        this.path = '';
        this.method = HttpMethod.GET;
    }
    return GanymedeHttpServerApi;
}());
exports.GanymedeHttpServerApi = GanymedeHttpServerApi;
var GanymedeHttpServer = /** @class */ (function () {
    function GanymedeHttpServer(type, globalConf) {
        if (!type) {
            type = 'express';
        }
        this.type = type;
        this.globalConf = globalConf;
        this.preHandler = new GanymedePreHandler();
        this.postHandler = new GanymedePostHandler();
        this.setBaseLayer();
    }
    GanymedeHttpServer.prototype.setBaseLayer = function () {
        switch (this.type) {
            case 'express':
                this.baseApp = express();
                var secOptions_1 = this.globalConf.http.securityHeaders;
                if (secOptions_1.profile === 'allow-all') {
                    this.baseApp.use(function (req, res, next) {
                        if (req.method === 'OPTIONS') {
                            if (secOptions_1.allowRequestOrigin) {
                                res.header('Access-Control-Allow-Origin', secOptions_1.allowRequestOrigin);
                            }
                            if (secOptions_1.allowRequestHeaders) {
                                res.header('Access-Control-Allow-Headers', secOptions_1.allowRequestOrigin);
                            }
                            res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                            return res.end();
                        }
                        next();
                    });
                }
                break;
        }
    };
    GanymedeHttpServer.prototype.setFinalLayer = function () {
        switch (this.type) {
            case 'express':
                // TODO
                break;
        }
    };
    GanymedeHttpServer.prototype.register = function (api) {
        var _this = this;
        switch (this.type) {
            case 'express':
                switch (api.method) {
                    case HttpMethod.GET:
                        this.baseApp.get(api.path, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, q, r, a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = this.newQR(req, res), q = _a.q, r = _a.r;
                                        a = { api: api, q: q, r: r, req: req, res: res };
                                        return [4 /*yield*/, this.handlePre(a)];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, api.handler(q, r, a)];
                                    case 2:
                                        _b.sent();
                                        return [4 /*yield*/, this.handlePost(a)];
                                    case 3:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        break;
                    case HttpMethod.POST:
                        this.baseApp.post(api.path, function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, q, r, a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _a = this.newQR(req, res), q = _a.q, r = _a.r;
                                        a = { api: api, q: q, r: r, req: req, res: res };
                                        return [4 /*yield*/, this.handlePre(a)];
                                    case 1:
                                        _b.sent();
                                        return [4 /*yield*/, api.handler(q, r, a)];
                                    case 2:
                                        _b.sent();
                                        return [4 /*yield*/, this.handlePost(a)];
                                    case 3:
                                        _b.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        break;
                }
                break;
        }
    };
    GanymedeHttpServer.prototype.start = function (options) {
        switch (this.type) {
            case 'express':
                this.baseApp.listen(options.port);
                break;
        }
        return true;
    };
    GanymedeHttpServer.prototype.newQR = function (req, res) {
        return { q: new GanymedeHttpRequest(req, res), r: new GanymedeHttpResponse(req, res) };
    };
    GanymedeHttpServer.prototype.handlePre = function (a) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, preType, preFunc, passed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!a.api.pre) return [3 /*break*/, 4];
                        _i = 0, _a = a.api.pre;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        preType = _a[_i];
                        preFunc = this.preHandler.byType[preType];
                        if (!preFunc) {
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, preFunc(a)];
                    case 2:
                        passed = _b.sent();
                        if (!passed) {
                            return [3 /*break*/, 4];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    GanymedeHttpServer.prototype.handlePost = function (a) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, postType, postFunc, passed;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!a.api.post) return [3 /*break*/, 4];
                        _i = 0, _a = a.api.post;
                        _b.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 4];
                        postType = _a[_i];
                        postFunc = this.postHandler.byType[postType];
                        if (!postFunc) {
                            return [3 /*break*/, 3];
                        }
                        return [4 /*yield*/, postFunc(a)];
                    case 2:
                        passed = _b.sent();
                        if (!passed) {
                            return [3 /*break*/, 4];
                        }
                        _b.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    return GanymedeHttpServer;
}());
exports.GanymedeHttpServer = GanymedeHttpServer;
var GanymedeHttpRequest = /** @class */ (function () {
    function GanymedeHttpRequest(oriReq, oriRes) {
        this.body = null;
        this.bodyRaw = null;
        this.oriReq = oriReq;
        this.oriRes = oriRes;
    }
    return GanymedeHttpRequest;
}());
exports.GanymedeHttpRequest = GanymedeHttpRequest;
var GanymedeHttpResponse = /** @class */ (function () {
    function GanymedeHttpResponse(oriReq, oriRes) {
        this.oriReq = oriReq;
        this.oriRes = oriRes;
    }
    GanymedeHttpResponse.prototype.send = function (payload) {
        return this.oriRes.send(payload);
    };
    GanymedeHttpResponse.prototype.end = function (payload) {
        return this.oriRes.send(payload);
    };
    GanymedeHttpResponse.prototype.status = function (num) {
        return this.oriRes.status(num);
    };
    GanymedeHttpResponse.prototype.okJson = function (obj) {
        return this.oriRes.end(JSON.stringify({ status: 'ok', data: obj }));
    };
    return GanymedeHttpResponse;
}());
exports.GanymedeHttpResponse = GanymedeHttpResponse;
var GanymedePreHandler = /** @class */ (function () {
    function GanymedePreHandler() {
        var _a;
        this.byType = {};
        this.byType = (_a = {},
            _a[Pre.BASIC] = this.basic,
            _a);
    }
    GanymedePreHandler.prototype.auth = function (a) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        var authData = a.req.headers['Authorization'];
                        if (!authData) {
                            if (authData.startsWith('Bearer ')) { // bearer token scheme
                            }
                            else if (authData.startsWith('Signed ')) { // signature scheme
                            }
                        }
                        else {
                            a.res.status(401).end(HttpResponseText.UNAUTHORIZED);
                            resolve(false);
                        }
                    })];
            });
        });
    };
    GanymedePreHandler.prototype.basic = function (a) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        a.res.header('Access-Control-Allow-Origin', '*');
                        a.res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                        var errored = false;
                        var chunks = [];
                        a.req.on('data', function (chunk) {
                            chunks.push(chunk);
                        });
                        a.req.on('end', function () {
                            a.q.params = a.req.params;
                            a.q.bodyRaw = Buffer.concat(chunks);
                            a.q.body = a.q.bodyRaw.toString();
                            if ((a.q.body.startsWith('{') && a.q.body.endsWith('}')) || (a.q.body.startsWith('[') && a.q.body.endsWith(']'))) {
                                try {
                                    a.q.data = JSON.parse(a.q.body);
                                }
                                catch (e) { }
                            }
                            resolve(true);
                        });
                        a.req.on('error', function (_) { errored = true; resolve(false); });
                    })];
            });
        });
    };
    return GanymedePreHandler;
}());
exports.GanymedePreHandler = GanymedePreHandler;
var GanymedePostHandler = /** @class */ (function () {
    function GanymedePostHandler() {
        this.byType = {};
        this.byType = {
        // [Post.BASIC]: this.basic,
        };
    }
    GanymedePostHandler.prototype.basic = function (a) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    return GanymedePostHandler;
}());
exports.GanymedePostHandler = GanymedePostHandler;
