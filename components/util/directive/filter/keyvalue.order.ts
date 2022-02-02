/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { KeyValue } from '@angular/common';

export const kvOrder = {

  // Preserve original property order
  original: (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  },

  value: {
    string: {
      asc: (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
        return a.value.localeCompare(b.value);
      },
      desc: (a: KeyValue<string, string>, b: KeyValue<string, string>): number => {
        return b.value.localeCompare(a.value);
      },
    },
  },

  key: {
    asc: (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
      return a.key < b.key ? -1 : (b.key < a.key ? 1 : 0);
    },
    desc: (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
      return a.key > b.key ? -1 : (b.key > a.key ? 1 : 0);
    },
  },

};
