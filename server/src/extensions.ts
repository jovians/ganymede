/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import * as fs from 'fs';
import { exec, spawn } from 'child_process';
import { HttpServerShim, HttpBaseLib, HttpServerShimConfig } from 'ts-comply/nodejs';
import { ServerConst } from './const';

export interface GanymedeServerExtension {
  start: (extData: any) => Promise<void>;
}

export class GanymedeServerExtensions {
  static registry: { [key: string]: GanymedeServerExtension } = {};
  static globalConf: typeof ServerConst.data.global;
  static register(key: string, serverDefinition: GanymedeServerExtension) {
    GanymedeServerExtensions.registry[key] = serverDefinition;
  }
  static async run(key: string, compileOnly = false) {
    const ganyBasePath = __dirname.split('/').slice(0, -2).join('/');
    const extPath = `${ganyBasePath}/extensions/${key.split('.').join('/')}`;
    fs.writeFileSync(`${extPath}/server/.extension.build.uuid`, process.env.BUILD_UUID, 'utf8');
    console.log(`Ganymede server extension '${key}' staring...`);
    if (!fs.existsSync(`${extPath}`)) {
      return console.log(`ganymede server extension '${key}' not found.`);
    }
    const alwaysCompile = true;
    if (alwaysCompile || compileOnly || !fs.existsSync(`${extPath}/server/src/main.js`)) {
      let compiled;
      try {
        await execAsync(`(cd '${extPath}/server' && npx tsc)`);
        compiled = true;
      } catch (e) {
        console.log(e.message);
      }
      if (!compiled) {
        return console.log(`ganymede server extension '${key}' failed to compile.`);
      }
    }
    if (compileOnly) { console.log(`ganymede server extension '${key}' has been compiled.`); process.exit(0); }
    const extData = process.env.EXT_DATA_BASE64 ?
                      JSON.parse(Buffer.from(process.env.EXT_DATA_BASE64, 'base64').toString('utf8')) : {};
    const profilingLogFile = extData.v8Profiling ? `--logfile=prof.ext.${key}.log` : '';
    console.log(`Ganymede server extension '${key}' running (pid=${process.pid})`);
    const procArgs = ['--max-old-space-size=262144', `${extPath}/server/src/main.js`];
    if (profilingLogFile) { procArgs.unshift('--prof'); procArgs.unshift(profilingLogFile); }
    const proc = spawn('node', procArgs, {
      stdio: ['inherit', 'inherit', 'inherit', 'ipc'], env: { ...process.env, }
    });
    proc.on('message', messageSerial => {
      // const message = messageSerial as string;
      // if (this.responseFor) {
      //   this.handleResponse(this.responseFor, message);
      // } else {
      //   this.responseFor = message;
      // }
    });
    proc.on('exit', (...a) => {
      console.log(a)
      console.log(`ganymede server extension '${key}' exited.`);
    });
  }
  static getBaseAppApi(config: HttpServerShimConfig, globalConfData: any) {
    // TODO
    const app = new HttpServerShim(config, globalConfData);
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
