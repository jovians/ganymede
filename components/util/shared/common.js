"use strict";
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindSub = exports.topMomentOut = exports.completeConfig = exports.completeConfigDirectly = exports.keyNav = exports.currentEnv = exports.EnvContext = exports.isNodeJs = void 0;
exports.isNodeJs = (typeof process !== 'undefined') && (process.release.name === 'node');
var EnvContext;
(function (EnvContext) {
    EnvContext["local"] = "local";
    EnvContext["dev"] = "dev";
    EnvContext["stg"] = "stg";
    EnvContext["prd"] = "prd";
})(EnvContext = exports.EnvContext || (exports.EnvContext = {}));
exports.currentEnv = EnvContext.local;
function keyNav(obj, keys) {
    var at = obj;
    for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
        var key = keys_1[_i];
        if (!at) {
            return { resolved: false, value: null };
        }
        if (at[key] === undefined) {
            return { resolved: false, value: null };
        }
        at = at[key];
    }
    return { resolved: true, value: at };
}
exports.keyNav = keyNav;
function completeConfigDirectly(targetConfig, defaultConfig) {
    return completeConfig(targetConfig, defaultConfig, true);
}
exports.completeConfigDirectly = completeConfigDirectly;
function completeConfig(targetConfig, defaultConfig, directAssign, depth) {
    if (directAssign === void 0) { directAssign = false; }
    if (depth === void 0) { depth = 0; }
    // clone both configs for base depth
    if (depth === 0) {
        if (targetConfig && typeof targetConfig === 'object' || Array.isArray(targetConfig)) {
            if (!directAssign) {
                targetConfig = JSON.parse(JSON.stringify(targetConfig));
            }
        }
        if (defaultConfig && typeof defaultConfig === 'object' || Array.isArray(defaultConfig)) {
            defaultConfig = JSON.parse(JSON.stringify(defaultConfig));
        }
    }
    if (targetConfig === null || targetConfig === undefined) {
        return defaultConfig;
    }
    if (defaultConfig) {
        if (Array.isArray(defaultConfig)) {
            return targetConfig;
        }
        else if (typeof defaultConfig === 'object') {
            for (var _i = 0, _a = Object.keys(defaultConfig); _i < _a.length; _i++) {
                var key = _a[_i];
                targetConfig[key] = completeConfig(targetConfig[key], defaultConfig[key], false, depth + 1);
            }
        }
    }
    return targetConfig;
}
exports.completeConfig = completeConfig;
function topMomentOut(srcComponent, lockname, momentMs, logic, onOutdated) {
    if (!srcComponent) {
        throw new Error("Cannot invoke topMomentOut without invocation target.");
    }
    if (srcComponent.__locker) {
        srcComponent.__locker = {};
    }
    var locker = srcComponent.__locker[lockname] = {};
    setTimeout(function () {
        if (locker !== srcComponent.__locker[lockname]) {
            return onOutdated();
        }
        logic();
    }, momentMs);
}
exports.topMomentOut = topMomentOut;
function bindSub(component, subj, getter) {
    var subs = subj.subscribe(getter);
    if (!component.__rx_subs) {
        component.__rx_subs = [];
    }
    component.__rx_subs.push(subs);
}
exports.bindSub = bindSub;
