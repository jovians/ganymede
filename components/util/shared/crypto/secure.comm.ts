/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as axios from 'axios';
import { FourQ } from '@jovian/fourq';
import { v4 as uuidv4 } from 'uuid';

import { SecureChannel, SecureChannelPeer, SecureChannelTypes, SecureHandshake } from './secure.channel';

export interface SecureCommConfig {
  endpoint: string;
  token?: string;
  trust?: string;
  encryptedChannelPath?: string;
  encryptedApiPath?: string;
  defaultTimeout?: number;
  defaultChannelExpire?: number;
  useRawPath?: boolean;
}

export interface SecureRequest {
  id?: string;
  method?: string;
  path: string;
  data?: any;
  timeout?: number;
  useRawPath?: boolean;
}

export class SecureComm {
  pending: Promise<boolean>;
  config: SecureCommConfig;
  channel: SecureChannel;
  error: Error;
  errors: Error[] = [];

  constructor(config: SecureCommConfig) {
    if (!config.token) { config.token = ''; }
    if (!config.encryptedChannelPath) { config.encryptedChannelPath = SecureChannel.API_PATH_NEW_CHANNEL; }
    if (!config.encryptedApiPath) { config.encryptedApiPath = SecureChannel.API_PATH_SECURE_API; }
    if (!config.defaultTimeout) { config.defaultTimeout = 3600; }
    if (!config.defaultChannelExpire && config.defaultChannelExpire !== 0) { config.defaultChannelExpire = 3600; }
    this.config = config;
    this.pending = this.channelInit();
  }

  pushError(e: Error) {
    this.error = e;
    this.errors.push(e);
  }

  getAuthHeader(token: string, channelPubKeyB64: string, channelExp?: number) {
    const headerResult = SecureHandshake.getAuthHeader('internal', channelPubKeyB64, token);
    return headerResult?.data;
  }

  channelInit() {
    const config = this.config;
    const ecdhKeypair = FourQ.ecdhGenerateKeyPair();
    return new Promise<boolean>(async resolve => {
      try {
        const channelMyPubkey = ecdhKeypair.publicKey.toString('base64');
        const res = await axios.default.get(`${config.endpoint}${config.encryptedChannelPath}`, {
          timeout: 5000, headers: {
            Authorization: this.getAuthHeader(config.token, channelMyPubkey, config.defaultChannelExpire),
          }
        });
        if (res.status !== 200) { return resolve(false); }
        const pubkey = config.trust ? Buffer.from(config.trust.split('::')[1], 'base64') : null;
        const sigData = res.data.result;
        if (config.trust) {
          const validResult = SecureHandshake.verifyStamp(sigData, pubkey);
          if (!validResult || validResult.bad || !validResult.data) {
            return resolve(false);
          }
        }
        const peerInfo: SecureChannelPeer = { ecdhPublicKey: Buffer.from(sigData.publicKey, 'base64') };
        if (config.trust) { peerInfo.signaturePublicKey = pubkey; }
        const channel = new SecureChannel(SecureChannelTypes.ECC_4Q, sigData.channelId, peerInfo, ecdhKeypair);
        this.channel = channel;
        this.pending = null;
        return resolve(true);
      } catch (e) { return resolve(false); }
    });
  }

  async waitForChannel() {
    if (this.pending) {
      const res = await this.pending;
      if (!res) { return false; }
    }
    return true;
  }

  async get(reqObj: SecureRequest) {
    reqObj.method = 'GET';
    return await this.makeRequest(reqObj);
  }

  async post(reqObj: SecureRequest) {
    reqObj.method = 'POST';
    return await this.makeRequest(reqObj);
  }

  async makeRequest(reqObj: SecureRequest) {
    return new Promise<any>(async resolve => {
      if (!(await this.waitForChannel())) {
        this.pushError(new Error(`Unable to get channel on endpoint ${this.config.endpoint}`));
        return resolve(null);
      }
      try {
        const timeout = reqObj.timeout ? reqObj.timeout : this.config.defaultTimeout;
        const encPayload = this.channel.createWrappedPayloadBase64({
          id: uuidv4(),
          path: reqObj.path,
          data: reqObj.data,
        });
        const reqPath = (reqObj.useRawPath || this.config.useRawPath) ? reqObj.path : this.config.encryptedApiPath;
        if (!reqObj.path) { reqObj.path = '/'; }
        if (!reqObj.path.startsWith('/')) { reqObj.path = '/' + reqObj.path; }
        const reqOpts = { timeout, headers: { Authorization: this.getAuthHeader(this.config.token, this.channel.channelId) } };
        switch (reqObj.method) {
          case 'GET': {
            axios.default.get(`${this.config.endpoint}${reqPath}?__enc=${encPayload}`, reqOpts)
              .then(res => { resolve(this.unwrapEncryptedResponse(res)); })
              .catch(e => { this.pushError(e); resolve(null); });
            break;
          }
          case 'PUT': {
            axios.default.put(`${this.config.endpoint}${reqPath}`, reqOpts)
              .then(res => { resolve(this.unwrapEncryptedResponse(res)); })
              .catch(e => { this.pushError(e); resolve(null); });
            break;
          }
          case 'POST': {
            axios.default.post(`${this.config.endpoint}${reqPath}`, reqOpts)
              .then(res => { resolve(this.unwrapEncryptedResponse(res)); })
              .catch(e => { this.pushError(e); resolve(null); });
            break;
          }
          case 'PATCH': {
            axios.default.patch(`${this.config.endpoint}${reqPath}`, reqOpts)
              .then(res => { resolve(this.unwrapEncryptedResponse(res)); })
              .catch(e => { this.pushError(e); resolve(null); });
            break;
          }
          case 'DELETE': {
            axios.default.delete(`${this.config.endpoint}${reqPath}`, reqOpts)
              .then(res => { resolve(this.unwrapEncryptedResponse(res)); })
              .catch(e => { this.pushError(e); resolve(null); });
            break;
          }
        }
      } catch (e) {
        this.pushError(e);
        resolve(null);
      }
    });
  }

  private unwrapEncryptedResponse(res) {
    const responseText = this.channel.decryptSecureChannelPayloadIntoString(res.data.payload);
    switch (res.data.format) {
      case 'json':
        return JSON.parse(responseText);
      default:
        return null;
    }
  }
}
