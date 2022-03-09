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
exports.NativeInfraExtensionServer = void 0;
var http_shim_1 = require("../../../../../server/src/http.shim");
var secrets_resolver_1 = require("../../../../../components/util/server/secrets.resolver");
var logger_1 = require("../../../../../components/util/shared/logger");
var native_infra_server_worker_1 = require("./native.infra.server.worker");
var scopeName = "ext-infra;pid=".concat(process.pid);
var NativeInfraExtensionServer = /** @class */ (function (_super) {
    __extends(NativeInfraExtensionServer, _super);
    function NativeInfraExtensionServer(extData, globalConfData) {
        var _this = _super.call(this, { type: http_shim_1.HttpBaseLib.EXPRESS }, globalConfData) || this;
        _this.vcenters = {};
        _this.vcentersDefunct = {};
        _this.cache = {
            inventoryData: _this.cacheDefine({ path: "native.infra.inventoryData" }),
            allObjects: _this.cacheDefine({ path: "native.infra.allObjects/:key", matchExactly: true }),
            quickStats: _this.cacheDefine({ path: "native.infra.quickStats/:key", matchExactly: true }),
        };
        _this.extData = extData;
        _this.apiVersion = 'v1';
        _this.apiPath = "".concat(_this.configGlobal.ext.basePath, "/native/infra");
        _this.addDefaultProcessor(http_shim_1.ReqProcessor.BASIC);
        _this.enumerateVCenters();
        return _this;
    }
    NativeInfraExtensionServer.prototype.enumerateVCenters = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, invData, inv, _b, _c, workerData;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.extData.inventory.vcenter) {
                            return [2 /*return*/];
                        }
                        if (!(this.extData.inventory.vcenter.type === 'fixed')) return [3 /*break*/, 8];
                        _i = 0, _a = this.extData.inventory.vcenter.list;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 8];
                        invData = _a[_i];
                        inv = JSON.parse(JSON.stringify(invData));
                        if (!(inv.type === 'aws')) return [3 /*break*/, 2];
                        return [3 /*break*/, 7];
                    case 2:
                        if (!(inv.type === 'gcp')) return [3 /*break*/, 3];
                        return [3 /*break*/, 7];
                    case 3:
                        if (!(inv.type === 'azure')) return [3 /*break*/, 4];
                        return [3 /*break*/, 7];
                    case 4:
                        if (!(inv.type === 'vcenter')) return [3 /*break*/, 7];
                        // continue;
                        _b = inv;
                        return [4 /*yield*/, secrets_resolver_1.secrets.resolve(inv.username)];
                    case 5:
                        // continue;
                        _b.username = _d.sent();
                        _c = inv;
                        return [4 /*yield*/, secrets_resolver_1.secrets.resolve(inv.password)];
                    case 6:
                        _c.password = _d.sent();
                        if (!inv.username || !inv.password) {
                            console.log("Failed to resolve credentials for '".concat(inv.key, "'"));
                            return [3 /*break*/, 7];
                        }
                        inv.watch = true;
                        workerData = __assign(__assign({ workerFile: native_infra_server_worker_1.ExtInfraWorkerClient.workerFile }, inv), { scopeName: scopeName });
                        if (!inv.defunct) {
                            this.vcenters[inv.key] = this.addWorker(native_infra_server_worker_1.ExtInfraWorkerClient, workerData);
                        }
                        else {
                            this.vcentersDefunct[inv.key] = {
                                deprecated: inv.deprecated ? true : false,
                                defunct: inv.defunct ? true : false,
                            };
                        }
                        _d.label = 7;
                    case 7:
                        _i++;
                        return [3 /*break*/, 1];
                    case 8:
                        logger_1.log.info('Ganymede native.infra extension initialized.');
                        return [2 /*return*/];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.beforeStart = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                logger_1.log.info('Ganymede native.infra extension server started.');
                return [2 /*return*/];
            });
        });
    };
    NativeInfraExtensionServer.prototype.getInventory = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                op.cache.handler(this.cache.inventoryData, {}, function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        resolve(this.extData.inventory);
                        return [2 /*return*/];
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    NativeInfraExtensionServer.prototype.getAllObjects = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var vc, cacheAccess;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getVCenterByKey(op)];
                    case 1:
                        vc = _b.sent();
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        _a = {};
                        return [4 /*yield*/, vc.inventoryChangedLast()];
                    case 2:
                        cacheAccess = (_a.version = _b.sent(), _a.matchExactly = true, _a);
                        op.cache.handler(this.cache.allObjects, cacheAccess, function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var inventorySerialized;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, vc.inventorySerialized()];
                                    case 1:
                                        inventorySerialized = _a.sent();
                                        if (!inventorySerialized) {
                                            return [2 /*return*/, op.endWithError(500, "NOT_READY_INV", "[".concat(op.req.params.key, "] utilization summary not ready yet"))];
                                        }
                                        resolve(JSON.parse(inventorySerialized));
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.getQuickStats = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var vc, cacheAccess;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, this.getVCenterByKey(op)];
                    case 1:
                        vc = _b.sent();
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        _a = {};
                        return [4 /*yield*/, vc.u9nChangedLast()];
                    case 2:
                        cacheAccess = (_a.version = _b.sent(), _a.matchExactly = true, _a);
                        if (cacheAccess.version < 0) {
                            return [2 /*return*/, op.endWithError(500, "NOT_READY_UTIL_SUMMARY", "[".concat(op.req.params.key, "] utilization summary not ready yet"))];
                        }
                        op.cache.handler(this.cache.quickStats, cacheAccess, function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0:
                                        _a = resolve;
                                        _c = (_b = JSON).parse;
                                        return [4 /*yield*/, vc.u9nSerialized()];
                                    case 1:
                                        _a.apply(void 0, [_c.apply(_b, [_d.sent()])]);
                                        return [2 /*return*/];
                                }
                            });
                        }); });
                        return [2 /*return*/];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.getWatcherResource = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var vc, processResourceSnapshot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVCenterByKey(op)];
                    case 1:
                        vc = _a.sent();
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        return [4 /*yield*/, vc.processResourceSnapshot()];
                    case 2:
                        processResourceSnapshot = _a.sent();
                        return [2 /*return*/, op.res.returnJson(processResourceSnapshot)];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.getWatcherFailureHeat = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var vc, heatData;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getVCenterByKey(op)];
                    case 1:
                        vc = _a.sent();
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        return [4 /*yield*/, vc.failureHeat()];
                    case 2:
                        heatData = _a.sent();
                        return [2 /*return*/, op.res.returnJson(heatData)];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.getEntities = function (op) {
        return __awaiter(this, void 0, void 0, function () {
            var guid, entityKey, vcKey, vc, entitiesSerialized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        guid = op.req.params.key;
                        entityKey = guid.split(':').pop();
                        vcKey = guid.split(':')[1];
                        return [4 /*yield*/, this.getVCenterByKey(op, vcKey)];
                    case 1:
                        vc = _a.sent();
                        if (op.error) {
                            return [2 /*return*/, op.endWithError()];
                        }
                        return [4 /*yield*/, vc.getEntities([entityKey])];
                    case 2:
                        entitiesSerialized = _a.sent();
                        return [2 /*return*/, op.res.returnJson(JSON.parse(entitiesSerialized)[0])];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.getVCenterByKey = function (op, key) {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var vc;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!key) {
                            key = (_a = op.req.params) === null || _a === void 0 ? void 0 : _a.key;
                        }
                        if (!key) {
                            return [2 /*return*/, op.raise(http_shim_1.HttpCode.BAD_REQUEST, "PATH_PARAM_NOT_FOUND", "'".concat(key, "' path parameter not defined."))];
                        }
                        if (this.vcentersDefunct[key]) {
                            return [2 /*return*/, op.raise(http_shim_1.HttpCode.BAD_REQUEST, "VCENTER_DEFUNCT", "[".concat(key, "] vCenter is defunct"))];
                        }
                        vc = this.vcenters[key];
                        if (!(vc && vc.then)) return [3 /*break*/, 2];
                        return [4 /*yield*/, vc];
                    case 1:
                        vc = _b.sent();
                        _b.label = 2;
                    case 2:
                        if (!vc) {
                            return [2 /*return*/, op.raise(http_shim_1.HttpCode.BAD_REQUEST, "NO_VCENTER_KEY", "[".concat(key, "] cannot find vCenter by key ").concat(key))];
                        }
                        return [2 /*return*/, vc];
                }
            });
        });
    };
    __decorate([
        http_shim_1.HTTP.GET("/inventory")
    ], NativeInfraExtensionServer.prototype, "getInventory", null);
    __decorate([
        http_shim_1.HTTP.GET("/vcenter/:key/all-objects")
    ], NativeInfraExtensionServer.prototype, "getAllObjects", null);
    __decorate([
        http_shim_1.HTTP.GET("/vcenter/:key/quick-stats")
    ], NativeInfraExtensionServer.prototype, "getQuickStats", null);
    __decorate([
        http_shim_1.HTTP.GET("/vcenter/:key/watcher-resource")
    ], NativeInfraExtensionServer.prototype, "getWatcherResource", null);
    __decorate([
        http_shim_1.HTTP.GET("/vcenter/:key/watcher-failure-heat")
    ], NativeInfraExtensionServer.prototype, "getWatcherFailureHeat", null);
    __decorate([
        http_shim_1.HTTP.GET("/vcenter/:key/managed-object")
    ], NativeInfraExtensionServer.prototype, "getEntities", null);
    return NativeInfraExtensionServer;
}(http_shim_1.GanymedeHttpServer));
exports.NativeInfraExtensionServer = NativeInfraExtensionServer;
