/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export const ganymedeLicenseCallbacks = [];

// tslint:disable-next-line: no-string-literal
window['__init_FourQ__'] = () => {
  const ganyMeta = {};
  const metas = document.getElementsByTagName('meta');
  for (const meta of metas as any as HTMLElement[]) {
    if (meta.getAttribute('name') && meta.getAttribute('name').startsWith('ganymede-')) {
      ganyMeta[meta.getAttribute('name')] = meta.getAttribute('content');
    }
  }
  const currentDomain = window.location.hostname.startsWith('www.')
                          ? window.location.hostname.substr(4)
                          : window.location.hostname;
  const getLicenseMessage = (domain) => {
    return 'GANYMEDE_LICENSE___'
                + ganyMeta['ganymede-license-org'] + '___'
                + ganyMeta['ganymede-license-user'] + '___'
                + domain + '___'
                + ganyMeta['ganymede-license-scope'];
  };
  const toBuffer = (str) => {
    const buff = new Uint8Array(str.length);
    for (let i = 0; i < str.length; ++i) { buff[i] = str.charCodeAt(i) % 256; }
    return buff;
  };
  const msgs = [getLicenseMessage(currentDomain)];
  if (currentDomain.split('.').length > 2) {
    const domainParts = currentDomain.split('.');
    domainParts.shift();
    domainParts.unshift('*');
    const wildcardDomain = domainParts.join('.');
    msgs.push(getLicenseMessage(wildcardDomain));
  }
  // tslint:disable-next-line: no-string-literal
  const fourq = new window['FourQ'].getFleet();
  const sig = { data: toBuffer(atob(ganyMeta['ganymede-license-key'])) };
  const pubkey = toBuffer(atob(ganyMeta['ganymede-license-pub-key']));
  const sigs = [];
  const pubkeys = [];
  for (const msg of msgs) {
    sigs.push(sig); pubkeys.push(pubkey);
  }
  fourq.batch(msgs.length).verify(sigs, msgs, pubkeys,
    (e, valid) => {
      if (Array.isArray(valid)) { valid = valid.filter(at => !!at).length > 0; }
      const anyValid = (currentDomain === 'localhost') ? true : valid;
      for (const cb of ganymedeLicenseCallbacks) {
        // tslint:disable-next-line: no-console
        try { cb(anyValid, ganyMeta); } catch (e) { console.log(e); }
      }
    }
  );
};

// tslint:disable-next-line: no-string-literal
if (window['FourQ']) { setTimeout(() => { window['__init_FourQ__'](); }, 0); }
