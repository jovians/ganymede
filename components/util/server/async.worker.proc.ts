/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ChildProcess, spawn, execSync } from 'child_process';
import { ix } from '@jovian/type-tools';
import { v4 as uuidv4 } from 'uuid';
import * as os from 'os';

import { log } from '../shared/logger';

export type AsyncActionHandler = (payload: string, worker?: AsyncWorkerExecutor,
                                  callId?: string, action?: string) => (string | Promise<string>);
export interface AsyncActionHandlers {
  [actionName: string]: AsyncActionHandler;
}

export class AsyncWorkerClient {
  static logger = log;
  static nullAction() {}
  workerData: any;
  proc: ChildProcess;
  responseFor = '';
  invokeMap: {[callId: string]: (msg: string) => any} = {};
  initPromise: Promise<void> = null;
  initResolver: any;
  terminating = false;
  terminated = false;
  duration = null;
  startTime = Date.now();
  endTime: number = null;
  onterminate: (() => any)[] = [];
  constructor(workerData: any, workerFile: string) {
    if (!workerData) { workerData = {}; }
    this.initPromise = new Promise<void>(resolve => { this.initResolver = resolve; });
    workerData.workerFile = workerFile;
    this.workerData = workerData;
    this.proc = spawn('node', ['--max-old-space-size=262144', workerFile], {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
      env: {
        ...process.env,
        WORKER_DATA_BASE64: Buffer.from(JSON.stringify(workerData), 'utf8').toString('base64')
      }
    });
    this.proc.on('message', messageSerial => {
      const message = messageSerial as string;
      if (this.responseFor) {
        this.handleResponse(this.responseFor, message);
      } else {
        this.responseFor = message;
      }
    });
  }

  call<T = string>(action: string, payload: string = '', parser?: (response: string) => T) {
    const callId = `${action}::${uuidv4()}`;
    return new Promise<T>(async resolve => {
      if (this.terminating || this.terminated) { return resolve(null); }
      if (!payload) { payload = ''; }
      if (!parser) { parser = response => response as unknown as T; }
      await Promise.resolve(this.initPromise);
      this.invokeMap[callId] = response => {
        try {
          if (response === '' || response === null) {
            resolve(null);
          } else {
            try {
              const res = parser(response);
              resolve(res !== null ? res : null);
            } catch (e) {
              resolve(null);
            }
          }
        } catch (e) { resolve(null); }
      };
      this.proc.send(callId);
      this.proc.send(payload);
    });
  }

  import(scriptFile: string) {
    return this.call<boolean>(`$import`, scriptFile, r => r ? true : false);
  }

  terminate(exitCode: number = 0) {
    return this.call('$terminate', exitCode + '');
  }

  handleResponse(callId: string, message: string) {
    this.responseFor = '';
    if (callId.startsWith('$')) {
      switch (callId) {
        case '$init':
          if (this.initResolver) { this.initResolver(); }
          this.initResolver = this.initPromise = null;
          return;
        case '$termination_set':
          this.terminating = true;
          for (const cb2 of this.onterminate) { try { cb2(); } catch (e) {} }
          return;
        case '$terminated':
          this.terminated = true;
          this.endTime = Date.now();
          this.duration = this.endTime - this.startTime;
          return;
      }
    }
    const cb = this.invokeMap[callId];
    if (cb) { cb(message); delete this.invokeMap[callId]; }
  }



}

export class AsyncWorkerExecutor {
  static logger = log;
  terminating = false;
  mainScope: ix.MajorScope;
  workerData: any;
  data: {[key: string]: any} = {};
  requestFor = '';
  invokeMap: {[callId: string]: (msg: string) => any} = {};
  customAction: {[actionName: string]: AsyncActionHandler} = {};
  constructor(workerData: any) {
    process.on('unhandledRejection', e => {
      // tslint:disable-next-line: no-console
      console.warn('[WARNING] UnhandledRejection:', e);
    });
    this.workerData = workerData;
    process.on('message', async messageSerial => {
      const message = messageSerial as string;
      if (this.requestFor) {
        this.handleRequest(this.requestFor, message);
      } else {
        this.requestFor = message;
      }
    });
    const scope = workerData.scopeName ? workerData.scopeName : 'unnamed_scope';
    this.mainScope = new ix.MajorScope(scope + `(${process.pid})`);
    if (workerData.coreAffinity !== null && workerData.coreAffinity !== undefined) {
      let core = workerData.coreAffinity;
      if (core === 'auto' && workerData.workerId !== null && workerData.workerId !== undefined) {
        core = (workerData.workerId % os.cpus().length) + '';
      }
      if (process.platform === 'linux') { execSync(`taskset -cp ${core} ${process.pid}`, {stdio: 'inherit'}); }
    }
  }
  getSelf() { return this; }
  setAsReady() { this.returnCall('$init'); }
  returnCall(callId: string, response?: string) {
    if (!response) { response = ''; }
    process.send(callId);
    process.send(response);
  }
  addCustomAction(actionName: string, handler: AsyncActionHandler) {
    this.customAction[actionName] = handler;
  }
  async handleRequest(callId: string, payload?: string) {
    this.requestFor = '';
    const action = callId.split('::')[0];
    switch (action) {
      case '$terminate': {
        if (this.terminating) { break; }
        this.terminating = true;
        const exitCode = payload ? parseInt(payload, 10) : 0;
        this.ontermination().finally(() => {
          this.returnCall('$terminated');
          setTimeout(() => process.exit(exitCode), 1000);
        });
        return this.returnCall('$termination_set');
      }
      case '$import': {
        try {
          const module = require(payload);
          if (module.workerExtension) {
            for (const actionName of Object.keys(module.workerExtension)) {
              this.addCustomAction(actionName, module.workerExtension[actionName]);
            }
          }
        } catch (e) {}
        return this.returnCall(callId, '');
      }
    }
    const res = this.handleAction(callId, action, payload);
    if (!res && this.customAction[action]) {
      let resStr = await Promise.resolve(this.customAction[action](payload, this, callId, action));
      if (!resStr) { resStr = ''; }
      this.returnCall(callId, resStr);
    }
  }
  handleAction(callId: string, action: string, payload?: string): any {}
  async ontermination() {}
}
