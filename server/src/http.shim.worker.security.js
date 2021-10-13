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
exports.SecureChannelWorkerLogic = exports.SecureChannelWorkerClient = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var async_worker_proc_1 = require("../../components/util/server/async.worker.proc");
var secure_channel_1 = require("../../components/util/shared/crypto/secure.channel");
var fourq_1 = require("@jovian/fourq");
var thisWorkerFile = __dirname + "/http.shim.worker.security.js";
var SecureChannelWorkerClient = /** @class */ (function (_super) {
    __extends(SecureChannelWorkerClient, _super);
    function SecureChannelWorkerClient(workerData) {
        return _super.call(this, workerData, SecureChannelWorkerClient.workerFile) || this;
    }
    SecureChannelWorkerClient.prototype.signMessage = function (msgBase64) { return this.call("signMessage", msgBase64, function (r) { return r; }); };
    SecureChannelWorkerClient.prototype.newChannel = function (peerInfo) {
        var peerInfoEncoded = JSON.stringify({
            ecdhPublicKey: peerInfo.ecdhPublicKey.toString('base64'),
            iden: peerInfo.iden,
            data: peerInfo.data,
        });
        return this.call("newChannel", peerInfoEncoded, function (r) { return secure_channel_1.SecureChannel.fromJSON(r); });
    };
    SecureChannelWorkerClient.workerFile = thisWorkerFile;
    return SecureChannelWorkerClient;
}(async_worker_proc_1.AsyncWorkerClient));
exports.SecureChannelWorkerClient = SecureChannelWorkerClient;
var SecureChannelWorkerLogic = /** @class */ (function (_super) {
    __extends(SecureChannelWorkerLogic, _super);
    function SecureChannelWorkerLogic(workerData) {
        var _this = _super.call(this, workerData) || this;
        _this.signingKey = Buffer.from(workerData.signingKey, 'base64');
        _this.setAsReady();
        return _this;
    }
    SecureChannelWorkerLogic.prototype.handleAction = function (callId, action, payload) {
        switch (action) {
            case 'signMessage':
                var sig = fourq_1.FourQ.sign(Buffer.from(payload, 'base64'), this.signingKey);
                return this.returnCall(callId, sig.data.toString('base64'));
            case 'newChannel':
                var peerInfo = JSON.parse(payload);
                peerInfo.ecdhPublicKey = Buffer.from(peerInfo.ecdhPublicKey, 'base64');
                var channel = new secure_channel_1.SecureChannel(peerInfo.type, 'generate', JSON.parse(payload));
                return this.returnCall(callId, channel.toJSON());
        }
    };
    return SecureChannelWorkerLogic;
}(async_worker_proc_1.AsyncWorkerExecutor));
exports.SecureChannelWorkerLogic = SecureChannelWorkerLogic;
if (process.env.WORKER_DATA_BASE64) {
    var workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
    if (workerData.workerFile === thisWorkerFile) {
        new SecureChannelWorkerLogic(workerData).getSelf();
    }
}
