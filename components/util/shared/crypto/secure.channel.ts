/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { FourQ, DiffieHellmanKeyPair, CryptoScheme } from '@jovian/fourq';
import { isNodeJs } from '../../shared/common';

const crypto: any = isNodeJs ? require('crypto') : window.crypto.subtle;

const verticalBarBuffer = Buffer.from('|', 'ascii');

export enum SecureChannelTypes {
  NONE = 'NONE',
  DEFAULT = 'ECC_4Q',
  ECC_4Q = 'ECC_4Q',
}

export interface SecureChannelPeer {
  type?: SecureChannelTypes;
  ecdhPublicKey: Buffer;
  signaturePublicKey?: Buffer;
  iden?: any;
  data?: any;
}

export interface SecureChannelPayload {
  /** SecureChannelPayload flag */
  __scp: boolean;
  /** channelId */
  c: string;
  /** nonce in base64 (unique each payload) */
  n: string;
  /** encrypted payload in base64 */
  p: string;
}

export class SecureChannel {
  static API_PATH_PUBLIC_INFO = '/public-info';
  static API_PATH_NEW_CHANNEL = '/secure-channel';
  static API_PATH_SECURE_API = '/secure-api';
  static getIdentityFrom(privateKey: string) {
    return FourQ.generateIdentity(Buffer.from(privateKey, 'base64'));
  }
  static getPublicKeyFrom(privateKey: string) {
    return FourQ.generateIdentity(Buffer.from(privateKey, 'base64')).publicKeySchnorr.toString('base64');
  }
  static fromJSON(json: string) {
    const a = new SecureChannel();
    return a.fromJSONObject(JSON.parse(json));
  }
  static getAccessor(user: string, baseToken: string | Buffer, nonceHex?: string) {
    let timeHex = Date.now().toString(16);
    if (timeHex.length % 2 === 1) { timeHex = '0' + timeHex; }
    if (!nonceHex) { nonceHex = randHex(16); }
    const accessorParts = [user, timeHex, nonceHex];
    const accessorBuffer = Buffer.from(user, 'ascii');
    const nonceBuffer = Buffer.from(nonceHex, 'hex');
    const timeBuffer = Buffer.from(timeHex, 'hex');
    const baseTokenBuffer = typeof baseToken === 'string' ? Buffer.from(baseToken, 'base64') : baseToken;
    const accessorSecret = saltedSha512(baseTokenBuffer, accessorBuffer);
    const oneTimeHash = saltedSha512(accessorSecret, timeBuffer, nonceBuffer).toString('base64');
    accessorParts.push(oneTimeHash);
    return accessorParts.join('.');
  }
  static getAccessorHeader(user: string, baseToken: string | Buffer, nonceHex?: string) {
    return `Accessor ${SecureChannel.getAccessor(user, baseToken, nonceHex)}`;
  }
  static verifyAccessor(accessorExpression: string, baseToken: string | Buffer, timeWindow = 5000) {
    const accessorData = accessorExpression.split('.');
    const accessor = accessorData[0];
    const accessorBuffer = Buffer.from(accessor, 'ascii');
    const timeHex = accessorData[1];
    const nonceHex = accessorData[2];
    const nonceBuffer = Buffer.from(nonceHex, 'hex');
    const timeBuffer = Buffer.from(timeHex, 'hex');
    const oneTimeHash = accessorData[3];
    const baseTokenBuffer = typeof baseToken === 'string' ? Buffer.from(baseToken, 'base64') : baseToken;
    const accessorSecret = saltedSha512(baseTokenBuffer, accessorBuffer);
    const expectedHash = saltedSha512(accessorSecret, timeBuffer, nonceBuffer).toString('base64');
    if (oneTimeHash !== expectedHash) { return null; }
    const t = parseInt(timeHex, 16);
    if (Math.abs(Date.now() - t) > timeWindow) { return null; }
    return { accessor, t };
  }
  static verifyStamp(sigData: { sig: string; payload: string; }, publicKey: string | Buffer) {
    if (!publicKey || !sigData || !sigData.sig || !sigData.payload) { return null; }
    const payloadBuffer = Buffer.from(sigData.payload, 'ascii');
    const publicKeyBuffer = typeof publicKey === 'string' ? Buffer.from(publicKey, 'base64') : publicKey;
    const valid = FourQ.verify(Buffer.from(sigData.sig, 'base64'), payloadBuffer, publicKeyBuffer);
    if (!valid) { return null; }
    return sigData;
  }
  type: SecureChannelTypes;
  channelId: string;
  peerInfo: SecureChannelPeer = { ecdhPublicKey: null };
  localKeyPair: DiffieHellmanKeyPair;
  sharedSecret: Buffer = null;
  expires: number = 0;
  pregeneratedNonce: Buffer;

