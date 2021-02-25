/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { makeid } from './crypto/makeid';

export class DomIdUtil {
  static prefix = 'gany_dom_';
  static id = 0;
  static getId() {
    return DomIdUtil.prefix + (DomIdUtil.id++);
  }
  static getHashId(length: number = 12) {
    return DomIdUtil.prefix + makeid(length);
  }
  static readyAngularComponent(angularComponent: any) {
    if (!(angularComponent as any)._gany_hash_id) {
      Object.defineProperty(angularComponent, '_gany_hash_id', { value: DomIdUtil.getHashId() });
    }
  }
}
