"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ganymedeLicense = exports.ganymedeLicenseCallbacks = exports.ganymedeLicensePublicKey = void 0;
const rxjs_1 = require("rxjs");
const ganymede_app_1 = require("../../../ganymede.app");
exports.ganymedeLicensePublicKey = 'CMikcR6jnFBG26cGieB5Pl5REA8LUN/JinhMxQRJddc=';
exports.ganymedeLicenseCallbacks = [];
exports.ganymedeLicense = new rxjs_1.BehaviorSubject(true);
window['__init_FourQ__'] = () => {
    const conf = ganymede_app_1.ganymedeAppData.conf;
    const license = JSON.parse(JSON.stringify(conf.license));
    const currentDomain = window.location.hostname.startsWith('www.')
        ? window.location.hostname.substr(4)
        : window.location.hostname;
    const getLicenseMessage = (domain) => {
        license.domain = domain;
        return 'GANYMEDE_LICENSE___'
            + license.org + '___'
            + license.user + '___'
            + license.app + '___'
            + domain + '___'
            + license.scope + '___'
            + license.etc;
    };
    const toBuffer = (str) => {
        const buff = new Uint8Array(str.length);
        for (let i = 0; i < str.length; ++i) {
            buff[i] = str.charCodeAt(i) % 256;
        }
        return buff;
    };
    license.activeKey = !currentDomain.startsWith('localhost') ? license.key : license.keyLocal;
    const msgs = [toBuffer(getLicenseMessage(currentDomain))];
    const sig = { data: toBuffer(atob(license.activeKey)) };
    const pubkey = toBuffer(atob(exports.ganymedeLicensePublicKey));
    const sigs = [];
    const pubkeys = [];
    for (const msg of msgs) {
        sigs.push(sig);
        pubkeys.push(pubkey);
    }
    const handleCallbacks = (result) => {
        exports.ganymedeLicense.next(result);
        for (const cb of exports.ganymedeLicenseCallbacks) {
            try {
                cb(result, license);
            }
            catch (e) {
                console.log(e);
            }
        }
    };
    handleCallbacks(true);
};
if (window['FourQ']) {
    setTimeout(() => { window['__init_FourQ__'](); }, 0);
}