  constructor(type?: SecureChannelTypes, channelId?: string, peerInfo?: SecureChannelPeer, localKeypair?: DiffieHellmanKeyPair) {
    this.type = type ? type : SecureChannelTypes.DEFAULT;
    this.channelId = !channelId || channelId === 'generate' ? FourQ.randomBytes(16).toString('base64') : channelId;
    this.pregeneratedNonce = FourQ.randomBytes(32);
    if (peerInfo) { this.fromPeerPublicKey(peerInfo, localKeypair); }
    this.refreshNonce();
  }

  fromPeerPublicKey(peerInfo: SecureChannelPeer, localKeypair?: DiffieHellmanKeyPair) {
    this.peerInfo = peerInfo; // Buffer.from(peerPubKeyB64, 'base64');
    this.localKeyPair = localKeypair ? localKeypair : FourQ.ecdhGenerateKeyPair();
    if (this.peerInfo.ecdhPublicKey.length === 32) {
      this.sharedSecret = FourQ.getSharedSecret(this.localKeyPair.secretKey, this.peerInfo.ecdhPublicKey);
    }
    return this;
  }

  refreshNonce() {
    this.pregeneratedNonce = FourQ.randomBytes(32);
  }

  fromJSONObject(src: any) {
    this.type = src.type;
    this.channelId = src.channelId;
    this.peerInfo = {
      ecdhPublicKey: src.peerPublicKeyB64 ? Buffer.from(src.peerPublicKeyB64, 'base64') : null,
      signaturePublicKey: src.peerSignaturePublicKeyB64 ? Buffer.from(src.peerSignaturePublicKeyB64, 'base64') : null,
      iden: src.peerIden,
      data: src.peerData,
    };
    this.localKeyPair = {
      isDH: true,
      type: CryptoScheme.FourQ,
      publicKey: src.localKeyPairPublicKeyB64 ? Buffer.from(src.localKeyPairPublicKeyB64, 'base64') : null,
      secretKey: src.localKeyPairPublicKeyB64 ? Buffer.from(src.localKeyPairSecretKeyB64, 'base64') : null,
    };
    if (src.sharedSecretB64) {
      this.sharedSecret = Buffer.from(src.sharedSecretB64, 'base64');
    } else {
      this.fromPeerPublicKey(this.peerInfo, this.localKeyPair.publicKey ? this.localKeyPair : null);
    }
    this.expires = src.expires;
    return this;
  }

  toJSON() {
    return JSON.stringify({
      type: this.type,
      channelId: this.channelId,
      peerIden: this.peerInfo.iden,
      peerData: this.peerInfo.data,
      peerPublicKeyB64: this.peerInfo.ecdhPublicKey ? this.peerInfo.ecdhPublicKey.toString('base64') : null,
      peerSignaturePublicKeyB64: this.peerInfo.signaturePublicKey ? this.peerInfo.signaturePublicKey.toString('base64') : null,
      localKeyPairPublicKeyB64: this.localKeyPair ? this.localKeyPair.publicKey.toString('base64') : null,
      localKeyPairSecretKeyB64: this.localKeyPair ? this.localKeyPair.secretKey.toString('base64') : null,
      sharedSecretB64: this.sharedSecret ? this.sharedSecret.toString('base64') : null,
      expires: this.expires,
    });
  }

