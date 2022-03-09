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
exports.startWorker = exports.AsyncWorkerExecutor = exports.AsyncWorkerClient = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var child_process_1 = require("child_process");
var type_tools_1 = require("@jovian/type-tools");
var uuid_1 = require("uuid");
var os = require("os");
var logger_1 = require("../shared/logger");
var AsyncWorkerClient = /** @class */ (function (_super) {
    __extends(AsyncWorkerClient, _super);
    function AsyncWorkerClient(workerData, workerFile) {
        var _this = _super.call(this, 'async-worker-client') || this;
        _this.responseFor = '';
        _this.handlerMap = {};
        _this.invokeMap = {};
        _this.initPromise = null;
        _this.terminating = false;
        _this.terminated = false;
        _this.duration = null;
        _this.startTime = Date.now();
        _this.endTime = null;
        _this.onterminate = [];
        if (!workerData) {
            workerData = {};
        }
        _this.initPromise = new Promise(function (resolve) { _this.initResolver = resolve; });
        workerData.workerFile = workerFile;
        _this.workerData = workerData;
        _this.proc = (0, child_process_1.spawn)('node', ['--max-old-space-size=262144', workerFile], {
            stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
            env: __assign(__assign({}, process.env), { WORKER_DATA_BASE64: Buffer.from(JSON.stringify(workerData), 'utf8').toString('base64') })
        });
        _this.addDefaultHandlers();
        _this.proc.on('message', function (messageSerial) {
            var message = messageSerial;
            if (_this.responseFor) {
                _this.handleResponse(_this.responseFor, message);
            }
            else {
                _this.responseFor = message;
            }
        });
        return _this;
    }
    AsyncWorkerClient.nullAction = function () { };
    AsyncWorkerClient.prototype.call = function (action, payload, parser) {
        var _this = this;
        if (payload === void 0) { payload = ''; }
        var callId = "".concat(action, "::").concat((0, uuid_1.v4)());
        return new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.terminating || this.terminated) {
                            return [2 /*return*/, resolve(null)];
                        }
                        if (!payload) {
                            payload = '';
                        }
                        if (!parser) {
                            parser = function (response) { return response; };
                        }
                        return [4 /*yield*/, Promise.resolve(this.initPromise)];
                    case 1:
                        _a.sent();
                        this.invokeMap[callId] = function (response) {
                            try {
                                if (response === '' || response === null) {
                                    resolve(null);
                                }
                                else {
                                    try {
                                        var res = parser(response);
                                        resolve(res !== null ? res : null);
                                    }
                                    catch (e) {
                                        resolve(null);
                                    }
                                }
                            }
                            catch (e) {
                                resolve(null);
                            }
                        };
                        this.proc.send(callId);
                        this.proc.send(payload);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    AsyncWorkerClient.prototype.import = function (scriptFile) {
        return this.call("$__import", scriptFile, function (r) { return r ? true : false; });
    };
    AsyncWorkerClient.prototype.terminate = function (exitCode) {
        if (exitCode === void 0) { exitCode = 0; }
        return this.call('$__terminate', exitCode + '');
    };
    AsyncWorkerClient.prototype.setHandler = function (name, handler) {
        if (!name.startsWith('$')) {
            throw new Error("handler name must start with $");
        }
        this.handlerMap[name] = handler;
    };
    AsyncWorkerClient.prototype.handleResponse = function (callId, message) {
        this.responseFor = '';
        if (callId.startsWith('$')) {
            var hcb = this.handlerMap[callId];
            if (hcb) {
                hcb(message, callId);
                delete this.invokeMap[callId];
            }
            return;
        }
        var cb = this.invokeMap[callId];
        if (cb) {
            cb(message);
            delete this.invokeMap[callId];
        }
    };
    AsyncWorkerClient.prototype.addDefaultHandlers = function () {
        var _this = this;
        this.setHandler('$__init', function (message, name) {
            if (_this.initResolver) {
                _this.initResolver();
            }
            _this.initResolver = _this.initPromise = null;
        });
        this.setHandler('$__termination_set', function (message, name) {
            _this.terminating = true;
            for (var _i = 0, _a = _this.onterminate; _i < _a.length; _i++) {
                var cb2 = _a[_i];
                try {
                    cb2();
                }
                catch (e) { }
            }
        });
        this.setHandler('$__terminated', function (message, name) {
            _this.terminated = true;
            _this.endTime = Date.now();
            _this.duration = _this.endTime - _this.startTime;
        });
    };
    AsyncWorkerClient.logger = logger_1.log;
    return AsyncWorkerClient;
}(type_tools_1.ix.Entity));
exports.AsyncWorkerClient = AsyncWorkerClient;
var AsyncWorkerExecutor = /** @class */ (function (_super) {
    __extends(AsyncWorkerExecutor, _super);
    function AsyncWorkerExecutor(workerData) {
        var _this = _super.call(this, 'async-worker-logic') || this;
        _this.terminating = false;
        _this.data = {};
        _this.requestFor = '';
        _this.invokeMap = {};
        _this.customAction = {};
        process.on('unhandledRejection', function (e) {
            // tslint:disable-next-line: no-console
            console.warn('[WARNING] UnhandledRejection:', e);
        });
        _this.workerData = workerData;
        process.on('message', function (messageSerial) { return __awaiter(_this, void 0, void 0, function () {
            var message;
            return __generator(this, function (_a) {
                message = messageSerial;
                if (this.requestFor) {
                    this.handleRequest(this.requestFor, message);
                }
                else {
                    this.requestFor = message;
                }
                return [2 /*return*/];
            });
        }); });
        var scope = workerData.scopeName ? workerData.scopeName : 'unnamed_scope';
        _this.mainScope = new type_tools_1.ix.MajorScope(scope + "(".concat(process.pid, ")"));
        if (workerData.coreAffinity !== null && workerData.coreAffinity !== undefined) {
            var core = workerData.coreAffinity;
            if (core === 'auto' && workerData.workerId !== null && workerData.workerId !== undefined) {
                core = (workerData.workerId % os.cpus().length) + '';
            }
            if (process.platform === 'linux') {
                (0, child_process_1.execSync)("taskset -cp ".concat(core, " ").concat(process.pid), { stdio: 'inherit' });
            }
        }
        return _this;
    }
    AsyncWorkerExecutor.prototype.getSelf = function () { return this; };
    AsyncWorkerExecutor.prototype.setAsReady = function () { this.returnCall('$__init'); };
    AsyncWorkerExecutor.prototype.returnCall = function (callId, response) {
        if (!response) {
            response = '';
        }
        process.send(callId);
        process.send(response);
    };
    AsyncWorkerExecutor.prototype.addCustomAction = function (actionName, handler) {
        this.customAction[actionName] = handler;
    };
    AsyncWorkerExecutor.prototype.handleRequest = function (callId, payload) {
        return __awaiter(this, void 0, void 0, function () {
            var action, exitCode_1, module_1, _i, _a, actionName, res, resStr;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this.requestFor = '';
                        action = callId.split('::')[0];
                        switch (action) {
                            case '$__terminate': {
                                if (this.terminating) {
                                    break;
                                }
                                this.terminating = true;
                                exitCode_1 = payload ? parseInt(payload, 10) : 0;
                                this.ontermination().finally(function () {
                                    _this.returnCall('$__terminated');
                                    setTimeout(function () { return process.exit(exitCode_1); }, 1000);
                                });
                                return [2 /*return*/, this.returnCall('$__termination_set')];
                            }
                            case '$__import': {
                                try {
                                    module_1 = require(payload);
                                    if (module_1.workerExtension) {
                                        for (_i = 0, _a = Object.keys(module_1.workerExtension); _i < _a.length; _i++) {
                                            actionName = _a[_i];
                                            this.addCustomAction(actionName, module_1.workerExtension[actionName]);
                                        }
                                    }
                                }
                                catch (e) { }
                                return [2 /*return*/, this.returnCall(callId, '')];
                            }
                        }
                        return [4 /*yield*/, this.handleAction(callId, action, payload)];
                    case 1:
                        res = _b.sent();
                        if (!(!res && this.customAction[action])) return [3 /*break*/, 3];
                        return [4 /*yield*/, Promise.resolve(this.customAction[action](payload, this, callId, action))];
                    case 2:
                        resStr = _b.sent();
                        if (!resStr) {
                            resStr = '';
                        }
                        this.returnCall(callId, resStr);
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    AsyncWorkerExecutor.prototype.handleAction = function (callId, action, payload) {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    AsyncWorkerExecutor.prototype.ontermination = function () {
        return __awaiter(this, void 0, void 0, function () { return __generator(this, function (_a) {
            return [2 /*return*/];
        }); });
    };
    AsyncWorkerExecutor.logger = logger_1.log;
    return AsyncWorkerExecutor;
}(type_tools_1.ix.Entity));
exports.AsyncWorkerExecutor = AsyncWorkerExecutor;
function startWorker(workerFile, logic) {
    if (process.env.WORKER_DATA_BASE64) {
        var workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
        if (workerData.workerFile === workerFile) {
            return new logic(workerData).getSelf();
        }
    }
    return false;
}
exports.startWorker = startWorker;
