/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ix } from '@jovian/type-tools';
import { GanymedeHttpServer, HttpOp, HttpBaseLib, HTTP, ReqProcessor, HttpCode } from '../../../../../server/src/http.shim';
import { secrets } from '../../../../../components/util/server/secrets.resolver';
import { log } from '../../../../../components/util/shared/logger';
import { AWSAccountsCollator, AWSAccountServicesCollator } from 'aws-infra';
import { prefetchedCreds } from 'aws-infra/src/util/auth';

import { ExtInfraWorkerClient } from './native.infra.server.worker';

const scopeName = `ext-infra;pid=${process.pid}`;

export class NativeInfraExtensionServer extends GanymedeHttpServer {
  // appServer: GanymedeHttpServer;
  // iface = 'json';
  awsCollator = new AWSAccountsCollator();
  extData: any;
  aws: { [key: string]: AWSAccountServicesCollator } = {};
  awsDefunct: {[key: string]: any } = {};
  vcenter: { [key: string]: ExtInfraWorkerClient } = {};
  vcenterDefunct: {[key: string]: any } = {};

  cache = {
    inventoryData: this.cacheDefine<object>({ path: `native.infra.inventoryData` }),
    aws: {
      ec2: this.cacheDefine<object>({ path: `native.infra.aws.ec2-list/:key`, matchExactly: true }),
    },
    vcenter: {
      allObjects: this.cacheDefine<object>({ path: `native.infra.vcenter.all-objects/:key`, matchExactly: true }),
      quickStats: this.cacheDefine<object>({ path: `native.infra.vcenter.quick-stats/:key`, matchExactly: true }),
    },
  };

  constructor(extData: any, globalConfData: any) {
    super({ type: HttpBaseLib.EXPRESS }, globalConfData);
    this.extData = extData;
    this.apiVersion = 'v1';
    this.apiPath = `${this.configGlobal.ext.basePath}/native/infra`;
    this.addDefaultProcessor(ReqProcessor.BASIC);
    this.initializeAll();
  }

  async initializeAll() {
    await Promise.all([
      this.enumerateVCenters(),
      this.enumerateAWS(),
    ]);
    log.info('Ganymede native.infra extension initialized.');
  }

  async enumerateAWS() {
    if (!this.extData.inventory.aws) { return; }
    if (this.extData.inventory.aws.type === 'fixed') {
      for (const invData of this.extData.inventory.aws.list) {
        const inv = JSON.parse(JSON.stringify(invData));
        if (inv.type === 'aws') {
          (async () => {
            this.aws[inv.key] = await this.awsCollator.addAccount({
              key: inv.key, credentialsResolver: prefetchedCreds({
                accessKeyId: await secrets.resolve(inv.username),
                secretAccessKey: await secrets.resolve(inv.password),
                sessionToken: inv.sessionToken ? await secrets.resolve(inv.sessionToken) : null,
              }),
            });
          })();
        }
      }
    }
  }

  async enumerateVCenters() {
    if (!this.extData.inventory.vcenter) { return; }
    if (this.extData.inventory.vcenter.type === 'fixed') {
      for (const invData of this.extData.inventory.vcenter.list) {
        const inv = JSON.parse(JSON.stringify(invData));
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
          this.vcenter[inv.key] = this.addWorker(ExtInfraWorkerClient, workerData);
        } else {
          this.vcenterDefunct[inv.key] = {
            deprecated: inv.deprecated ? true : false,
            defunct: inv.defunct ? true : false,
          };
        }
      }
    }
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

  @HTTP.GET(`/aws/:key/ec2-list`)
  async AwsGetAllObjects(op: HttpOp) {
    const aws = await this.getAwsByKey(op); if (op.error) { return op.endWithError(); }
    const cacheAccess = { version: Date.now(), matchExactly: true };
    op.cache.handler(this.cache.vcenter.allObjects, cacheAccess, async resolve => {
      // const inventorySerialized = await vc.inventorySerialized();
      // if (!inventorySerialized) {
      //   return op.endWithError(500, `NOT_READY_INV`, `[${op.req.params.key}] utilization summary not ready yet`);
      // }
      resolve({
        list: [
          ...await aws.ec2.in('us-east-1').listEC2Instances(),
          ...await aws.ec2.in('us-west-1').listEC2Instances(),
          ...await aws.ec2.in('us-west-2').listEC2Instances(),
        ],
      });
    });
  }

