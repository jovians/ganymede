/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { AsyncWorkerClient, AsyncWorkerExecutor, startWorker } from '../../../components/util/server/async.worker.proc';
import * as os from 'os';

const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const pty = require('node-pty');
// const keypress = require('keypress');

const thisWorkerFile = __filename;

export class ShellPassthruWorkerClient extends AsyncWorkerClient {
  static workerFile = thisWorkerFile;
  constructor(workerData: any) {
    super(workerData, ShellPassthruWorkerClient.workerFile);
    this.setHandler('$outputData', message => {
      this.ixRx<string>('output').next(message);
    });
    this.setHandler('$sessionClose', () => {
      this.ixRx<null>('sessionClose').next(null);
    });
  }
  get output$() { return this.ixRx<string>('output').obs(); }
  get close$() { return this.ixRx<string>('sessionClose').obs(); }
  resize(col: number, row: number) {
    return this.call<{col: number, row: number}, void>(`resize`, JSON.stringify({ col, row }));
  }
  inputData(input: string) { return this.call<string>(`inputData`, input, r => r); }
}

export class ShellPassthruWorkerLogic extends AsyncWorkerExecutor {
  signingKey: Buffer;
  ptyProcess: any;
  constructor(workerData: any) {
    super(workerData);
    this.setUpShellPassthru();
    this.setAsReady();
  }
  setUpShellPassthru() {
    // const argv = yargs(hideBin(process.argv)).argv;
    const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';
    let exited = false;
    this.ptyProcess = pty.spawn(shell, [], {
      name: 'xterm-color',
      cols: process.stdout.columns,
      rows: process.stdout.rows,
      cwd: process.env.HOME,
      env: process.env
    });
    this.ptyProcess.on('data', data => {
      if (exited) { return; }
      this.returnCall('$outputData', data);
    });
    this.ptyProcess.on('close', () => {
      this.returnCall('$sessionClose');
      exited = true;
    });
  }
  outputData(data: string) {
    this.returnCall('$outputData', data);
  }
  async handleAction(callId: string, action: string, payload?: string) {
    switch (action) {
      case 'inputData':
        this.ptyProcess.write(Buffer.from(payload, 'base64'));
        this.returnCall(callId, 'ACK');
        break;
      case 'resize':
        const spec: { col: number; row: number } = JSON.parse(payload);
        this.ptyProcess.resize(spec.col, spec.row);
        this.returnCall(callId, 'ACK');
        break;
    }
  }
}

startWorker(thisWorkerFile, ShellPassthruWorkerLogic);

