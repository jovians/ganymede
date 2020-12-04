import * as Express from 'express';
import * as BodyParser from 'body-parser';
import * as crypto from 'crypto';
import * as fs from 'fs';
import { FourQ } from '@jovian/fourq';
import { serverConst } from './const';
import { ganymedeAppData as appData } from '../../../../../ganymede.app';

export class AuthServer {

  port: number = 7220;
  apiRoot: Express.Application;

  async initialize() {
    try {
      this.apiRoot = Express();
      // support application/json type post data
      this.apiRoot.use(BodyParser.json());
      // support application/x-www-form-urlencoded post data
      this.apiRoot.use(BodyParser.urlencoded({ extended: false }));

      this.apiRoot.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*'); // update to match the domain you will make the request from
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
        next();
      });

      // this.apiRoot.get('/api/ganymede/auth/setDeviceTimestampSeed', async (req, res) => {
      //   console.log('setBrowserTimestampSeed');
      //   const cookieRaw = req.headers.cookie;
      //   if (cookieRaw) {
      //     const target = cookieRaw.split('gany_dev_id=');
      //     if (target.length > 1) { return res.end(''); }
      //   }
      //   const seed =  crypto.randomBytes(36).toString('base64')
      //                     .replace('+', '-').replace('/', '.').replace('=', '_');
      //   res.cookie('gany_dev_id', seed, {
      //     expires: new Date(Date.now() + 3155695200), // 100 years
      //     httpOnly: true,
      //     secure: false
      //   });
      //   res.end('');
      // });
      this.apiRoot.get('/api/ganymede/auth/deviceTimestamp', async (req, res) => {
        const cookieRaw = req.headers.cookie;
        let target;
        let secret;
        if (cookieRaw) { target = cookieRaw.split('gany_dev_ss_token='); }
        if (target && target.length > 2) { return res.end(''); } // deny spoof
        if (!cookieRaw || target.length === 1) {
          const keypair = FourQ.generateKeyPair();
          secret = keypair.secretKey.toString('base64').replace('+', '-').replace('/', '.').replace('=', '_');
          // seed =  crypto.randomBytes(36).toString('base64').replace('+', '-').replace('/', '.');
          res.cookie('gany_dev_ss_token', secret, {
            expires: new Date(Date.now() + 3155695200), // 100 years
            httpOnly: true,
            secure: serverConst.prod ? true : false
          });
        } else {
          secret = target[1].split('; ')[0].replace('-', '+').replace('.', '/').replace('_', '=');
        }
        const t = Date.now();
        const nonce =  crypto.randomBytes(6).toString('base64');
        const msg = Buffer.from(`${serverConst.salts.browserTimestamp}:${nonce}:${t}`);
        const hash = crypto.createHash('sha256').update(msg).digest('base64');
        return res.end(`${Date.now()}::${nonce}::${hash}`);
      });

      if (appData.features.preinit) {
        this.apiRoot.get('/api/ganymede/preinit', async (req, res) => {
          const ret: any = {};
          let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
          if (ip.startsWith('::ffff')) { ip = ip.split('::ffff:')[1]; }
          let swMeta;
          try {
            swMeta = fs.statSync('../../../assets-root/sw.js');
            swMeta = JSON.parse(swMeta);
          } catch (e) {}
          ret.sw = swMeta ? swMeta.mtimeMs : 0;
          res.set('Last-Modified', Date.now() + ', ' + ip);
          res.end(JSON.stringify(ret));
        });
      }

      console.log('Initialized...');
      this.apiRoot.listen(this.port);

    } catch(e) { console.log(e); }
  }

  main(){
    try {
      this.initialize();
    } catch(e) {
      console.log(e);
    }
  }

  terminationHandler(e) {
    console.log(e, 'test');
    if (e && e.preventDefault) { e.preventDefault(); }
  }

}

function getcookie(req) {
  var cookie = req.headers.cookie;
  // user=someone; session=QyhYzXhkTZawIb5qSl3KKyPVN (this is my cookie i get)
  return cookie.split('; ');
}
