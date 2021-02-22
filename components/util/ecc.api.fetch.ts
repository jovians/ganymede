/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
export const eccToken = { value: '', expires: 0 };

export class EccApiFetchParam {
  /** http method; e.g. GET, POST, PUT, DELETE, etc. */
  method = 'GET';
  /** target url; must be absolute */
  url = 'unknown';
  /** base64-encoded public key */
  publicKey = '';
  /** base64-encoded secret key */
  secretKey = '';
  auth = true;
  data: any = null;
  constructor(initializer?: Partial<EccApiFetchParam>) {
    if (initializer) { Object.assign(this, initializer); }
  }
}

export function eccSign(message: string, secretBase64: string): Promise<string> {
  return new Promise<string>(resolve => {
    try {
      // tslint:disable-next-line: no-string-literal
      if (!window['FourQ_Default_Fleet']) { window['FourQ_Default_Fleet'] = new window['FourQ'].getFleet(); }
      // tslint:disable-next-line: no-string-literal
      const fourq = window['FourQ_Default_Fleet'];
      const msgBuffer = new Uint8Array(message.length);
      for (let i = 0; i < msgBuffer.length; ++i) { msgBuffer[i] = message.charCodeAt(i); }
      const secret = atob(secretBase64);
      const secretBuffer = new Uint8Array(32);
      for (let i = 0; i < secretBuffer.length; ++i) { secretBuffer[i] = secret.charCodeAt(i); }
      fourq.sign(msgBuffer, secretBuffer, (e, sig) => {
        if (e) { return resolve(null); }
        const sigBytesString = btoa(String.fromCharCode.apply(null, sig.data));
        return resolve(sigBytesString);
      });
    } catch (e) { resolve(null); }
  });
}

export function eccApiFetch(params: Partial<EccApiFetchParam>): Promise<any> {
  const baseParams = new EccApiFetchParam();
  params = Object.assign(baseParams, params);
  return new Promise<any>(async resolve => {
    const timestamp = Date.now();
    const validFor = 3600;
    let authData;
    if (params.auth) {
      if (eccToken.value && Date.now() < eccToken.expires - 10000) {
        // token valid
        authData = btoa(JSON.stringify({ token: eccToken.value }));
      } else {
        // re ecc-auth needed
        authData = btoa(JSON.stringify({
          keyName: 'admin',
          signature: await eccSign(timestamp + '', params.secretKey),
          validfor: validFor,
          t: timestamp
        }));
      }
    }
    const method = params.method.toUpperCase();
    const req = new XMLHttpRequest();
    req.open(method, params.url);
    req.onreadystatechange = (e) => {
      if (req.readyState !== 4) { return; }
      if (req.status !== 200 && req.status !== 201) { return resolve(null); }
      const headers = req.getAllResponseHeaders().toLowerCase().split('\n');
      for (const header of headers) {
        const colonPosition = header.indexOf(':');
        const headerName = header.substring(0, colonPosition).trim();
        const headerValue = header.substring(colonPosition + 1).trim();
        if (headerName.toLowerCase() === 'last-modified') {
          eccToken.value = headerValue.split(', ')[1];
          eccToken.expires = parseInt(headerValue.split(', ')[2], 10);
        }
      }
      try {
        return resolve(JSON.parse(req.responseText));
      } catch (e) {}
      return resolve(null);
    };
    if (params.auth) { req.setRequestHeader('Authorization', authData); }
    if (params.data && method !== 'GET') {
      req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      req.send('a=' + btoa(JSON.stringify(params.data)));
    } else {
      req.send();
    }
  });
}
