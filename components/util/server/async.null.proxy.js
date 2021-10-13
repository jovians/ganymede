"use strict";
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.nullProxyPromise = exports.nullProxyFunction = void 0;
exports.nullProxyFunction = new Proxy({}, {
    get: function () {
        return function () { return new Promise(function (resolve) { resolve(null); }); };
    },
});
exports.nullProxyPromise = new Proxy({}, {
    get: function () {
        return new Promise(function (resolve) { resolve(null); });
    },
});
