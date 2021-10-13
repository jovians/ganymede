/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { DestorComms } from '../shared/crypto/destor.comms';
import { SecureRequest } from '../shared/crypto/secure.comm';

export class Destor {
  static pool: any[] = [];
  static info;
  static env;
  static gateway: DestorComms = new DestorComms();
  static initialized = false;
  static initialize() {
    if (Destor.initialized) { return; }
    Destor.initialized = true;
    if (process.env.DESTOR_INFO_BASE64) {
      Destor.info = JSON.parse(Buffer.from(process.env.DESTOR_INFO_BASE64, 'base64').toString('utf8'));
      Destor.pool = Destor.info.list;
      Destor.env = process.env.DESTOR_ENV;
    }
  }
  static async get(reqObj: SecureRequest) {
    for (const destor of Destor.pool) {
      const res = await Destor.gateway.target(destor).get(reqObj);
      if (res && res.status === 'ok') { return res.result; }
    }
    return null;
  }
}

Destor.initialize();
