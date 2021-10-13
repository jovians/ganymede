/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { AuthServer } from './auth.server';
import { ServerConst } from './const';
import { GanymedeServerExtensions } from './extensions';
import { SecureChannel } from '../../components/util/shared/crypto/secure.channel';
import * as fs from 'fs';
import * as axios from 'axios';
import * as dns from 'dns';

const cluster = require('cluster');

const compileOnly = (process.argv.filter(arg => arg === 'compileOnly').length > 0);

export class ServerEntryPoint {
  static buildUuid = fs.existsSync('.build.uuid') ? fs.readFileSync('.build.uuid', 'utf8') : '';
  static started = false;
  static async start() {
    if (ServerEntryPoint.started) { return; }
    for (const arg of process.argv) {
      if (arg === '--prod') { ServerConst.data.prod = true; }
    }
    if (cluster.isMaster) {
      // Resolve destor
      let currentEnv = 'test';
      const destorInfo = { list: [] };
      if (!compileOnly) {
        const destorData = fs.existsSync('config/.ganymede.topology.json') ?
                              JSON.parse(fs.readFileSync('config/.ganymede.topology.json', 'utf8'))
                            : JSON.parse(fs.readFileSync('.ganymede.topology.json', 'utf8'));
        currentEnv = destorData.env;
        const matchedDestors = [];
        let tryCount = 0;
        for (const target of destorData.destor.targets) {
          ++tryCount;
          const urlObj = new URL(target.endpoint);
          const hostname = urlObj.hostname;
          const ip = await dnsLookUp(hostname);
          if (!ip) {
            console.log(`[Destor resolve #${tryCount - 1}] unable to resolve ${hostname}, trying next...`);
            continue;
          }
          const res = await destorGet(target);
          if (!res) { continue; }
          matchedDestors.push(target);
        }
        if (matchedDestors.length === 0) {
          console.log(`No destor profiles are available, exiting.`);
          process.exit(0);
        }
        for (const destor of matchedDestors) {
          try {
            const res = await axios.default.get(destor.endpoint, {
              timeout: 7000,
              headers: { Authorization: SecureChannel.getAccessorHeader('internal', destor.token) },
            });
            if (res.status !== 200) { continue; }
            const pubkeyB64 = destor.trust.split('::')[1];
            const verified = SecureChannel.verifyStamp(res.data.result, pubkeyB64);
            if (!verified) { continue; }
            destorInfo.list.push(destor);
          } catch (e) { console.log(e); continue; }
        }
        if (destorInfo.list.length === 0) {
          console.log(`No destor profiles are available, exiting. 2`);
          process.exit(0);
        }
        console.log(`[Destor resolved] discovered ${destorInfo.list.length} active destor endpoints.`);
      }
      // Default modules
      if (ServerConst.data.base.modules && !compileOnly) {
        for (const baseModuleName of Object.keys(ServerConst.data.base.modules)) {
          console.log(`Ganymede server module '${baseModuleName}' entrypoint (pid=${process.pid})`);
          switch (baseModuleName) {
            case 'auth':
              const authServer = new AuthServer();
              authServer.start();
              break;
          }
        }
      } else if (compileOnly) {
        console.log(`ganymede main server modules have been compiled.`);
      }
      // Spawn Worker & Log Worker
      if (ServerConst.data.extensions) {
        if (ServerConst.data.extensions.native) {
          for (const nativeExt of Object.keys(ServerConst.data.extensions.native)) {
            const extData = ServerConst.data.extensions.native[nativeExt];
            const globalConfData = ServerConst.data.global ? ServerConst.data.global : {};
            extData._extension_key = `native.${nativeExt}`;
            cluster.fork({
              BUILD_UUID: ServerEntryPoint.buildUuid,
              EXT_KEY: extData._extension_key,
              EXT_DATA_BASE64: Buffer.from(JSON.stringify(extData)).toString('base64'),
              DESTOR_INFO_BASE64: Buffer.from(JSON.stringify(destorInfo)).toString('base64'),
              DESTOR_ENV: currentEnv,
              GLOBAL_CONF_DATA_BASE64: Buffer.from(JSON.stringify(globalConfData)).toString('base64')
            });
          }
        }
      }
    } else if (cluster.isWorker) {
      const extKey = process.env.EXT_KEY;
      GanymedeServerExtensions.run(extKey, compileOnly);
    }
    ServerEntryPoint.started = true;
  }
}

function dnsLookUp(host: string) {
  return new Promise<string>(resolve => {
    dns.lookup(host, (e, address) => {
      if (e) { return resolve(null); }
      resolve(address);
    });
  });
}

function destorGet(target: any) {
  return new Promise<string>(resolve => {
    const pubkeyB64 = target.trust.split('::')[1];
    axios.default.get(target.endpoint,
      { headers: { Authorization: SecureChannel.getAccessorHeader('internal', target.token) } }
    ).then(r => {
      if (r.status && r.data.status === 'ok') {
        const verified = SecureChannel.verifyStamp(r.data.result, pubkeyB64);
        resolve(verified ? verified.payload : null);
      } else { resolve(null); }
    }).catch(e => {
      if (e.response) {
        console.log(
          `[Destor resolution error] destor handshake failed for ${target.endpoint}, returned with ` +
          `${e.response.status}: ${e.response.data.status}`
        );
      } else {
        console.log(
          `[Destor resolution error] destor handshake failed for ${target.endpoint}, returned with ${e.message}`
        );
      }
      resolve(null);
    });
  });
}
