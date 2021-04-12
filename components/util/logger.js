"use strict";
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
exports.__esModule = true;
exports.log = exports.GanymedeLogger = void 0;
var ganymede_app_1 = require("../../../../../ganymede.app");
var GanymedeLogger = /** @class */ (function () {
    function GanymedeLogger(settings) {
    }
    GanymedeLogger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // tslint:disable-next-line: no-console
        console.log.apply(console, args);
    };
    GanymedeLogger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // tslint:disable-next-line: no-console
        console.debug.apply(console, args);
    };
    GanymedeLogger.prototype.error = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        // tslint:disable-next-line: no-console
        console.error.apply(console, args);
    };
    return GanymedeLogger;
}());
exports.GanymedeLogger = GanymedeLogger;
exports.log = new GanymedeLogger(ganymede_app_1.ganymedeAppData.loggerSettings);
ganymede_app_1.ganymedeAppData.logger = exports.log;
