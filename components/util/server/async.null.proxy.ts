/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export const nullProxyFunction = new Proxy({} as any, {
  get: () => {
    return () => new Promise<any>(resolve => { resolve(null); });
  },
});

export const nullProxyPromise = new Proxy({} as any, {
  get: () => {
    return new Promise<any>(resolve => { resolve(null); });
  },
});
