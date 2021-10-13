/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { GanymedeHttpServer, HttpOp, HttpBaseLib, HTTP, ReqProcessor, HttpCode } from '../../../../../server/src/http.shim';
import { secrets } from '../../../../../components/util/server/secrets.resolver';
import { log } from '../../../../../components/util/shared/logger';

import { ExtInfraWorkerClient } from './native.infra.server.worker';

const scopeName = `ext-infra;pid=${process.pid}`;

export class NativeInfraExtensionServer extends GanymedeHttpServer {
  // appServer: GanymedeHttpServer;
  // iface = 'json';
  extData: any;
  vcenters: { [key: string]: ExtInfraWorkerClient } = {};
  vcentersDefunct: {[key: string]: any } = {};

  cache = {
    inventoryData: this.cacheDefine<object>({ path: `native.infra.inventoryData` }),
    allObjects: this.cacheDefine<object>({ path: `native.infra.allObjects/:key`, matchExactly: true }),
    quickStats: this.cacheDefine<object>({ path: `native.infra.quickStats/:key`, matchExactly: true }),
  };

  constructor(extData: any, globalConfData: any) {
    super({ type: HttpBaseLib.EXPRESS }, globalConfData);
    this.extData = extData;
    this.apiVersion = 'v1';
    this.apiPath = `${this.configGlobal.ext.basePath}/native/infra`;
    this.addDefaultProcessor(ReqProcessor.BASIC);
    this.enumerateVCenters();
  }

  async enumerateVCenters() {
    if (!this.extData.inventory.vcenter) { return; }
    if (this.extData.inventory.vcenter.type === 'fixed') {
      for (const invData of this.extData.inventory.vcenter.list) {
        const inv = JSON.parse(JSON.stringify(invData));
        if (inv.type === 'aws') {
          // TODO
        } else if (inv.type === 'gcp') {
          // TODO
        } else if (inv.type === 'azure') {
          // TODO
        } else if (inv.type === 'vcenter') {
          // continue;
          inv.username = await secrets.resolve(inv.username);
          inv.password = await secrets.resolve(inv.password);
          if (!inv.username || !inv.password) {
            console.log(`Failed to resolve credentials for '${inv.key}'`);
            continue;
          }
          inv.watch = true;

          const workerData = {
            workerFile: ExtInfraWorkerClient.workerFile,
            ...inv,
            scopeName,
          };
          if (!inv.defunct) {
            this.vcenters[inv.key] = this.addWorker(ExtInfraWorkerClient, workerData);
          } else {
            this.vcentersDefunct[inv.key] = {
              deprecated: inv.deprecated ? true : false,
              defunct: inv.defunct ? true : false,
            };
          }
        }
      }
    }
    log.info('Ganymede native.infra extension initialized.');
  }

  async beforeStart() {
    log.info('Ganymede native.infra extension server started.');
  }

  @HTTP.GET(`/inventory`)
  async getInventory(op: HttpOp) {
    op.cache.handler(this.cache.inventoryData, {}, async resolve => {
      resolve(this.extData.inventory);
    });
  }

  @HTTP.GET(`/vcenter/:key/all-objects`)
  async getAllObjects(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const cacheAccess = { version: await vc.inventoryChangedLast(), matchExactly: true };
    op.cache.handler(this.cache.allObjects, cacheAccess, async resolve => {
      const inventorySerialized = await vc.inventorySerialized();
      if (!inventorySerialized) {
        return op.endWithError(500, `NOT_READY_INV`, `[${op.req.params.key}] utilization summary not ready yet`);
      }
      resolve(JSON.parse(inventorySerialized));
    });
  }

  @HTTP.GET(`/vcenter/:key/quick-stats`)
  async getQuickStats(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const cacheAccess = { version: await vc.u9nChangedLast(), matchExactly: true };
    if (cacheAccess.version < 0) {
      return op.endWithError(500, `NOT_READY_UTIL_SUMMARY`, `[${op.req.params.key}] utilization summary not ready yet`);
    }
    op.cache.handler(this.cache.quickStats, cacheAccess, async resolve => {
      resolve(JSON.parse(await vc.u9nSerialized()));
    });
  }

  @HTTP.GET(`/vcenter/:key/watcher-resource`)
  async getWatcherResource(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const processResourceSnapshot = await vc.processResourceSnapshot();
    return op.res.returnJson(processResourceSnapshot);
  }

  @HTTP.GET(`/vcenter/:key/watcher-failure-heat`)
  async getWatcherFailureHeat(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const heatData = await vc.failureHeat();
    return op.res.returnJson(heatData);
  }

  async getVCenterByKey(op: HttpOp) {
    const key = op.req.params?.key;
    if (!key) {
      return op.raise(HttpCode.BAD_REQUEST, `PATH_PARAM_NOT_FOUND`, `'${key}' path parameter not defined.`);
    }
    if (this.vcentersDefunct[key]) {
      return op.raise(HttpCode.BAD_REQUEST, `VCENTER_DEFUNCT`, `[${key}] vCenter is defunct`);
    }
    let vc = this.vcenters[key];
    if (vc && (vc as any).then) { vc = await vc; }
    if (!vc) {
      return op.raise(HttpCode.BAD_REQUEST, `NO_VCENTER_KEY`, `[${key}] cannot find vCenter by key ${key}`);
    }
    return vc;
  }
}
