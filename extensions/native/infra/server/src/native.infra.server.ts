/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { HttpServerShim, HttpOp, HttpBaseLib, HTTP, ReqProcessor, HttpCode, SecretManager } from 'ts-comply/nodejs';
import { AWSAccountsCollator, AWSAccountServicesCollator } from 'aws-infra';
import { prefetchedCreds } from 'aws-infra/src/util/auth';
import { ExtInfraVCenterWorkerClient } from './native.infra.vcenter.server.worker';
import { AwsAccountEc2QuickStats, AwsAccountEc2RegionQuickStats, AwsDataWorkerCode, Ec2AllRegionsInventory, ExtInfraAwsWorkerClient } from './native.infra.aws.server.worker';
import { log } from '../../../../../components/util/shared/logger';
import { dp, ok, promise, Result, ReturnCodeFamily } from 'ts-comply';
import { AWSAccount } from 'aws-infra/src/util/models';
import { Ec2CombinedMetrics } from 'aws-infra/src/services/ec2/ec2';

const scopeName = `ext-infra;pid=${process.pid}`;

enum VSphereInventoryCodeEnum {
  VSPHERE_KEY_NOT_GIVEN,
  VSPHERE_KEY_NOT_FOUND,
  VSPHERE_KEY_DEFUNCT,
  NOT_READY_UTIL_SUMMARY,
  NOT_READY_INV,
}
const VSphereInventoryCode = ReturnCodeFamily('VSphereInventoryCode', VSphereInventoryCodeEnum);

enum AwsInventoryCodeEnum {
  AWS_KEY_NOT_GIVEN,
  AWS_KEY_DEFUNCT,
  AWS_ACCOUNT_NOT_FOUND,
}
const AwsInventoryCode = ReturnCodeFamily('AwsInventoryCode', AwsInventoryCodeEnum);

export class NativeInfraExtensionServer extends HttpServerShim {
  // appServer: GanymedeHttpServer;
  // iface = 'json';
  awsCollator = new AWSAccountsCollator();
  extData: any;
  aws: { [key: string]: ExtInfraAwsWorkerClient } = {};
  awsPending: { [key: string]: Promise<any> } = {};
  awsWorkerPool: { [workerId: string]: ExtInfraAwsWorkerClient } = {};
  awsDefunct: {[key: string]: any } = {};
  vcenter: { [key: string]: ExtInfraVCenterWorkerClient } = {};
  vcenterDefunct: {[key: string]: any } = {};

