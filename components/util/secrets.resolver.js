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
exports.secrets = exports.SecretsResolver = void 0;
var ganymede_app_1 = require("../../../../../ganymede.app");
var isNodeJs = (typeof process !== 'undefined') && (process.release.name === 'node');
var SecretsResolver = /** @class */ (function () {
    function SecretsResolver(config) {
        this.isLocalJson = false;
        this.allData = null;
        this.config = config;
        if (config.type === 'local-json-file') {
            this.isLocalJson = true;
            if (isNodeJs) {
                var fs = require('fs');
                if (fs.existsSync(config.jsonFile)) {
                    this.allData = JSON.parse(fs.readFileSync(config.jsonFile, 'utf8'));
                }
                else {
                    throw new Error("Cannot find secrets datastore file: '" + config.jsonFile + "'");
                }
            }
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
    SecretsResolver.prototype.resolve = function (expression) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                return [2 /*return*/, new Promise(function (resolve) {
                        if (!expression || !expression.startsWith(SecretsResolver.prefix)) {
                            return resolve(expression);
                        }
                        try {
                            var secretPaths = expression.split(SecretsResolver.prefix)[1].split('>')[0].split('.');
                            var current = void 0;
                            if (_this.isLocalJson) {
                                current = _this.allData;
                            }
                            else {
                                // TODO
                            }
                            if (!current) {
                                return resolve(expression);
                            }
                            for (var _i = 0, secretPaths_1 = secretPaths; _i < secretPaths_1.length; _i++) {
                                var key = secretPaths_1[_i];
                                if (!current || !current[key]) {
                                    return resolve(expression);
                                }
                                current = current[key];
                            }
                            if (current && typeof current === 'string') {
                                return resolve(current);
                            }
                            else {
                                return resolve(expression);
                            }
                        }
                        catch (e) {
                            return resolve(expression);
                        }
                    })];
            });
        });
    };
    SecretsResolver.prefix = '<secret.';
    return SecretsResolver;
}());
exports.SecretsResolver = SecretsResolver;
exports.secrets = new SecretsResolver(ganymede_app_1.ganymedeAppData.secretsResolution);
