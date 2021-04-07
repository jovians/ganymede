import { AuthServer } from './auth.server';
import { ServerConst } from './const';
import { GanymedeServerExtensions } from './extensions';
import * as cluster from 'cluster';


export class ServerEntryPoint {
  static started = false;
  static start() {
    if (ServerEntryPoint.started) { return; }
    for (const arg of process.argv) {
      if (arg === '--prod') { ServerConst.data.prod = true; }
    }
    if (cluster.isMaster) {
      // Default modules
      if (ServerConst.data.base.modules) {
        for (const baseModuleName of Object.keys(ServerConst.data.base.modules)) {
          switch (baseModuleName) {
            case 'auth':
              const authServer = new AuthServer();
              authServer.start(ServerConst.data.base.modules.auth);
              break;
          }
        }
      }
      // Spawn Worker & Log Worker
      if (ServerConst.data.extensions) {
        if (ServerConst.data.extensions.native) {
          for (const nativeExt of Object.keys(ServerConst.data.extensions.native)) {
            const extData = ServerConst.data.extensions.native[nativeExt];
            const globalConfData = ServerConst.data.global ? ServerConst.data.global : {};
            extData._extension_key = `native.${nativeExt}`;
            cluster.fork({
              EXT_KEY: extData._extension_key,
              EXT_DATA_BASE64: Buffer.from(JSON.stringify(extData)).toString('base64'),
              GLOBAL_CONF_DATA_BASE64: Buffer.from(JSON.stringify(globalConfData)).toString('base64')
            });
          }
        }
      }
    } else if (cluster.isWorker) {
      const extKey = process.env.EXT_KEY;
      GanymedeServerExtensions.run(extKey);
    }
    ServerEntryPoint.started = true;
  }
}
