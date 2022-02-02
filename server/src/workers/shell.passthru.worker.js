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
exports.ShellPassthruWorkerLogic = exports.ShellPassthruWorkerClient = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var async_worker_proc_1 = require("../../../components/util/server/async.worker.proc");
var os = require("os");
var yargs = require('yargs/yargs');
var hideBin = require('yargs/helpers').hideBin;
var pty = require('node-pty');
// const keypress = require('keypress');
var thisWorkerFile = __filename;
var ShellPassthruWorkerClient = /** @class */ (function (_super) {
    __extends(ShellPassthruWorkerClient, _super);
    function ShellPassthruWorkerClient(workerData) {
        var _this = _super.call(this, workerData, ShellPassthruWorkerClient.workerFile) || this;
        _this.setHandler('$outputData', function (message) {
            _this.ixRx('output').next(message);
        });
        _this.setHandler('$sessionClose', function () {
            _this.ixRx('sessionClose').next(null);
        });
        return _this;
    }
    Object.defineProperty(ShellPassthruWorkerClient.prototype, "output$", {
        get: function () { return this.ixRx('output').obs(); },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(ShellPassthruWorkerClient.prototype, "close$", {
        get: function () { return this.ixRx('sessionClose').obs(); },
        enumerable: false,
        configurable: true
    });
    ShellPassthruWorkerClient.prototype.resize = function (col, row) {
        return this.call("resize", JSON.stringify({ col: col, row: row }));
    };
    ShellPassthruWorkerClient.prototype.inputData = function (input) { return this.call("inputData", input, function (r) { return r; }); };
    ShellPassthruWorkerClient.workerFile = thisWorkerFile;
    return ShellPassthruWorkerClient;
}(async_worker_proc_1.AsyncWorkerClient));
exports.ShellPassthruWorkerClient = ShellPassthruWorkerClient;
var ShellPassthruWorkerLogic = /** @class */ (function (_super) {
    __extends(ShellPassthruWorkerLogic, _super);
    function ShellPassthruWorkerLogic(workerData) {
        var _this = _super.call(this, workerData) || this;
        _this.setUpShellPassthru();
        _this.setAsReady();
        return _this;
    }
    ShellPassthruWorkerLogic.prototype.setUpShellPassthru = function () {
        var _this = this;
        // const argv = yargs(hideBin(process.argv)).argv;
        var shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
        var exited = false;
        this.ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cols: process.stdout.columns,
            rows: process.stdout.rows,
            cwd: process.env.HOME,
            env: process.env
        });
        this.ptyProcess.on('data', function (data) {
            if (exited) {
                return;
            }
            _this.returnCall('$outputData', data);
        });
        this.ptyProcess.on('close', function () {
            _this.returnCall('$sessionClose');
            exited = true;
        });
    };
    ShellPassthruWorkerLogic.prototype.outputData = function (data) {
        this.returnCall('$outputData', data);
    };
    ShellPassthruWorkerLogic.prototype.handleAction = function (callId, action, payload) {
        switch (action) {
            case 'inputData':
                this.ptyProcess.write(Buffer.from(payload, 'base64'));
                this.returnCall(callId, 'ACK');
                break;
            case 'resize':
                var spec = JSON.parse(payload);
                this.ptyProcess.resize(spec.col, spec.row);
                this.returnCall(callId, 'ACK');
                break;
        }
    };
    return ShellPassthruWorkerLogic;
}(async_worker_proc_1.AsyncWorkerExecutor));
exports.ShellPassthruWorkerLogic = ShellPassthruWorkerLogic;
(0, async_worker_proc_1.startWorker)(thisWorkerFile, ShellPassthruWorkerLogic);
