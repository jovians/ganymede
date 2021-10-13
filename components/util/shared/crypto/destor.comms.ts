/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { SecureComm, SecureRequest } from './secure.comm';

export class DestorComms {

  currentDestor: any;
  destorComms: { [endpoint: string]: SecureComm } = {};
  recentError: Error;
  defaultTimeout = 7000;

  get currentComm() {
    return this.getDestorComm(this.currentDestor);
  }

  async getDestorComm(destor: any) {
    const endpoint: string = destor.endpoint;
    if (!this.destorComms[destor.endpoint]) {
      this.destorComms[destor.endpoint] = new SecureComm({
          endpoint: destor.endpoint,
          token: destor.token,
          trust: destor.trust,
      });
    }
    const comm = this.destorComms[endpoint];
    if (!(await comm.waitForChannel())) { return null; }
    return comm;
  }

  target(destor: any) {
    this.currentDestor = destor;
    return this;
  }

  async get(reqObj: SecureRequest) {
    return (await this.currentComm).get(reqObj);
  }

  async post(reqObj: SecureRequest) {
    return (await this.currentComm).post(reqObj);
  }

  async makeRequest(reqObj: SecureRequest) {
    return (await this.currentComm).makeRequest(reqObj);
  }

}
