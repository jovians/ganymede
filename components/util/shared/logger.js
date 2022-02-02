"use strict";
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.GanymedeLogger = void 0;
// import { ganymedeAppData } from '../../../defaults/ganymede.app.interface';
var GanymedeLogger = /** @class */ (function () {
    function GanymedeLogger() {
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
    GanymedeLogger.prototype.loadSettings = function (settings) {
    };
    return GanymedeLogger;
}());
exports.GanymedeLogger = GanymedeLogger;
exports.log = new GanymedeLogger();
// ganymedeAppData.logger = log;
