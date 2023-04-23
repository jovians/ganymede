/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { AsyncWorkerClient, AsyncWorkerExecutor } from 'ts-comply/nodejs';
import { AWSAccountsCollator } from 'aws-infra';
import { AWSAccount } from 'aws-infra/src/util/models';
import { Instance, Volume } from '@aws-sdk/client-ec2';
import { EC2OfferingTypes, EC2RegionalService, Ec2CombinedMetrics } from 'aws-infra/src/services/ec2/ec2';
import { Result, ReturnCodeFamily, dp, errorResult, ok } from 'ts-comply';

enum AwsDataWorkerCodeEnum {
  ACCOUNT_AUTH_FAILURE,
  ACCOUNT_NOT_FOUND,
  ACCOUNT_EC2_METRIC_NOT_READY,
}
export const AwsDataWorkerCode = ReturnCodeFamily('AwsDataWorkerCode', AwsDataWorkerCodeEnum);

export interface AwsAccountEc2QuickStats {
  serviceRegions: string[],
  metrics: Ec2CombinedMetrics
}

export interface AwsAccountEc2RegionQuickStats {
  region: string,
  metrics: Ec2CombinedMetrics
}

export class ExtInfraAwsWorkerClient extends AsyncWorkerClient {
  static workerFile = __filename;
  accountsCountMax = 20;
  accountsCount = 0;
  constructor(workerData: any) {
    super(workerData, { workerFile: ExtInfraAwsWorkerClient.workerFile });
  }
  addAccount(acc: AWSAccount) { return this.call<Result<boolean>>(`addAccount`, JSON.stringify(acc), r => JSON.parse(r)); }
  getEc2QuickStats(accKey: string) { return this.call<Result<AwsAccountEc2QuickStats>>(`getEc2QuickStats`, accKey, r => JSON.parse(r)); }
  getEc2QuickStatsInRegion(accKey: string, region: string) { return this.call<Result<AwsAccountEc2RegionQuickStats>>(`getEc2QuickStatsInRegion`, JSON.stringify({ account: accKey, region }), r => JSON.parse(r)); }
  getEc2Inventory(accKey: string) { return this.call<Result<Ec2AllRegionsInventory>>(`getEc2Inventory`, accKey, r => JSON.parse(r)); }
  getEc2InventoryInRegion(accKey: string, region: string) { return this.call<Result<Ec2AllRegionsInventory>>(`getEc2InventoryInRegion`, accKey, r => JSON.parse(r)); }
}
const thisWorkerClass = ExtInfraAwsWorkerClient;

export class ExtInfraAwsWorkerLogic extends AsyncWorkerExecutor {
  aws: AWSAccountsCollator = new AWSAccountsCollator;
  ec2OfferingMapLoaded = false;
  constructor(workerData: any) {
    super(workerData);
    this.setAsReady();
  }
  async handleAction(callId: string, action: string, payload?: string) {
    switch (action) {
      case 'addAccount': {
          const account: AWSAccount = JSON.parse(payload);
          const accountAdded = await this.aws.addAccount(account);
          if (accountAdded) {
            const services = this.aws.user(account);
            services.ec2.watchInventory(60);
            return this.returnCall(callId, JSON.stringify(ok(true)));
          } else {
            return this.returnCall(callId, JSON.stringify(
              AwsDataWorkerCode.error('ACCOUNT_AUTH_FAILURE', `Unable to add account '${account.key}'`)));
          }
      }
      case 'getEc2Inventory': {
        const accountKey = payload;
        const accountService = this.getAccountService(callId, accountKey); if (!accountService) { return; }
        await accountService.ec2.checkRegion('us-east-1');
        const allRegions: Ec2AllRegionsInventory = {};
        for (const region of accountService.ec2.serviceRegions) {
          allRegions[region] = accountService.ec2.in(region).ec2Inventory;
        }
        return this.returnCall(callId, JSON.stringify(ok(allRegions)));
      }
      case 'getEc2QuickStats': {
        const accountKey = payload;
        const accountService = this.getAccountService(callId, accountKey); if (!accountService) { return; }
        const metrics = accountService.ec2.getAccountEC2Metrics();
        if (!metrics || !metrics.ready) {
          return this.returnCall(callId, JSON.stringify(
            AwsDataWorkerCode.error('ACCOUNT_EC2_METRIC_NOT_READY', `AWS account EC2 metrics are not ready`)));
        }
        return this.returnCall(callId, JSON.stringify(ok({
          serviceRegions: accountService.ec2.serviceRegions,
          metrics,
        })));
      }
      case 'getEc2QuickStatsInRegion': {
        const { account, region } = JSON.parse(payload) as { account: string; region: string };
        const accountService = this.getAccountService(callId, account); if (!accountService) { return; }
        const metrics = accountService.ec2.in(region).aggregateMetrics;
        if (!metrics || !metrics.ready) {
          return this.returnCall(callId, JSON.stringify(
            AwsDataWorkerCode.error('ACCOUNT_EC2_METRIC_NOT_READY', `AWS account EC2 metrics are not ready`)));
        }
        return this.returnCall(callId, JSON.stringify(ok({
          region,
          metrics,
        })));
      }
      default: {
        console.error(`Unknown ${action} on worker ${__filename}`)
      }
    }
  }
  getAccountService(callId: string, accountKey: string) {
    const accountService = this.aws.user(accountKey);
    if (!accountService) {
      this.returnCall(callId, JSON.stringify(
          AwsDataWorkerCode.error('ACCOUNT_NOT_FOUND', `AWS account key ${accountKey} not found`)));
      return null;
    }
    return accountService;
  }
}

if (process.env.WORKER_DATA_BASE64) {
  const workerData = JSON.parse(Buffer.from(process.env.WORKER_DATA_BASE64, 'base64').toString('utf8'));
  if (workerData.workerFile === thisWorkerClass.workerFile) {
    new ExtInfraAwsWorkerLogic(workerData).getSelf();
  }
}

export type Ec2AllRegionsInventory = {[region: string]: EC2RegionalService['ec2Inventory']};
