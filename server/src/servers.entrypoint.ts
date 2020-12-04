import { AuthServer } from './auth.server';
import { serverConst } from './const';

for (const arg of process.argv) {
  if (arg === '--prod') { serverConst.prod = true; }
}

const authServer = new AuthServer();
authServer.initialize();

