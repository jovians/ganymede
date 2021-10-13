/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export const i18n = new Proxy({} as any, {
  get: (_1, prop, _2) => {
    let stringVal: string = prop as string;
    const dummyObj = { _value: stringVal };
    const keyConcatProxy = new Proxy(dummyObj, {
      get: (_3, prop2, _4) => {
        if (String.prototype[prop2]) {
          // tslint:disable-next-line: only-arrow-functions
          return function() { return String.prototype[prop2].apply(stringVal, arguments); };
        } else if (prop2 === 'length') {
          return stringVal.length;
        } else if (prop2 === 'keyJoin') {
          return (...a) => a.join('.');
        } else if (prop2 === 'toPrimitive') {
          return () => stringVal;
        } else if (typeof prop2 === 'symbol') {
          return () => stringVal;
        } else if (prop2 === '_value') {
          return stringVal;
        }
        stringVal += '.' + (prop2 as string);
        dummyObj._value = stringVal;
        return keyConcatProxy;
      }
    });
    return keyConcatProxy;
  },
});
