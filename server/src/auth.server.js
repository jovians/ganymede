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
var Express = require("express");
var BodyParser = require("body-parser");
var crypto = require("crypto");
var fs = require("fs");
var fourq_1 = require("@jovian/fourq");
var const_1 = require("./const");
var ganymede_app_1 = require("../../../../../ganymede.app");
var AuthServer = /** @class */ (function () {
    function AuthServer() {
        this.port = 7220;
    }
    AuthServer.prototype.initialize = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                try {
                    this.apiRoot = Express();
                    // support application/json type post data
                    this.apiRoot.use(BodyParser.json());
                    // support application/x-www-form-urlencoded post data
                    this.apiRoot.use(BodyParser.urlencoded({ extended: false }));
                    this.apiRoot.use(function (req, res, next) {
                        res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
                        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
                        next();
                    });
                    // this.apiRoot.get('/api/ganymede/auth/setDeviceTimestampSeed', async (req, res) => {
                    //   console.log('setBrowserTimestampSeed');
                    //   const cookieRaw = req.headers.cookie;
                    //   if (cookieRaw) {
                    //     const target = cookieRaw.split('gany_dev_id=');
                    //     if (target.length > 1) { return res.end(''); }
                    //   }
                    //   const seed =  crypto.randomBytes(36).toString('base64')
                    //                     .replace('+', '-').replace('/', '.').replace('=', '_');
                    //   res.cookie('gany_dev_id', seed, {
                    //     expires: new Date(Date.now() + 3155695200), // 100 years
                    //     httpOnly: true,
                    //     secure: false
                    //   });
                    //   res.end('');
                    // });
                    this.apiRoot.get('/api/ganymede/auth/deviceTimestamp', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                        var cookieRaw, target, secret, keypair, t, nonce, msg, hash;
                        return __generator(this, function (_a) {
                            cookieRaw = req.headers.cookie;
                            if (cookieRaw) {
                                target = cookieRaw.split('gany_dev_ss_token=');
                            }
                            if (target && target.length > 2) {
                                return [2 /*return*/, res.end('')];
                            } // deny spoof
                            if (!cookieRaw || target.length === 1) {
                                keypair = fourq_1.FourQ.generateKeyPair();
                                secret = keypair.secretKey.toString('base64').replace('+', '-').replace('/', '.').replace('=', '_');
                                // seed =  crypto.randomBytes(36).toString('base64').replace('+', '-').replace('/', '.');
                                res.cookie('gany_dev_ss_token', secret, {
                                    expires: new Date(Date.now() + 3155695200),
                                    httpOnly: true,
                                    secure: const_1.serverConst.prod ? true : false
                                });
                            }
                            else {
                                secret = target[1].split('; ')[0].replace('-', '+').replace('.', '/').replace('_', '=');
                            }
                            t = Date.now();
                            nonce = crypto.randomBytes(6).toString('base64');
                            msg = Buffer.from(const_1.serverConst.salts.browserTimestamp + ":" + nonce + ":" + t);
                            hash = crypto.createHash('sha256').update(msg).digest('base64');
                            return [2 /*return*/, res.end(Date.now() + "::" + nonce + "::" + hash)];
                        });
                    }); });
                    if (ganymede_app_1.ganymedeAppData.features.preinit) {
                        this.apiRoot.get('/api/ganymede/preinit', function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                            var ret, ip, swMeta;
                            return __generator(this, function (_a) {
                                ret = {};
                                ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
                                if (ip.startsWith('::ffff')) {
                                    ip = ip.split('::ffff:')[1];
                                }
                                try {
                                    swMeta = fs.statSync('../../../assets-root/sw.js');
                                    swMeta = JSON.parse(swMeta);
                                }
                                catch (e) { }
                                ret.sw = swMeta ? swMeta.mtimeMs : 0;
                                res.set('Last-Modified', Date.now() + ', ' + ip);
                                res.end(JSON.stringify(ret));
                                return [2 /*return*/];
                            });
                        }); });
                    }
                    console.log('Initialized...');
                    this.apiRoot.listen(this.port);
                }
                catch (e) {
                    console.log(e);
                }
                return [2 /*return*/];
            });
        });
    };
    AuthServer.prototype.main = function () {
        try {
            this.initialize();
        }
        catch (e) {
            console.log(e);
        }
    };
    AuthServer.prototype.terminationHandler = function (e) {
        console.log(e, 'test');
        if (e && e.preventDefault) {
            e.preventDefault();
        }
    };
    return AuthServer;
}());
exports.AuthServer = AuthServer;
function getcookie(req) {
    var cookie = req.headers.cookie;
    // user=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
    return cookie.split('; ');
}
