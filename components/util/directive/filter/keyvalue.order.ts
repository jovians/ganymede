/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { KeyValue } from '@angular/common';

export type KVComparator<T = any> = (a: KeyValue<string, T>, b: KeyValue<string, T>) => number;

export const kvOrder = {

  // Preserve original property order
  original: (a: KeyValue<string, any>, b: KeyValue<string, any>): number => {
    return 0;
  },

  by: <T>(sortFunction: KVComparator<T>): KVComparator<T> => {
    return sortFunction;
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
