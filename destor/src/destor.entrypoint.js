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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mainDestor = exports.DestorInstance = exports.trustInfo = exports.rootAccessToken = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var fs = require("fs");
var http_shim_1 = require("../../server/src/http.shim");
// import { DestorWorkerClient } from './destor.worker';
var scopeName = "destor;pid=" + process.pid;
var conf = fs.existsSync('config/ganymede.secrets.json') ?
    JSON.parse(fs.readFileSync('config/ganymede.secrets.json', 'utf8'))
    : JSON.parse(fs.readFileSync('ganymede.secrets.json', 'utf8'));
var destorData = conf.destor;
var sharedSecrets = conf.secret;
var envSpecificSecrets = conf.envSpecificSecret;
var authData = destorData === null || destorData === void 0 ? void 0 : destorData.auth;
exports.rootAccessToken = authData.tokenRoot;
exports.trustInfo = authData.trust;
var testAuthTopology = {
    type: 'endpoints',
    endpoints: [
        { endpoint: 'destor-endpoint', token: exports.rootAccessToken, trust: exports.trustInfo },
        { endpoint: 'http://host.docker.internal:17070', token: exports.rootAccessToken, trust: exports.trustInfo },
        { endpoint: 'http://localhost:17070', token: exports.rootAccessToken, trust: exports.trustInfo },
    ]
};
// DESTOR: Dynamically evoloving service topology orchestration resource
var DestorInstance = /** @class */ (function (_super) {
    __extends(DestorInstance, _super);
    function DestorInstance() {
        var _this = _super.call(this, {
            type: http_shim_1.HttpBaseLib.EXPRESS,
            scopeName: scopeName,
            security: {
                accessor: { required: true, baseToken: authData.tokenRoot },
                secureChannel: { enabled: true, required: true, signingKey: authData.key },
            },
            startOptions: { port: 17070 },
        }) || this;
        _this.authTopology = {
            dev: testAuthTopology,
            stg: testAuthTopology,
            prod: testAuthTopology,
        };
        _this.authTopologyCached = {
            dev: JSON.stringify(_this.authTopology.dev),
            stg: JSON.stringify(_this.authTopology.stg),
            prod: JSON.stringify(_this.authTopology.prod),
        };
        _this.apiVersion = 'v1';
        _this.apiPath = _this.configGlobal.destor.basePath;
        _this.addDefaultProcessor(http_shim_1.ReqProcessor.BASIC);
        return _this;
    }
    DestorInstance.prototype.rootProofOfAuthenticity = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var stamp;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.checkAccessor(op);
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        return [4 /*yield*/, this.stamp()];
                    case 1:
                        stamp = _a.sent();
                        return [2 /*return*/, op.res.returnJson(__assign({}, stamp))];
                }
            });
        });
    };
    DestorInstance.prototype.secretResolve = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var requestedPath, env, secret;
            return __generator(this, function (_a) {
                requestedPath = JSON.parse(JSON.stringify(op.req.params.path));
                requestedPath.shift(); // remove first '<secret.'
                env = op.req.params.env;
                secret = null;
                if (envSpecificSecrets[env]) {
                    secret = this.resolveSecretFromStore(requestedPath, envSpecificSecrets[env]);
                    if (secret !== null) {
                        return [2 /*return*/, op.res.returnJson({ value: secret })];
                    }
                }
                secret = this.resolveSecretFromStore(requestedPath, sharedSecrets);
                if (secret !== null) {
                    return [2 /*return*/, op.res.returnJson({ value: secret })];
                }
                return [2 /*return*/, op.endWithError(http_shim_1.HttpCode.NOT_FOUND, "SECRET_NOT_FOUND", "Cannot find " + op.req.params.path.join('.') + " (env=" + env + ")")];
            });
        });
    };
    DestorInstance.prototype.authServerResolve = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/];
            });
        });
    };
    DestorInstance.prototype.resolveSecretFromStore = function (secretPath, store) {
        var at = store;
        for (var _i = 0, secretPath_1 = secretPath; _i < secretPath_1.length; _i++) {
            var pathname = secretPath_1[_i];
            at = at[pathname];
            if (at === undefined) {
                break;
            }
        }
        if (at === undefined) {
            return null;
        }
        return at;
    };
    __decorate([
        http_shim_1.HTTP.GET("/", { rootMount: true })
    ], DestorInstance.prototype, "rootProofOfAuthenticity", null);
    __decorate([
        http_shim_1.HTTP.GET("/secret-resolve/:env")
    ], DestorInstance.prototype, "secretResolve", null);
    __decorate([
        http_shim_1.HTTP.GET("/auth-server/:env")
    ], DestorInstance.prototype, "authServerResolve", null);
    return DestorInstance;
}(http_shim_1.GanymedeHttpServer));
exports.DestorInstance = DestorInstance;
exports.mainDestor = new DestorInstance();
exports.mainDestor.start();
