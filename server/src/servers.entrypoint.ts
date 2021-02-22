import { AuthServer } from './auth.server';
import { ServerConst } from './const';

export class ServerEntryPoint {
  static started = false;
  static start() {
    if (ServerEntryPoint.started) { return; }
    for (const arg of process.argv) {
      if (arg === '--prod') { ServerConst.data.prod = true; }
    }
    const authServer = new AuthServer();
    authServer.initialize();
    ServerEntryPoint.started = true;
  }
}