  @HTTP.GET(`/vcenter/:key/all-objects`)
  async vCenterGetAllObjects(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const cacheAccess = { version: await vc.inventoryChangedLast(), matchExactly: true };
    op.cache.handler(this.cache.vcenter.allObjects, cacheAccess, async resolve => {
      const inventorySerialized = await vc.inventorySerialized();
      if (!inventorySerialized) {
        return op.endWithError(500, `NOT_READY_INV`, `[${op.req.params.key}] utilization summary not ready yet`);
      }
      resolve(JSON.parse(inventorySerialized));
    });
  }

  @HTTP.GET(`/vcenter/:key/quick-stats`)
  async vCenterGetQuickStats(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const cacheAccess = { version: await vc.u9nChangedLast(), matchExactly: true };
    if (cacheAccess.version < 0) {
      return op.endWithError(500, `NOT_READY_UTIL_SUMMARY`, `[${op.req.params.key}] utilization summary not ready yet`);
    }
    op.cache.handler(this.cache.vcenter.quickStats, cacheAccess, async resolve => {
      resolve(JSON.parse(await vc.u9nSerialized()));
    });
  }

  @HTTP.GET(`/vcenter/:key/watcher-resource`)
  async vCenterGetWatcherResource(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const processResourceSnapshot = await vc.processResourceSnapshot();
    return op.res.returnJson(processResourceSnapshot);
  }

  @HTTP.GET(`/vcenter/:key/watcher-failure-heat`)
  async vCenterGetWatcherFailureHeat(op: HttpOp) {
    const vc = await this.getVCenterByKey(op); if (op.error) { return op.endWithError(); }
    const heatData = await vc.failureHeat();
    return op.res.returnJson(heatData);
  }

  @HTTP.GET(`/vcenter/:key/managed-object`)
  async vCenterGetEntities(op: HttpOp) {
    const guid = op.req.params.key;
    const entityKey = guid.split(':').pop();
    const vcKey = guid.split(':')[1];
    const vc = await this.getVCenterByKey(op, vcKey); if (op.error) { return op.endWithError(); }
    const entitiesSerialized = await vc.getEntities([entityKey]);
    return op.res.returnJson(JSON.parse(entitiesSerialized)[0]);
  }

  async getAwsByKey(op: HttpOp, key?: string) {
    if (!key) { key = op.req.params?.key; }
    if (!key) {
      return op.raise(HttpCode.BAD_REQUEST, `PATH_PARAM_NOT_FOUND`, `'${key}' path parameter not defined.`);
    }
    if (this.awsDefunct[key]) {
      return op.raise(HttpCode.BAD_REQUEST, `AWS_ACCOUNT_DEFUNCT`, `[${key}] AWS Account is defunct`);
    }
    let awsAcc = this.aws[key];
    if (awsAcc && (awsAcc as any).then) { awsAcc = await awsAcc; }
    if (!awsAcc) {
      return op.raise(HttpCode.BAD_REQUEST, `NO_AWS ACCOUNT_KEY`, `[${key}] cannot find AWS account by key ${key}`);
    }
    return awsAcc;
  }

  async getVCenterByKey(op: HttpOp, key?: string) {
    if (!key) { key = op.req.params?.key; }
    if (!key) {
      return op.raise(HttpCode.BAD_REQUEST, `PATH_PARAM_NOT_FOUND`, `'${key}' path parameter not defined.`);
    }
    if (this.vcenterDefunct[key]) {
      return op.raise(HttpCode.BAD_REQUEST, `VCENTER_DEFUNCT`, `[${key}] vCenter is defunct`);
    }
    let vc = this.vcenter[key];
    if (vc && (vc as any).then) { vc = await vc; }
    if (!vc) {
      return op.raise(HttpCode.BAD_REQUEST, `NO_VCENTER_KEY`, `[${key}] cannot find vCenter by key ${key}`);
    }
    return vc;
  }

}
