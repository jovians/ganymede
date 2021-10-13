"use strict";
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
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
exports.GanymedeServerExtensions = void 0;
var fs = require("fs");
var child_process_1 = require("child_process");
var http_shim_1 = require("./http.shim");
var GanymedeServerExtensions = /** @class */ (function () {
    function GanymedeServerExtensions() {
    }
    GanymedeServerExtensions.register = function (key, serverDefinition) {
        GanymedeServerExtensions.registry[key] = serverDefinition;
    };
    GanymedeServerExtensions.run = function (key, compileOnly) {
        if (compileOnly === void 0) { compileOnly = false; }
        return __awaiter(this, void 0, void 0, function () {
            var ganyBasePath, extPath, alwaysCompile, compiled, e_1, extData, profilingLogFile, procArgs, proc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ganyBasePath = __dirname.split('/').slice(0, -2).join('/');
                        extPath = ganyBasePath + "/extensions/" + key.split('.').join('/');
                        fs.writeFileSync(extPath + "/server/.extension.build.uuid", process.env.BUILD_UUID, 'utf8');
                        if (!fs.existsSync("" + extPath)) {
                            return [2 /*return*/, console.log("ganymede server extension '" + key + "' not found.")];
                        }
                        alwaysCompile = true;
                        if (!(alwaysCompile || compileOnly || !fs.existsSync(extPath + "/server/src/main.js"))) return [3 /*break*/, 5];
                        compiled = void 0;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, execAsync("tsc --target es5 --experimentalDecorators --resolveJsonModule " + extPath + "/server/src/main.ts")];
                    case 2:
                        _a.sent();
                        compiled = true;
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _a.sent();
                        console.log(e_1.message);
                        return [3 /*break*/, 4];
                    case 4:
                        if (!compiled) {
                            return [2 /*return*/, console.log("ganymede server extension '" + key + "' failed to compile.")];
                        }
                        _a.label = 5;
                    case 5:
                        if (compileOnly) {
                            console.log("ganymede server extension '" + key + "' has been compiled.");
                            process.exit(0);
                        }
                        extData = process.env.EXT_DATA_BASE64 ?
                            JSON.parse(Buffer.from(process.env.EXT_DATA_BASE64, 'base64').toString('utf8')) : {};
                        profilingLogFile = extData.v8Profiling ? "--logfile=prof.ext." + key + ".log" : '';
                        console.log("Ganymede server extension '" + key + "' running (pid=" + process.pid + ")");
                        procArgs = ['--max-old-space-size=262144', extPath + "/server/src/main.js"];
                        if (profilingLogFile) {
                            procArgs.unshift('--prof');
                            procArgs.unshift(profilingLogFile);
                        }
                        proc = (0, child_process_1.spawn)('node', procArgs, {
                            stdio: ['inherit', 'inherit', 'inherit', 'ipc'], env: __assign({}, process.env)
                        });
                        proc.on('message', function (messageSerial) {
                            // const message = messageSerial as string;
                            // if (this.responseFor) {
                            //   this.handleResponse(this.responseFor, message);
                            // } else {
                            //   this.responseFor = message;
                            // }
                        });
                        proc.on('exit', function () {
                            var a = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                a[_i] = arguments[_i];
                            }
                            console.log(a);
                            console.log("ganymede server extension '" + key + "' exited.");
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    GanymedeServerExtensions.getBaseAppApi = function (config, globalConfData) {
        // TODO
        var app = new http_shim_1.GanymedeHttpServer(config, globalConfData);
        return app;
    };
    GanymedeServerExtensions.getGlobalConfData = function (globalConfData) {
        return globalConfData;
    };
    GanymedeServerExtensions.registry = {};
    return GanymedeServerExtensions;
}());
exports.GanymedeServerExtensions = GanymedeServerExtensions;
function execAsync(cmd) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    (0, child_process_1.exec)(cmd, function (e, stdout) {
                        if (e) {
                            console.log("ERROR: " + stdout);
                            return resolve(false);
                        }
                        resolve(true);
                    });
                })];
        });
    });
}
