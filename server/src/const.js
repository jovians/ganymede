"use strict";
exports.__esModule = true;
var ServerConst = /** @class */ (function () {
    function ServerConst() {
    }
    ServerConst.setData = function (data) { ServerConst.data = data; ServerConst.initialized = true; };
    ServerConst.initialized = false;
    ServerConst.data = {};
    return ServerConst;
}());
exports.ServerConst = ServerConst;