  cache = {
    inventoryData: this.cacheDefine<object>({ path: `native.infra.inventoryData` }),
    aws: {
      ec2: this.cacheDefine<Ec2AllRegionsInventory>({ path: `native.infra.aws.ec2-list/:key`, matchExactly: true }),
      ec2QuickStats: this.cacheDefine<AwsAccountEc2QuickStats>({ path: `native.infra.aws.ec2-quick-stats/:key`, matchExactly: true }),
      ec2QuickStatsInRegion: this.cacheDefine<AwsAccountEc2RegionQuickStats>({ path: `native.infra.aws.ec2-quick-stats/:key/:region`, matchExactly: true }),
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

  async assignAwsWorker(acc: AWSAccount) {
    if (Object.keys(this.awsWorkerPool).length === 0) {
      const workerPoolIndex = Object.keys(this.awsWorkerPool).length + '';
      const workerData = {
        scopeName,
        workerFile: ExtInfraAwsWorkerClient.workerFile,
        workerPoolIndex,
      };
      this.awsWorkerPool[workerPoolIndex] = this.addWorker(ExtInfraAwsWorkerClient, workerData);
    }
    for (const workerPoolIndex of Object.keys(this.awsWorkerPool)) {
      const worker = this.awsWorkerPool[workerPoolIndex];
      if (worker.accountsCount < worker.accountsCountMax) {
        if (!acc.settings) { acc.settings = {}; }
        const added = await worker.addAccount(acc);
        if (added.status === 'ok') {
          this.aws[acc.key] = worker;
          return worker;
        } else {
          return null;
        }
      }
    }
    return null;
  }

  async enumerateAWS() {
    if (!this.extData.inventory.aws) { return; }
    if (this.extData.inventory.aws.type === 'fixed') {
      for (const invData of this.extData.inventory.aws.list) {
        const inv = JSON.parse(JSON.stringify(invData));
        if (inv.type === 'aws') {
          const creds = {
            accessKeyId: await SecretManager.resolve(inv.username),
            secretAccessKey: await SecretManager.resolve(inv.password),
            sessionToken: inv.sessionToken ? await SecretManager.resolve(inv.sessionToken) : null,
            roleArn: inv.roleArn ? await SecretManager.resolve(inv.roleArn) : null,
          };
          if (!inv.username || !inv.password) {
            console.log(`Failed to resolve credentials for '${inv.key}'`);
            continue;
          }
          log.info(`logging into AWS account, KEY_ID=${creds.accessKeyId}`);
          if (!creds.sessionToken || creds.sessionToken?.startsWith('<')) { creds.sessionToken = null; }
          if (!creds.roleArn) { creds.roleArn = null; }
          inv.watch = true;
          if (!inv.defunct) {
            const prom = this.awsPending[inv.key] = this.assignAwsWorker({ key: inv.key, credentials: creds });
            this.aws[inv.key] = await prom;
            this.awsPending[inv.key] = null;
          } else {
            this.awsDefunct[inv.key] = {
              deprecated: inv.deprecated ? true : false,
              defunct: inv.defunct ? true : false,
            };
          }
        }
      }
    }
  }

  async enumerateVCenters() {
    if (!this.extData.inventory.vcenter) { return; }
    if (this.extData.inventory.vcenter.type === 'fixed') {
      for (const invData of this.extData.inventory.vcenter.list) {
        const inv = JSON.parse(JSON.stringify(invData));
        inv.username = await SecretManager.resolve(inv.username);
        inv.password = await SecretManager.resolve(inv.password);
        if (!inv.username || !inv.password) {
          console.log(`Failed to resolve credentials for '${inv.key}'`);
          continue;
        }
        inv.watch = true;
        const workerData = {
          workerFile: ExtInfraVCenterWorkerClient.workerFile,
          ...inv,
          scopeName,
        };
        if (!inv.defunct) {
          this.vcenter[inv.key] = this.addWorker(ExtInfraVCenterWorkerClient, workerData);
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

  @HTTP.GET(`/aws/:key/quick-stats`)
  async AwsEC2GetQuickStats(op: HttpOp) {
    const { client, key } = await this.getAwsByKeyOrRaise(op); if (!client) { return; }
    const cacheAccess = { version: Date.now(), matchExactly: true };
    op.cache.handler(this.cache.aws.ec2QuickStats, cacheAccess, async resolve => {
      const inv = await client.getEc2QuickStats(key);
      resolve(inv.data || null);
    });
  }

  @HTTP.GET(`/aws/:key/quick-stats/:region`)
  async AwsEC2GetQuickStatsInRegion(op: HttpOp) {
    const { client, key } = await this.getAwsByKeyOrRaise(op); if (!client) { return; }
    const region = op.params.region;
    if (region === 'global') {
      const stats = await client.getEc2QuickStats(key);
      return op.res.returnJson(stats.data || null);
    } else {
      const stats = await client.getEc2QuickStatsInRegion(key, region);
      return op.res.returnJson(stats.data || null);
    }
  }

  @HTTP.GET(`/aws/:key/ec2-list`)
  async AwsEC2GetInventory(op: HttpOp) {
    const { client, key } = await this.getAwsByKeyOrRaise(op); if (!client) { return; }
    const cacheAccess = { version: Date.now(), matchExactly: true };
    op.cache.handler(this.cache.aws.ec2, cacheAccess, async resolve => {
      const inv = await client.getEc2Inventory(key);
      resolve(inv.status === 'ok' ? inv.data : null);
    });
  }

  @HTTP.GET(`/vcenter/:key/all-objects`)
  async vCenterGetAllObjects(op: HttpOp) {
    const vc = await this.getVCenterByKeyOrRaise(op); if (!vc) { return; }
    const cacheAccess = { version: await vc.inventoryChangedLast(), matchExactly: true };
    op.cache.handler(this.cache.vcenter.allObjects, cacheAccess, async resolve => {
      const inventorySerialized = await vc.inventorySerialized();
      if (!inventorySerialized) {
        return op.raise(VSphereInventoryCode.error('NOT_READY_INV'), HttpCode.SERVICE_UNAVAILABLE) as any;
      }
      resolve(JSON.parse(inventorySerialized));
    });
  }

  @HTTP.GET(`/vcenter/:key/quick-stats`)
  async vCenterGetQuickStats(op: HttpOp) {
    const vc = await this.getVCenterByKeyOrRaise(op); if (!vc) { return; }
    const cacheAccess = { version: await vc.u9nChangedLast(), matchExactly: true };
    if (cacheAccess.version < 0) {
      return op.raise(VSphereInventoryCode.error('NOT_READY_UTIL_SUMMARY'), HttpCode.SERVICE_UNAVAILABLE) as any;
    }
    op.cache.handler(this.cache.vcenter.quickStats, cacheAccess, async resolve => {
      resolve(JSON.parse(await vc.u9nSerialized()));
    });
  }

  @HTTP.GET(`/vcenter/:key/watcher-resource`)
  async vCenterGetWatcherResource(op: HttpOp) {
    const vc = await this.getVCenterByKeyOrRaise(op); if (!vc) { return; }
    const processResourceSnapshot = await vc.processResourceSnapshot();
    return op.res.returnJson(processResourceSnapshot);
  }

  @HTTP.GET(`/vcenter/:key/watcher-failure-heat`)
  async vCenterGetWatcherFailureHeat(op: HttpOp) {
    const vc = await this.getVCenterByKeyOrRaise(op); if (!vc) { return; }
    const heatData = await vc.failureHeat();
    return op.res.returnJson(heatData);
  }

  @HTTP.GET(`/vcenter/:key/managed-object`)
  async vCenterGetEntities(op: HttpOp) {
    const guid = op.req.params.key;
    const entityKey = guid.split(':').pop();
    const vcKey = guid.split(':')[1];
    const vc = await this.getVCenterByKeyOrRaise(op, vcKey); if (!vc) { return; }
    const entitiesSerialized = await vc.getEntities([entityKey]);
    return op.res.returnJson(JSON.parse(entitiesSerialized)[0]);
  }

  async getAwsByKeyOrRaise(op: HttpOp, key?: string) {
    if (!key) { key = op.req.params?.key; }
    if (!key) {
      op.raise(AwsInventoryCode.error('AWS_KEY_NOT_GIVEN'), HttpCode.NOT_FOUND);
      return {};
    }
    if (this.awsDefunct[key]) {
      op.raise(AwsInventoryCode.error('AWS_KEY_DEFUNCT'), HttpCode.NOT_FOUND);
      return {};
    }
    if (this.awsPending[key]) { await this.awsPending[key]; }
    const awsAcc = this.aws[key];
    if (!awsAcc) {
      op.raise(AwsInventoryCode.error('AWS_ACCOUNT_NOT_FOUND'), HttpCode.NOT_FOUND);
      return {};
    }
    return { client: awsAcc, key } ;
  }

  async getVCenterByKeyOrRaise(op: HttpOp, key?: string): Promise<ExtInfraVCenterWorkerClient> {
    if (!key) { key = op.req.params?.key; }
    if (!key) {
      op.raise(VSphereInventoryCode.error('VSPHERE_KEY_NOT_GIVEN'), HttpCode.NOT_FOUND);
      return null;
    }
    if (this.vcenterDefunct[key]) {
      op.raise(VSphereInventoryCode.error('VSPHERE_KEY_DEFUNCT'), HttpCode.FAILED_DEPENDENCY);
      return null;
    }
    let vc = this.vcenter[key];
    if (vc && (vc as any).then) { vc = await vc; }
    if (!vc) {
      op.raise(VSphereInventoryCode.error('VSPHERE_KEY_NOT_FOUND'), HttpCode.NOT_FOUND);
      return null;
    }
    return vc;
  }

}
