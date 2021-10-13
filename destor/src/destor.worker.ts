/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { AsyncWorkerClient, AsyncWorkerExecutor } from '../../components/util/server/async.worker.proc';

const thisWorkerFile = `${__dirname}/destor.worker.js`;

export class DestorWorkerClient extends AsyncWorkerClient {
  static workerFile = thisWorkerFile;
  constructor(workerData: any) { super(workerData, DestorWorkerClient.workerFile); }
}

export class DestorWorkerLogic extends AsyncWorkerExecutor {
  constructor(workerData: any) {
    super(workerData);
  }
}

if (process.env.WORKER_DATA_BASE64) {
  const workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
  if (workerData.workerFile === thisWorkerFile) {
    new DestorWorkerLogic(workerData).getSelf();
  }
}
