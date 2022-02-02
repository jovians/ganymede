/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { AsyncWorkerClient, AsyncWorkerExecutor } from '../../components/util/server/async.worker.proc';
import { SecureChannel, SecureChannelPeer } from '../../components/util/shared/crypto/secure.channel';
import { FourQ } from '@jovian/fourq';

const thisWorkerFile = `${__dirname}/http.shim.worker.security.js`;

export class WebSocketServerWorkerClient extends AsyncWorkerClient {
  static workerFile = thisWorkerFile;
  constructor(workerData: any) { super(workerData, WebSocketServerWorkerClient.workerFile); }
  signMessage(msgBase64: string) { return this.call<string>(`signMessage`, msgBase64, r => r); }
  newChannel(peerInfo: SecureChannelPeer) {
    const peerInfoEncoded = JSON.stringify({
      ecdhPublicKey: peerInfo.ecdhPublicKey.toString('base64'),
      iden: peerInfo.iden,
      data: peerInfo.data,
    });
    return this.call<SecureChannel>(`newChannel`, peerInfoEncoded, r => SecureChannel.fromJSON(r));
  }
}

export class WebSocketServerWorkerLogic extends AsyncWorkerExecutor {
  signingKey: Buffer;
  constructor(workerData: any) {
    super(workerData);
    this.signingKey = Buffer.from(workerData.signingKey, 'base64');
    this.setAsReady();
  }
  handleAction(callId: string, action: string, payload?: string) {
    switch (action) {
      case 'signMessage':
        const sig = FourQ.sign(Buffer.from(payload, 'base64'), this.signingKey);
        return this.returnCall(callId, sig.data.toString('base64'));
      case 'newChannel':
        const peerInfo: SecureChannelPeer = JSON.parse(payload);
        peerInfo.ecdhPublicKey = Buffer.from(peerInfo.ecdhPublicKey as unknown as string, 'base64');
        const channel = new SecureChannel(peerInfo.type, 'generate', JSON.parse(payload));
        return this.returnCall(callId, channel.toJSON());
    }
  }
}

if (process.env.WORKER_DATA_BASE64) {
  const workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
  if (workerData.workerFile === thisWorkerFile) { new WebSocketServerWorkerLogic(workerData).getSelf(); }
}
