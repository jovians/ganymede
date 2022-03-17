/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { VsphereInfra, VsphereDatacenter } from 'vsphere-infra';
import { Mo } from 'vsphere-infra/src/vsphere-soap/managed.objects';

import { AsyncWorkerClient, AsyncWorkerExecutor } from '../../../../../components/util/server/async.worker.proc';
import { getProcessResourceSnapshot, ProcessResourceSnapshot } from '../../../../../server/src/util/process.resource';

export class ExtInfraWorkerClient extends AsyncWorkerClient {
  static workerFile = __filename;
  constructor(workerData: any) { super(workerData, ExtInfraWorkerClient.workerFile); }
  processResourceSnapshot() { return this.call<ProcessResourceSnapshot>(`processResourceSnapshot`, '', r => JSON.parse(r)); }
  inventoryChangedLast() { return this.call<number>(`inventoryChangedLast`, '', response => parseInt(response, 10)); }
  inventorySerialized() { return this.call(`inventorySerialized`); }
  u9nChangedLast() { return this.call<number>(`u9nChangedLast`, '', response => parseInt(response, 10)); }
  u9nSerialized() { return this.call(`u9nSerialized`);  }
  getEntities(entityKeys: string[]) { return this.call(`getEntities`, JSON.stringify(entityKeys));  }
  failureHeat() { return this.call<{error: number, defunct: number}>(`failureHeat`, '', r => JSON.parse(r));  }
}
const thisWorkerClass = ExtInfraWorkerClient;

export class ExtInfraWorkerLogic extends AsyncWorkerExecutor {
  private vcenter: VsphereDatacenter;
  constructor(workerData: any) {
    super(workerData);
    VsphereInfra.grant();
    const vinfra = new VsphereInfra(this.mainScope);
    vinfra.behavior.setVerbose(true);
    // vinfra.behavior.setJsonLogs(true);
    vinfra.getDatacenter(workerData).then(vc => {
      this.vcenter = vc;
      this.vcenter.updateInventoryInterval(60);
      this.setAsReady();
    });
  }
  async handleAction(callId: string, action: string, payload?: string) {
    if (!this.vcenter) { return this.returnCall(callId); }
    switch (action) {
      case 'processResourceSnapshot': return this.returnCall(callId, JSON.stringify(getProcessResourceSnapshot()));
      case 'inventoryChangedLast': return this.returnCall(callId, this.vcenter.inventoryChangedLast + '');
      case 'inventorySerialized': return this.returnCall(callId, this.vcenter.inventorySerialized);
      case 'u9nChangedLast': return this.returnCall(callId, this.vcenter.u9n ? this.vcenter.u9n.t + '' : '-1');
      case 'u9nSerialized': return this.returnCall(callId, this.vcenter.u9nSerialized);
      case 'getEntities': return this.returnCall(callId, await this.getEntities(JSON.parse(payload)));
      case 'failureHeat': return this.returnCall(callId, JSON.stringify({
        error: this.vcenter.ixReconn.errorHeat.value,
        defunct: this.vcenter.ixReconn.defunctHeat.value
      }));
    }
  }
  async getEntities(entityKeys: string[]) {
    const entities = await this.vcenter.getMany(entityKeys);
    for (const entity of entities) { await entity.refresh(); }
    const entitiesObjects = await Promise.all(entities.map(async entity => {
      const obj = JSON.parse(entity.serialize());
      // obj.rawSource = entity.getSourceData();
      // if (entity.$type === 'VirtualMachine') {
      //   const host = (await this.vcenter.getMany([(entity as Mo.VirtualMachine).runtime.host]))[0] as Mo.HostSystem;
      //   obj.cpuHz = host.hardware.cpuInfo.hz;
      // }
      return obj;
    }));
    return JSON.stringify(entitiesObjects);
  }
}

if (process.env.WORKER_DATA_BASE64) {
  const workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
  if (workerData.workerFile === thisWorkerClass.workerFile) {
    new ExtInfraWorkerLogic(workerData).getSelf();
  }
}
