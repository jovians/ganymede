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
Object.defineProperty(exports, "__esModule", { value: true });
exports.secrets = exports.SecretsResolver = void 0;
var ganymede_app_1 = require("../../../../../../ganymede.app");
var fs = require("fs");
var destor_1 = require("./destor");
var common_1 = require("../shared/common");
var SecretsResolver = /** @class */ (function () {
    function SecretsResolver(config) {
        this.isLocalJson = false;
        this.allData = null;
        this.config = config;
        if (config.type === 'local-json-file') {
            this.isLocalJson = true;
            if (fs.existsSync(config.jsonFile)) {
                this.allData = JSON.parse(fs.readFileSync(config.jsonFile, 'utf8'));
            }
            else {
                throw new Error("Cannot find secrets datastore file: '".concat(config.jsonFile, "'"));
            }
        }
        else if (config.type === 'source-from-destor') {
        }
    }
    SecretsResolver.prototype.resolveContent = function (content) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // TODO
                return [2 /*return*/, null];
            });
        });
    };
    SecretsResolver.prototype.resolveFromDestor = function (secretPath) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, destor_1.Destor.get({
                            path: "/api-destor/v1/secret-resolve/".concat(common_1.currentEnv), data: { path: secretPath }
                        })];
                    case 1:
                        result = _a.sent();
                        if (!result) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, result.value];
                }
            });
        });
    };
    SecretsResolver.prototype.resolve = function (expression, passthru) {
        if (passthru === void 0) { passthru = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) { return __awaiter(_this, void 0, void 0, function () {
                        var notFoundResponse, secretPaths, current, _a, e_1, _i, secretPaths_1, key, e_2;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    notFoundResponse = passthru ? expression : '';
                                    if (!expression || !expression.startsWith(SecretsResolver.prefix)) {
                                        return [2 /*return*/, resolve(notFoundResponse)];
                                    }
                                    _b.label = 1;
                                case 1:
                                    _b.trys.push([1, 6, , 7]);
                                    secretPaths = expression.split(SecretsResolver.prefix)[1].split('>')[0].split('.');
                                    current = void 0;
                                    if (!this.isLocalJson) return [3 /*break*/, 2];
                                    current = this.allData;
                                    return [3 /*break*/, 5];
                                case 2:
                                    _b.trys.push([2, 4, , 5]);
                                    _a = resolve;
                                    return [4 /*yield*/, this.resolveFromDestor(secretPaths)];
                                case 3: return [2 /*return*/, _a.apply(void 0, [_b.sent()])];
                                case 4:
                                    e_1 = _b.sent();
                                    return [2 /*return*/, resolve(notFoundResponse)];
                                case 5:
                                    if (!current) {
                                        return [2 /*return*/, resolve(notFoundResponse)];
                                    }
                                    for (_i = 0, secretPaths_1 = secretPaths; _i < secretPaths_1.length; _i++) {
                                        key = secretPaths_1[_i];
                                        if (key === '__perm__') {
                                            return [2 /*return*/, resolve(notFoundResponse)];
                                        }
                                        if (!current || !current[key]) {
                                            return [2 /*return*/, resolve(notFoundResponse)];
                                        }
                                        current = current[key];
                                    }
                                    if (current && typeof current === 'string') {
                                        return [2 /*return*/, resolve(current)];
                                    }
                                    else {
                                        return [2 /*return*/, resolve(notFoundResponse)];
                                    }
                                    return [3 /*break*/, 7];
                                case 6:
                                    e_2 = _b.sent();
                                    return [2 /*return*/, resolve(notFoundResponse)];
                                case 7: return [2 /*return*/];
                            }
                        });
                    }); })];
            });
        });
    };
    SecretsResolver.prefix = '<destor.';
    return SecretsResolver;
}());
exports.SecretsResolver = SecretsResolver;
exports.secrets = new SecretsResolver(ganymede_app_1.ganymedeAppData.secretsResolution);
