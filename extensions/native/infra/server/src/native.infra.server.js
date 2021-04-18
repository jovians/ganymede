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
exports.NativeInfraExtensionServer = void 0;
var http_shim_1 = require("../../../../../server/src/http.shim");
var vsphere_infra_1 = require("vsphere-infra");
var unit_utils_1 = require("../../../../../components/util/unit.utils");
var secrets_resolver_1 = require("../../../../../components/util/secrets.resolver");
var logger_1 = require("../../../../../components/util/logger");
var NativeInfraExtensionServer = /** @class */ (function () {
    function NativeInfraExtensionServer() {
        this.iface = 'json';
        this.vsphereDcs = [];
        this.vcenters = {};
    }
    NativeInfraExtensionServer.prototype.start = function (data, globalConfData) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.globalConfData = globalConfData;
                        this.data = data;
                        logger_1.log.info('Ganymede native.infra extension server started.');
                        if (!data) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, this.initialize(true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.initialize = function (andStart) {
        if (andStart === void 0) { andStart = false; }
        return __awaiter(this, void 0, void 0, function () {
            var vinfra, _i, _a, inv, _b, _c, vcProm;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        vsphere_infra_1.VsphereInfra.grant();
                        vinfra = new vsphere_infra_1.VsphereInfra();
                        vinfra.behavior.setVerbose(true);
                        vinfra.behavior.setJsonLogs(true);
                        this.registerApis();
                        if (!this.data.inventory.vcenter) return [3 /*break*/, 5];
                        if (!(this.data.inventory.vcenter.type === 'fixed')) return [3 /*break*/, 5];
                        _i = 0, _a = this.data.inventory.vcenter.list;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        inv = _a[_i];
                        if (!(inv.type === 'vsphere')) return [3 /*break*/, 4];
                        _b = inv;
                        return [4 /*yield*/, secrets_resolver_1.secrets.resolve(inv.username)];
                    case 2:
                        _b.username = _d.sent();
                        _c = inv;
                        return [4 /*yield*/, secrets_resolver_1.secrets.resolve(inv.password)];
                    case 3:
                        _c.password = _d.sent();
                        vcProm = vinfra.getDatacenter(inv);
                        this.vcenters[inv.key] = vcProm;
                        vcProm.then(function (vc) {
                            _this.vcenters[vc.key] = vc;
                            vc.startInventoryWatch();
                        });
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        logger_1.log.info('Ganymede native.infra extension initialized.');
                        if (andStart) {
                            this.app.start({ port: this.data.port });
                            logger_1.log.info("Ganymede native.infra extension listening on " + this.data.port);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    NativeInfraExtensionServer.prototype.registerApis = function () {
        var _this = this;
        this.app = new http_shim_1.GanymedeHttpServer('express', this.globalConfData);
        var basePath = this.globalConfData.ext.basePath;
        var iface = this.iface;
        var extName = 'native/infra';
        var extBasePath = basePath + "/" + iface + "/" + extName;
        this.app.register({
            method: http_shim_1.HttpMethod.GET,
            path: extBasePath + "/vcenter/:key/all-objects-map",
            pre: [http_shim_1.Pre.AUTH, http_shim_1.Pre.BASIC],
            handler: function (q, r) { return __awaiter(_this, void 0, void 0, function () {
                var key, vc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            key = this.getPathParam('key', q, r);
                            if (!key) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.getVCenterByKey(key, r)];
                        case 1:
                            vc = _a.sent();
                            if (!vc) {
                                return [2 /*return*/];
                            }
                            r.okJson({ all: vc.inventory.byGUID });
                            return [2 /*return*/];
                    }
                });
            }); }
        });
        this.app.register({
            method: http_shim_1.HttpMethod.GET,
            path: extBasePath + "/vcenter/:key/quick-stats",
            pre: [http_shim_1.Pre.AUTH, http_shim_1.Pre.BASIC],
            handler: function (q, r) { return __awaiter(_this, void 0, void 0, function () {
                var key, vc, data, _i, _a, clusterId, cluster, _b, _c, hostId, host, _d, _e, dsId, ds, capBytes, freeBytes, usedBytes;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            key = this.getPathParam('key', q, r);
                            if (!key) {
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, this.getVCenterByKey(key, r)];
                        case 1:
                            vc = _f.sent();
                            if (!vc) {
                                return [2 /*return*/];
                            }
                            data = {
                                overview: {
                                    totalCpu: 0, consumedCpu: 0, percentCpu: 0,
                                    totalMem: 0, consumedMem: 0, percentMem: 0,
                                    totalStorage: 0, consumedStorage: 0, percentStorage: 0
                                },
                                clusterSummary: null,
                                hostStats: [],
                                storageStats: []
                            };
                            for (_i = 0, _a = Object.keys(vc.inventory.computeResource); _i < _a.length; _i++) {
                                clusterId = _a[_i];
                                cluster = vc.inventory.computeResource[clusterId];
                                data.clusterSummary = cluster.summary;
                                if (data.clusterSummary) {
                                    data.overview.totalCpu = parseInt(data.clusterSummary.totalCpu + '', 10) / 1000; // in GHz
                                    data.overview.totalMem = parseInt(data.clusterSummary.totalMemory + '', 10) / unit_utils_1.Unit.GiB; // in GiB
                                }
                                break;
                            }
                            for (_b = 0, _c = Object.keys(vc.inventory.hostSystem); _b < _c.length; _b++) {
                                hostId = _c[_b];
                                host = vc.inventory.hostSystem[hostId];
                                data.overview.consumedCpu += host.summary.quickStats.overallCpuUsage / 1000;
                                data.overview.consumedMem += host.summary.quickStats.overallMemoryUsage / 1024;
                                data.hostStats.push({ iid: hostId, name: host.name, networksCount: host.network.length, stats: host.summary.quickStats });
                            }
                            for (_d = 0, _e = Object.keys(vc.inventory.datastore); _d < _e.length; _d++) {
                                dsId = _e[_d];
                                ds = vc.inventory.datastore[dsId];
                                if (ds.info.containerId === ds.info.aliasOf) {
                                    capBytes = parseInt(ds.summary.capacity, 10);
                                    freeBytes = parseInt(ds.summary.freeSpace, 10);
                                    usedBytes = capBytes - freeBytes;
                                    data.overview.totalStorage += capBytes / unit_utils_1.Unit.GiB;
                                    data.overview.consumedStorage += usedBytes / unit_utils_1.Unit.GiB;
                                }
                                data.storageStats.push({ iid: dsId, name: ds.name, info: ds.info, summary: ds.summary });
                            }
                            data.overview.percentCpu = data.overview.consumedCpu / data.overview.totalCpu * 100;
                            data.overview.percentMem = data.overview.consumedMem / data.overview.totalMem * 100;
                            data.overview.percentStorage = data.overview.consumedStorage / data.overview.totalStorage * 100;
                            r.okJson(data);
                            return [2 /*return*/];
                    }
                });
            }); }
        });
    };
    NativeInfraExtensionServer.prototype.getPathParam = function (name, q, r) {
        var value = q.params[name];
        if (!value) {
            r.status(400).end("'" + value + "' path parameter not defined.");
            return null;
        }
        return value;
    };
    NativeInfraExtensionServer.prototype.getVCenterByKey = function (key, r) {
        return __awaiter(this, void 0, void 0, function () {
            var vc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        vc = this.vcenters[key];
                        if (!(vc && vc.then)) return [3 /*break*/, 2];
                        return [4 /*yield*/, vc];
                    case 1:
                        vc = _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!vc) {
                            r.status(404).end(JSON.stringify({ status: 'not_found', message: "Cannot find vCenter by key: '" + key + "'" }));
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, vc];
                }
            });
        });
    };
    return NativeInfraExtensionServer;
}());
exports.NativeInfraExtensionServer = NativeInfraExtensionServer;
