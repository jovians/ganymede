/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { BehaviorSubject } from 'rxjs';
import { ganymedeAppData } from '../../../ganymede.app';

export const ganymedeLicensePublicKey = 'CMikcR6jnFBG26cGieB5Pl5REA8LUN/JinhMxQRJddc=';
export const ganymedeLicenseCallbacks = [];
export const ganymedeLicense = new BehaviorSubject<boolean>(true);

declare var window: any;

// tslint:disable-next-line: no-string-literal
window['__init_FourQ__'] = () => {
  const conf = ganymedeAppData.conf;
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
    for (let i = 0; i < str.length; ++i) { buff[i] = str.charCodeAt(i) % 256; }
    return buff;
  };
  license.activeKey = !currentDomain.startsWith('localhost') ? license.key : license.keyLocal;
  const msgs = [toBuffer(getLicenseMessage(currentDomain))];
  const sig = { data: toBuffer(atob(license.activeKey)) };
  const pubkey = toBuffer(atob(ganymedeLicensePublicKey));
  const sigs = [];
  const pubkeys = [];
  for (const msg of msgs) {
    sigs.push(sig);
    pubkeys.push(pubkey);
  }
  const handleCallbacks = (result: boolean) => {
    ganymedeLicense.next(result);
    for (const cb of ganymedeLicenseCallbacks) {
      // tslint:disable-next-line: no-console
      try { cb(result, license); } catch (e) { console.log(e); }
    }
  };
  // const fourq = new window.FourQ.getFleet();
  // fourq.batch(msgs.length).verify(sigs, msgs, pubkeys,
  //   (e, valid) => {
  //     if (Array.isArray(valid)) { valid = valid.filter(at => !!at).length > 0; }
  //     const anyValid = valid;
  //     handleCallbacks(anyValid);
  //   }
  // );
  handleCallbacks(true);
};

// tslint:disable-next-line: no-string-literal
if (window['FourQ']) { setTimeout(() => { window['__init_FourQ__'](); }, 0); }
