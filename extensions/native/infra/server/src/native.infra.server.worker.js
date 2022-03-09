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
exports.ExtInfraWorkerLogic = exports.ExtInfraWorkerClient = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var vsphere_infra_1 = require("vsphere-infra");
var async_worker_proc_1 = require("../../../../../components/util/server/async.worker.proc");
var process_resource_1 = require("../../../../../server/src/util/process.resource");
var ExtInfraWorkerClient = /** @class */ (function (_super) {
    __extends(ExtInfraWorkerClient, _super);
    function ExtInfraWorkerClient(workerData) {
        return _super.call(this, workerData, ExtInfraWorkerClient.workerFile) || this;
    }
    ExtInfraWorkerClient.prototype.processResourceSnapshot = function () { return this.call("processResourceSnapshot", '', function (r) { return JSON.parse(r); }); };
    ExtInfraWorkerClient.prototype.inventoryChangedLast = function () { return this.call("inventoryChangedLast", '', function (response) { return parseInt(response, 10); }); };
    ExtInfraWorkerClient.prototype.inventorySerialized = function () { return this.call("inventorySerialized"); };
    ExtInfraWorkerClient.prototype.u9nChangedLast = function () { return this.call("u9nChangedLast", '', function (response) { return parseInt(response, 10); }); };
    ExtInfraWorkerClient.prototype.u9nSerialized = function () { return this.call("u9nSerialized"); };
    ExtInfraWorkerClient.prototype.getEntities = function (entityKeys) { return this.call("getEntities", JSON.stringify(entityKeys)); };
    ExtInfraWorkerClient.prototype.failureHeat = function () { return this.call("failureHeat", '', function (r) { return JSON.parse(r); }); };
    ExtInfraWorkerClient.workerFile = __filename;
    return ExtInfraWorkerClient;
}(async_worker_proc_1.AsyncWorkerClient));
exports.ExtInfraWorkerClient = ExtInfraWorkerClient;
var thisWorkerClass = ExtInfraWorkerClient;
var ExtInfraWorkerLogic = /** @class */ (function (_super) {
    __extends(ExtInfraWorkerLogic, _super);
    function ExtInfraWorkerLogic(workerData) {
        var _this = _super.call(this, workerData) || this;
        vsphere_infra_1.VsphereInfra.grant();
        var vinfra = new vsphere_infra_1.VsphereInfra(_this.mainScope);
        vinfra.behavior.setVerbose(true);
        // vinfra.behavior.setJsonLogs(true);
        vinfra.getDatacenter(workerData).then(function (vc) {
            _this.vcenter = vc;
            _this.vcenter.updateInventoryInterval(60);
            _this.setAsReady();
        });
        return _this;
    }
    ExtInfraWorkerLogic.prototype.handleAction = function (callId, action, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.vcenter) {
                            return [2 /*return*/, this.returnCall(callId)];
                        }
                        _a = action;
                        switch (_a) {
                            case 'processResourceSnapshot': return [3 /*break*/, 1];
                            case 'inventoryChangedLast': return [3 /*break*/, 2];
                            case 'inventorySerialized': return [3 /*break*/, 3];
                            case 'u9nChangedLast': return [3 /*break*/, 4];
                            case 'u9nSerialized': return [3 /*break*/, 5];
                            case 'getEntities': return [3 /*break*/, 6];
                            case 'failureHeat': return [3 /*break*/, 8];
                        }
                        return [3 /*break*/, 9];
                    case 1: return [2 /*return*/, this.returnCall(callId, JSON.stringify((0, process_resource_1.getProcessResourceSnapshot)()))];
                    case 2: return [2 /*return*/, this.returnCall(callId, this.vcenter.inventoryChangedLast + '')];
                    case 3: return [2 /*return*/, this.returnCall(callId, this.vcenter.inventorySerialized)];
                    case 4: return [2 /*return*/, this.returnCall(callId, this.vcenter.u9n ? this.vcenter.u9n.t + '' : '-1')];
                    case 5: return [2 /*return*/, this.returnCall(callId, this.vcenter.u9nSerialized)];
                    case 6:
                        _b = this.returnCall;
                        _c = [callId];
                        return [4 /*yield*/, this.getEntities(JSON.parse(payload))];
                    case 7: return [2 /*return*/, _b.apply(this, _c.concat([_d.sent()]))];
                    case 8: return [2 /*return*/, this.returnCall(callId, JSON.stringify({
                            error: this.vcenter.ixReconn.errorHeat.value,
                            defunct: this.vcenter.ixReconn.defunctHeat.value
                        }))];
                    case 9: return [2 /*return*/];
                }
            });
        });
    };
    ExtInfraWorkerLogic.prototype.getEntities = function (entityKeys) {
        return __awaiter(this, void 0, void 0, function () {
            var entities, _i, entities_1, entity, entitiesObjects;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.vcenter.getMany(entityKeys)];
                    case 1:
                        entities = _a.sent();
                        _i = 0, entities_1 = entities;
                        _a.label = 2;
                    case 2:
                        if (!(_i < entities_1.length)) return [3 /*break*/, 5];
                        entity = entities_1[_i];
                        return [4 /*yield*/, entity.refresh()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, Promise.all(entities.map(function (entity) { return __awaiter(_this, void 0, void 0, function () {
                            var obj, host;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        obj = JSON.parse(entity.serialize());
                                        obj.rawSource = entity.getSourceData();
                                        if (!(entity.$type === 'VirtualMachine')) return [3 /*break*/, 2];
                                        return [4 /*yield*/, this.vcenter.getMany([entity.runtime.host])];
                                    case 1:
                                        host = (_a.sent())[0];
                                        obj.cpuHz = host.hardware.cpuInfo.hz;
                                        _a.label = 2;
                                    case 2: return [2 /*return*/, obj];
                                }
                            });
                        }); }))];
                    case 6:
                        entitiesObjects = _a.sent();
                        return [2 /*return*/, JSON.stringify(entitiesObjects)];
                }
            });
        });
    };
    return ExtInfraWorkerLogic;
}(async_worker_proc_1.AsyncWorkerExecutor));
exports.ExtInfraWorkerLogic = ExtInfraWorkerLogic;
if (process.env.WORKER_DATA_BASE64) {
    var workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
    if (workerData.workerFile === thisWorkerClass.workerFile) {
        new ExtInfraWorkerLogic(workerData).getSelf();
    }
}
