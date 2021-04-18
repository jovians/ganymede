/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { GanymedeServerExtensions } from '../../../../../server/src/extensions';
import { GanymedeHttpRequest, GanymedeHttpResponse, GanymedeHttpServer, HttpMethod, Pre } from '../../../../../server/src/http.shim';
import { VsphereInfra, VsphereDataCenter } from 'vsphere-infra';
import { Unit } from '../../../../../components/util/unit.utils';
import { secrets } from '../../../../../components/util/secrets.resolver';
import { log } from '../../../../../components/util/logger';

export class NativeInfraExtensionServer {
  app: GanymedeHttpServer;
  iface = 'json';
  globalConfData: typeof GanymedeServerExtensions.globalConf;
  data: any;

  vsphereDcs: VsphereDataCenter[] = [];
  vcenters: {[key: string]: (VsphereDataCenter | Promise<VsphereDataCenter>) } = {};

  async start(data: any, globalConfData: any) {
    this.globalConfData = globalConfData;
    this.data = data;
    log.info('Ganymede native.infra extension server started.');
    if (!data) { return; }
    await this.initialize(true);
  }

  async initialize(andStart: boolean = false) {
    VsphereInfra.grant();
    const vinfra = new VsphereInfra();
    vinfra.behavior.setVerbose(true);
    vinfra.behavior.setJsonLogs(true);
    this.registerApis();
    if (this.data.inventory.vcenter) {
      if (this.data.inventory.vcenter.type === 'fixed') {
        for (const inv of this.data.inventory.vcenter.list) {
          if (inv.type === 'vsphere') {
            inv.username = await secrets.resolve(inv.username);
            inv.password = await secrets.resolve(inv.password);
            const vcProm = vinfra.getDatacenter(inv);
            this.vcenters[inv.key] = vcProm;
            vcProm.then(vc => {
              this.vcenters[vc.key] = vc;
              vc.startInventoryWatch();
            });
          }
        }
      }
    }
    log.info('Ganymede native.infra extension initialized.');
    if (andStart) {
      this.app.start({ port: this.data.port });
      log.info(`Ganymede native.infra extension listening on ${this.data.port}`);
    }
  }

  registerApis() {
    this.app = new GanymedeHttpServer('express', this.globalConfData);
    const basePath = this.globalConfData.ext.basePath;
    const iface = this.iface;
    const extName = 'native/infra';
    const extBasePath = `${basePath}/${iface}/${extName}`;
    this.app.register({
      method: HttpMethod.GET, path: `${extBasePath}/vcenter/:key/all-objects-map`,
      pre: [ Pre.AUTH, Pre.BASIC ], handler: async (q, r) => {
        const key = this.getPathParam('key', q, r); if (!key) { return; }
        const vc = await this.getVCenterByKey(key, r); if (!vc) { return; }
        r.okJson({ all: vc.inventory.byGUID });
      }
    });
    this.app.register({
      method: HttpMethod.GET, path: `${extBasePath}/vcenter/:key/quick-stats`,
      pre: [ Pre.AUTH, Pre.BASIC ], handler: async (q, r) => {
        const key = this.getPathParam('key', q, r); if (!key) { return; }
        const vc = await this.getVCenterByKey(key, r); if (!vc) { return; }
        const data = {
          overview: {
            totalCpu: 0, consumedCpu: 0, percentCpu: 0,
            totalMem: 0, consumedMem: 0, percentMem: 0,
            totalStorage: 0, consumedStorage: 0, percentStorage: 0,
          },
          clusterSummary: null,
          hostStats: [],
          storageStats: [],
        };
        for (const clusterId of Object.keys(vc.inventory.computeResource)) {
          const cluster = vc.inventory.computeResource[clusterId];
          data.clusterSummary = cluster.summary;
          if (data.clusterSummary) {
            data.overview.totalCpu = parseInt(data.clusterSummary.totalCpu + '', 10) / 1000; // in GHz
            data.overview.totalMem = parseInt(data.clusterSummary.totalMemory + '', 10) / Unit.GiB; // in GiB

          }
          break;
        }
        for (const hostId of Object.keys(vc.inventory.hostSystem)) {
          const host = vc.inventory.hostSystem[hostId];
          data.overview.consumedCpu += host.summary.quickStats.overallCpuUsage / 1000;
          data.overview.consumedMem += host.summary.quickStats.overallMemoryUsage / 1024;
          data.hostStats.push({ iid: hostId, name: host.name, networksCount: host.network.length, stats: host.summary.quickStats });
        }
        for (const dsId of Object.keys(vc.inventory.datastore)) {
          const ds = vc.inventory.datastore[dsId];
          if (ds.info.containerId === ds.info.aliasOf) {
            const capBytes = parseInt(ds.summary.capacity, 10);
            const freeBytes = parseInt(ds.summary.freeSpace, 10);
            const usedBytes = capBytes - freeBytes;
            data.overview.totalStorage += capBytes / Unit.GiB;
            data.overview.consumedStorage += usedBytes / Unit.GiB;
          }
          data.storageStats.push({ iid: dsId, name: ds.name, info: ds.info, summary: ds.summary });
        }
        data.overview.percentCpu = data.overview.consumedCpu / data.overview.totalCpu * 100;
        data.overview.percentMem = data.overview.consumedMem / data.overview.totalMem * 100;
        data.overview.percentStorage = data.overview.consumedStorage / data.overview.totalStorage * 100;
        r.okJson(data);
      }
    });
  }

  getPathParam(name: string, q: GanymedeHttpRequest, r: GanymedeHttpResponse): string {
    const value = q.params[name];
    if (!value) {
      r.status(400).end(`'${value}' path parameter not defined.`);
      return null;
    }
    return value;
  }

  async getVCenterByKey(key: string, r: GanymedeHttpResponse) {
    let vc = this.vcenters[key];
    if (vc && (vc as any).then) { vc = await vc; }
    if (!vc) {
      r.status(404).end(JSON.stringify({ status: 'not_found', message: `Cannot find vCenter by key: '${key}'`}));
      return null;
    }
    return vc;
  }
}