  createWrappedPayloadFromBuffer(payload: Buffer) {
    const sharedKey64Bytes = Buffer.concat([this.pregeneratedNonce, this.sharedSecret]);
    const keyHash = crypto.createHash('sha512').update(sharedKey64Bytes).digest();
    const wrapped: SecureChannelPayload = {
      __scp: true,
      c: this.channelId,
      n: this.pregeneratedNonce.toString('base64'),
      p: FourQ.xorCryptSHA512(keyHash, payload).toString('base64'),
    };
    this.refreshNonce();
    return wrapped;
  }

  createWrappedPayload(payload: string | Buffer) {
    if (typeof payload === 'string') {
      return this.createWrappedPayloadFromBuffer(Buffer.from(payload, 'utf8'));
    } else {
      return this.createWrappedPayloadFromBuffer(payload);
    }
  }

  createWrappedPayloadObject(obj: any) {
    return this.createWrappedPayloadFromBuffer(Buffer.from(JSON.stringify(obj), 'utf8'));
  }

  createWrappedPayloadString(obj: any) {
    return JSON.stringify(this.createWrappedPayloadObject(obj));
  }

  createWrappedPayloadBase64(obj: any) {
    return Buffer.from(this.createWrappedPayloadString(obj), 'utf8').toString('base64');
  }

  decryptSecureChannelPayloadObject(wrapped: SecureChannelPayload, outputEncoding = 'utf8') {
    const nonce = Buffer.from(wrapped.n, 'base64');
    const sharedKey64Bytes = Buffer.concat([nonce, this.sharedSecret]);
    const keyHash = crypto.createHash('sha512').update(sharedKey64Bytes).digest();
    const payloadEnc = Buffer.from(wrapped.p, 'base64');
    switch (outputEncoding) {
        case 'utf8': {
          return FourQ.xorCryptSHA512(keyHash, payloadEnc).toString('utf8');
        }
        default: {
          return FourQ.xorCryptSHA512(keyHash, payloadEnc);
        }
    }
  }

  decryptSecureChannelPayload(wrapped: SecureChannelPayload) {
    return this.decryptSecureChannelPayloadObject(wrapped) as Buffer;
  }

  decryptSecureChannelPayloadIntoString(wrapped: SecureChannelPayload) {
    return this.decryptSecureChannelPayloadObject(wrapped, 'utf8') as string;
  }

  decryptPayloadBase64(payloadStrB64: string) {
    const payload = this.parseWrappedPayloadString(Buffer.from(payloadStrB64, 'base64').toString('utf8'));
    return this.parseSecureChannelPayloadIntoObject(payload);
  }

  parseSecureChannelPayloadIntoObject(wrapped: SecureChannelPayload) {
    return JSON.parse(this.decryptSecureChannelPayloadIntoString(wrapped));
  }

  parseWrappedPayloadString(payloadStr: string) {
    return JSON.parse(payloadStr) as SecureChannelPayload;
  }

  parseWrappedPayloadBase64(payloadStrB64: string) {
    return this.parseWrappedPayloadString(Buffer.from(payloadStrB64, 'base64').toString('utf8'));
  }

}

export function saltedXorCrypt(payload: Buffer, secret: Buffer, ...salts: Buffer[]) {
  return FourQ.xorCryptSHA512(saltedSha512(secret, ...salts), payload);
}

export function saltedSha512(message: Buffer, ...salts: Buffer[]) {
  const sharedKey64Bytes = Buffer.concat([...salts, message]);
  return crypto.createHash('sha512').update(sharedKey64Bytes).digest() as Buffer;
}

export function saltedDomainSha512(message: Buffer, domain: Buffer, ...salts: Buffer[]) {
  const sharedKey64Bytes = Buffer.concat([domain, verticalBarBuffer, ...salts, verticalBarBuffer, message]);
  return crypto.createHash('sha512').update(sharedKey64Bytes).digest() as Buffer;
}

export function randHex(length: number) {
  const characters = '0123456789abcdef';
  const str = [];
  for (let i = 0; i < length; ++i) {
    str.push(characters[Math.floor(Math.random() * 16)]);
  }
  return str.join('');
}
