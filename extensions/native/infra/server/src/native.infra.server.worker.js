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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtInfraWorkerLogic = exports.ExtInfraWorkerClient = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var vsphere_infra_1 = require("vsphere-infra");
var async_worker_proc_1 = require("../../../../../components/util/server/async.worker.proc");
var process_resource_1 = require("../../../../../server/src/util/process.resource");
var thisWorkerFile = __dirname + "/native.infra.server.worker.js";
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
    ExtInfraWorkerClient.prototype.failureHeat = function () { return this.call("failureHeat", '', function (r) { return JSON.parse(r); }); };
    ExtInfraWorkerClient.workerFile = thisWorkerFile;
    return ExtInfraWorkerClient;
}(async_worker_proc_1.AsyncWorkerClient));
exports.ExtInfraWorkerClient = ExtInfraWorkerClient;
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
        if (!this.vcenter) {
            return this.returnCall(callId);
        }
        switch (action) {
            case 'processResourceSnapshot': return this.returnCall(callId, JSON.stringify((0, process_resource_1.getProcessResourceSnapshot)()));
            case 'inventoryChangedLast': return this.returnCall(callId, this.vcenter.inventoryChangedLast + '');
            case 'inventorySerialized': return this.returnCall(callId, this.vcenter.inventorySerialized);
            case 'u9nChangedLast': return this.returnCall(callId, this.vcenter.u9n ? this.vcenter.u9n.t + '' : '-1');
            case 'u9nSerialized': return this.returnCall(callId, this.vcenter.u9nSerialized);
            case 'failureHeat': return this.returnCall(callId, JSON.stringify({
                error: this.vcenter.ixReconn.errorHeat.value,
                defunct: this.vcenter.ixReconn.defunctHeat.value
            }));
        }
    };
    return ExtInfraWorkerLogic;
}(async_worker_proc_1.AsyncWorkerExecutor));
exports.ExtInfraWorkerLogic = ExtInfraWorkerLogic;
if (process.env.WORKER_DATA_BASE64) {
    var workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
    if (workerData.workerFile === thisWorkerFile) {
        new ExtInfraWorkerLogic(workerData).getSelf();
    }
}
