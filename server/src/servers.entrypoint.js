"use strict";
exports.__esModule = true;
exports.ServerEntryPoint = void 0;
var auth_server_1 = require("./auth.server");
var const_1 = require("./const");
var extensions_1 = require("./extensions");
var cluster = require("cluster");
var ServerEntryPoint = /** @class */ (function () {
    function ServerEntryPoint() {
    }
    ServerEntryPoint.start = function () {
        if (ServerEntryPoint.started) {
            return;
        }
        for (var _i = 0, _a = process.argv; _i < _a.length; _i++) {
            var arg = _a[_i];
            if (arg === '--prod') {
                const_1.ServerConst.data.prod = true;
            }
        }
        if (cluster.isMaster) {
            // Default modules
            if (const_1.ServerConst.data.base.modules) {
                for (var _b = 0, _c = Object.keys(const_1.ServerConst.data.base.modules); _b < _c.length; _b++) {
                    var baseModuleName = _c[_b];
                    switch (baseModuleName) {
                        case 'auth':
                            var authServer = new auth_server_1.AuthServer();
                            authServer.start(const_1.ServerConst.data.base.modules.auth);
                            break;
                    }
                }
            }
            // Spawn Worker & Log Worker
            if (const_1.ServerConst.data.extensions) {
                if (const_1.ServerConst.data.extensions.native) {
                    for (var _d = 0, _e = Object.keys(const_1.ServerConst.data.extensions.native); _d < _e.length; _d++) {
                        var nativeExt = _e[_d];
                        var extData = const_1.ServerConst.data.extensions.native[nativeExt];
                        var globalConfData = const_1.ServerConst.data.global ? const_1.ServerConst.data.global : {};
                        extData._extension_key = "native." + nativeExt;
                        cluster.fork({
                            EXT_KEY: extData._extension_key,
                            EXT_DATA_BASE64: Buffer.from(JSON.stringify(extData)).toString('base64'),
                            GLOBAL_CONF_DATA_BASE64: Buffer.from(JSON.stringify(globalConfData)).toString('base64')
                        });
                    }
                }
            }
        }
        else if (cluster.isWorker) {
            var extKey = process.env.EXT_KEY;
            extensions_1.GanymedeServerExtensions.run(extKey);
        }
        ServerEntryPoint.started = true;
    };
    ServerEntryPoint.started = false;
    return ServerEntryPoint;
}());
exports.ServerEntryPoint = ServerEntryPoint;
