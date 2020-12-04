"use strict";
exports.__esModule = true;
var auth_server_1 = require("./auth.server");
var const_1 = require("./const");
for (var _i = 0, _a = process.argv; _i < _a.length; _i++) {
    var arg = _a[_i];
    if (arg === '--prod') {
        const_1.serverConst.prod = true;
    }
}
var authServer = new auth_server_1.AuthServer();
authServer.initialize();
