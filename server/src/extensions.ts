/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import * as fs from 'fs';
import { exec } from 'child_process';
import { GanymedeHttpServer } from './http.shim';
import { ServerConst } from './const';

export interface GanymedeServerExtension {
  start: (extData: any) => Promise<void>;
}

export class GanymedeServerExtensions {
  static registry: { [key: string]: GanymedeServerExtension } = {};
  static register(key: string, serverDefinition: GanymedeServerExtension) {
    GanymedeServerExtensions.registry[key] = serverDefinition;
  }
  static globalConf: typeof ServerConst.data.global; 
  static async run(key: string) {
    const ganyBasePath = __dirname.split('/').slice(0, -2).join('/');
    const extPath = `${ganyBasePath}/extensions/${key.split('.').join('/')}`;
    if (!fs.existsSync(`${extPath}`)) {
      return console.log(`ganymede server extension '${key}' not found.`);
    }
    const alwaysCompile = true;
    if (alwaysCompile || !fs.existsSync(`${extPath}/server/src/main.js`)) {
      let compiled;
      try {
        await execAsync(`tsc ${extPath}/server/src/main.ts`); 
        compiled = true;
      } catch (e) {
        console.log(e.message);
      }
      if (!compiled) {
        return console.log(`ganymede server extension '${key}' failed to compile.`);
      }
    }
    const proc = exec(`node ${extPath}/server/src/main.js --max-old-space-size=8192`, { env: process.env });
    proc.stdout.pipe(process.stdout);
    proc.stderr.pipe(process.stderr);
    proc.on('exit', (...a) => {
      console.log(a)
      console.log(`ganymede server extension '${key}' exited.`);
    });
  }
  static getBaseAppApi(type: string, globalConfData: any) {
    // TODO
    const app = new GanymedeHttpServer(type, globalConfData);
    return app;
  }
  static getGlobalConfData(globalConfData: any) {
    return globalConfData as typeof ServerConst.data.global;
  }
}

async function execAsync(cmd: string): Promise<boolean> {
  return new Promise<boolean>(resolve => {
    exec(cmd, (e, stdout) => {
      if (e) { console.log(`ERROR: ${stdout}`); return resolve(false); }
      resolve(true);
    });
  });
}
