"use strict";
exports.__esModule = true;
exports.ganymedeLicense = exports.ganymedeLicenseCallbacks = exports.ganymedeLicensePublicKey = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var rxjs_1 = require("rxjs");
var ganymede_app_1 = require("../../../ganymede.app");
exports.ganymedeLicensePublicKey = 'CMikcR6jnFBG26cGieB5Pl5REA8LUN/JinhMxQRJddc=';
exports.ganymedeLicenseCallbacks = [];
exports.ganymedeLicense = new rxjs_1.BehaviorSubject(true);
// tslint:disable-next-line: no-string-literal
window['__init_FourQ__'] = function () {
    var conf = ganymede_app_1.ganymedeAppData.conf;
    var license = JSON.parse(JSON.stringify(conf.license));
    var currentDomain = window.location.hostname.startsWith('www.')
        ? window.location.hostname.substr(4)
        : window.location.hostname;
    var getLicenseMessage = function (domain) {
        license.domain = domain;
        return 'GANYMEDE_LICENSE___'
            + license.org + '___'
            + license.user + '___'
            + license.app + '___'
            + domain + '___'
            + license.scope + '___'
            + license.etc;
    };
    var toBuffer = function (str) {
        var buff = new Uint8Array(str.length);
        for (var i = 0; i < str.length; ++i) {
            buff[i] = str.charCodeAt(i) % 256;
        }
        return buff;
    };
    license.activeKey = !currentDomain.startsWith('localhost') ? license.key : license.keyLocal;
    var msgs = [toBuffer(getLicenseMessage(currentDomain))];
    var fourq = new window.FourQ.getFleet();
    var sig = { data: toBuffer(atob(license.activeKey)) };
    var pubkey = toBuffer(atob(exports.ganymedeLicensePublicKey));
    var sigs = [];
    var pubkeys = [];
    for (var _i = 0, msgs_1 = msgs; _i < msgs_1.length; _i++) {
        var msg = msgs_1[_i];
        sigs.push(sig);
        pubkeys.push(pubkey);
    }
    fourq.batch(msgs.length).verify(sigs, msgs, pubkeys, function (e, valid) {
        if (Array.isArray(valid)) {
            valid = valid.filter(function (at) { return !!at; }).length > 0;
        }
        var anyValid = valid;
        exports.ganymedeLicense.next(anyValid);
        for (var _i = 0, ganymedeLicenseCallbacks_1 = exports.ganymedeLicenseCallbacks; _i < ganymedeLicenseCallbacks_1.length; _i++) {
            var cb = ganymedeLicenseCallbacks_1[_i];
            // tslint:disable-next-line: no-console
            try {
                cb(anyValid, license);
            }
            catch (e) {
                console.log(e);
            }
        }
    });
};
// tslint:disable-next-line: no-string-literal
if (window['FourQ']) {
    setTimeout(function () { window['__init_FourQ__'](); }, 0);
}
