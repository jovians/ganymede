/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
declare var FourQ: any;

export enum CryptoScheme { ED25519 = 'ED', FourQ = '4Q', }
export interface RawSchnorrSignature { type: string; data: Uint8Array; }
export interface RawSchnorrKeyPair { isSchnorr: boolean; type: CryptoScheme; publicKey: Uint8Array; secretKey: Uint8Array; }
export interface RawDiffieHellmanKeyPair { isDH: boolean; type: CryptoScheme; publicKey: Uint8Array; secretKey: Uint8Array; }
export interface SchnorrSignature { type: string; data: string; }
export interface SchnorrKeyPair { isSchnorr: boolean; type: CryptoScheme; publicKey: string; secretKey: string; }
export interface DiffieHellmanKeyPair { isDH: boolean; type: CryptoScheme; publicKey: string; secretKey: string; }

function bytesToBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode.apply(null, bytes));
}
function base64ToBytes(b64: string) {
  return atob(b64).split('').map(c => c.charCodeAt(0));
}

@Injectable({
  providedIn: 'root'
})
export class CryptoService {

  constructor() {
    FourQ.getFleet(1);
    this.generateKeyPair();
    console.log('sdf');
  }

  randomBytes(length: number): Uint8Array {
    const bytes = new Uint32Array(Math.ceil(length / 4));
    window.crypto.getRandomValues(bytes);
    return new Uint8Array(bytes.buffer);
  }

  async generateKeyPair(): Promise<SchnorrKeyPair> {
    return new Promise<SchnorrKeyPair>((resolve, reject) => {
      const seed = this.randomBytes(32);
      FourQ.generateFromSeed(seed, (e, keypair) => {
        if (e) { return reject(e); }
        const keyObj = {
          isSchnorr: true,
          type: CryptoScheme.FourQ,
          publicKey: bytesToBase64(keypair.publicKey),
          secretKey: bytesToBase64(keypair.secretKey),
        };
        resolve(keyObj);
        console.log(keyObj);
      });
    });
  }

  sign(message) {
    return new Promise<string>((resolve, reject) => {
      FourQ.generateKeyPair((e, keypair) => {
        if (e) { console.error(e); reject(e); return; }
        console.log(keypair);
        FourQ.sign(message, keypair.secretKey, (e2, sig) => {
          if (e2) { console.error(e2); reject(e2); return; }
          console.log(sig);
          const count = 2;
          const sigs = []; for (let i = 0; i < count; ++i) { sigs.push(sig); }
          const msgs = []; for (let i = 0; i < count; ++i) { msgs.push(message); }
          const pkeys = []; for (let i = 0; i < count; ++i)  { pkeys.push(keypair.publicKey); }
          FourQ.batch(count).verify(sigs, msgs, pkeys, (e3, result) => {
            if (e3) { console.error(e3); reject(e3); return; }
            console.log(result);
            resolve(result);
          });
        });
      });
    });
  }
}
