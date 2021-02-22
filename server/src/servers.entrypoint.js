"use strict";
exports.__esModule = true;
var auth_server_1 = require("./auth.server");
var const_1 = require("./const");
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
        var authServer = new auth_server_1.AuthServer();
        authServer.initialize();
        ServerEntryPoint.started = true;
    };
    ServerEntryPoint.started = false;
    return ServerEntryPoint;
}());
exports.ServerEntryPoint = ServerEntryPoint;
