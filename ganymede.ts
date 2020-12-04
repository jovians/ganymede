/**
 * Jovian Io App Generator (Angular using Clarity, and server components)
 * (c) Jovian 2020, All rights reserved.
 */

 // tslint:disable: no-console
import * as fs from 'fs';
import * as crypto from 'crypto';
import { FourQ } from '@jovian/fourq';
import { NgxTranslateLangster } from '@jovian/langster';


const allReplaces: {find: RegExp, value: string}[] = [];
let config = null;

const defaultConfigPath = 'ganymede.conf.json';

const configReplacerTargets = [
  'package.json',
  'angular.json',
  'karma.conf.js',
  'src/index.html',
  'src/assets/ico/manifest.json',
];

const styleReplacesTargets = [
  'src/variables.scss',
];

class GanymedeAppGenerator {

  public config;

  constructor() {}

  executeBasedOnArgs() {
    const a = prepCommandLineArgs();
    const opname = a[0];
    if (opname === 'appset') {
      if (a[1] === 'revert') {
        this.revert();
      } else if (a[1] === 'refresh') {
        this.refresh();
      } else {
        this.generate();
      }
    } else if (opname === 'packages-update') {
      this.packageJsonImport();
    } else if (opname === 'template-load') {
      this.templateLoad();

    } else if (opname === 'license-keygen') {
      this.generateLicenseSigningKey();
    } else if (opname === 'license-sign') {
      this.signLicense(a[1], a[2], a[3], a[4]);
    } else if (opname === 'license-verify') {
      this.verifyLicense();
    } else if (opname === 'license-stamp') {
      this.stampLicense();

    } else if (opname === 'param-file-init') {
      this.paramFileInit();

    } else if (opname === 'i18n-update') {
      this.i18nUpdate();
    } else if (opname === 'i18n-generate') {
      this.i18nGenerateFromJson();
    }
  }

  generateLicenseSigningKey() {
    const seed = crypto.randomBytes(32);
    const keypair = FourQ.generateFromSeed(seed);
    const publicKeyBase64 = keypair.publicKey.toString('base64');
    const secretKeyBase64 = keypair.secretKey.toString('base64');
    fs.writeFileSync('.license-public-key', 'fourq:' + publicKeyBase64);
    const prompt = require('prompt');
    prompt.start();
    prompt.get([{name: 'passphrase', hidden: true}], (e, result) => {
      if (e) { return console.log('\nCanceled.'); }
      const passphrase = result.passphrase;
      const passphraseHash = crypto.createHash('sha256').update('GANYMEDE_SALT::' + passphrase).digest();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', passphraseHash, iv);
      let encrypted = cipher.update(Buffer.from(secretKeyBase64, 'base64'));
      encrypted = Buffer.concat([encrypted, cipher.final()]);
      const encryptedPrivateKeyData = 'aes-256-cbc:' + iv.toString('hex') + ':' + encrypted.toString('hex');
      fs.writeFileSync('.license-signing-key', encryptedPrivateKeyData);
      console.log('Public Key: ' + publicKeyBase64);
      console.log('Encrypted Private Key: ' + encryptedPrivateKeyData);
    });
  }

  signLicense(org: string, user: string, domain: string, scope: string) {
    const encryptedPrivateKeyInfo = fs.readFileSync('.license-signing-key', 'utf8').split(':');
    const publicKeyBase64 = fs.readFileSync('.license-public-key', 'utf8').split(':')[1];
    const prompt = require('prompt');
    prompt.start();
    prompt.get([{name: 'passphrase', hidden: true}], (e, result) => {
      if (e) { return console.log('\nCanceled.'); }
      const passphrase = result.passphrase;
      const passphraseHash = crypto.createHash('sha256').update('GANYMEDE_SALT::' + passphrase).digest();
      const encryptionScheme = encryptedPrivateKeyInfo.shift();
      const encryptionIV = encryptedPrivateKeyInfo.shift();
      const encryptedText = encryptedPrivateKeyInfo.shift();
      const encryptedData = Buffer.from(encryptedText, 'hex');
      let decrypted;
      try {
        const decipher = crypto.createDecipheriv(encryptionScheme, passphraseHash, Buffer.from(encryptionIV, 'hex'));
        decrypted = decipher.update(encryptedData);
        decrypted = Buffer.concat([decrypted, decipher.final()]);
      } catch (e) {
        return console.log('Passphrase incorrect.');
      }
      // console.log(decrypted.toString('base64'));
      const secretKey = decrypted;
      const licenseMessage = Buffer.from(`GANYMEDE_LICENSE___${org}___${user}___${domain}___${scope}`);
      const sig = FourQ.sign(licenseMessage, secretKey);
      const valid = FourQ.verify(sig.data, licenseMessage, Buffer.from(publicKeyBase64, 'base64'));
      if (valid) {
        console.log('License Key: ' + sig.data.toString('base64'));
      } else {
        console.log('Fatal: signed signaure does not verified to be true');
      }
    });
  }

  verifyLicense(): boolean {
    const publicKeyBase64 = fs.readFileSync('src/app/ganymede/.license-public-key', 'utf8').split(':')[1];
    const org = config.license.org;
    const user = config.license.user;
    const domain = config.license.domain;
    const scope = config.license.scope;
    const licenseMessage = Buffer.from(`GANYMEDE_LICENSE___${org}___${user}___${domain}___${scope}`);
    const sigData = Buffer.from(config.license.key, 'base64');
    const valid = FourQ.verify(sigData, licenseMessage, Buffer.from(publicKeyBase64, 'base64'));
    console.log(valid ? 'GANYMEDE_LICENSE_VALID' : 'GANYMEDE_LICENSE_NOT_VALID');
    return valid;
  }

  stampLicense() {
    let indexContent = fs.readFileSync('src/index.html', 'utf-8');
    indexContent = indexContent.replace('<gany.LICENSE_ORG>', config.license.org);
    indexContent = indexContent.replace('<gany.LICENSE_USER>', config.license.user);
    indexContent = indexContent.replace('<gany.LICENSE_DOMAIN>', config.license.domain);
    indexContent = indexContent.replace('<gany.LICENSE_SCOPE>', config.license.scope);
    indexContent = indexContent.replace('<gany.LICENSE_KEY>', config.license.key);
    fs.writeFileSync('src/index.html', indexContent);
  }

  paramFileInit() {
    if (!fs.existsSync('src/global.scss')) { fs.writeFileSync('src/global.scss', ''); }
    if (!fs.existsSync('ganymede.nav.ts')) { fs.writeFileSync('ganymede.nav.ts', ''); }
  }

  generate() {
    console.log(`Setting template variables...`);
    this.configReplacerDo();
  }
  revert() {
    console.log(`Reverting template variables...`);
    this.configReplacerUndo();
  }
  refresh() {
    console.log(`Refreshing template variables...`);
    this.configReplacerRefresh();
  }

  packageJsonImport() {
    const pkgTemplate = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
    const pkgSaved = JSON.parse(fs.readFileSync('package.saved.json', 'utf-8'));
    for (const field of Object.keys(pkgSaved)) {
      if (field === 'name' || field === 'version') { continue; }
      for (const field2 of Object.keys(pkgSaved[field])) {
        pkgTemplate[field][field2] = pkgSaved[field][field2];
      }
    }
    fs.writeFileSync('package.json', JSON.stringify(pkgTemplate, null, 2));
  }

  templateLoad() {
    const templateName = config.template.main;
    let moduleTsContent = fs.readFileSync('src/app/app.module.ts', 'utf-8');
    moduleTsContent = moduleTsContent.replace('<gany.APP_TEMPLATE_NAME>', templateName);
    moduleTsContent = moduleTsContent.replace('<gany.APP_IMPORTS>', '');
    moduleTsContent = moduleTsContent.replace('<gany.APP_DECLARATIONS>', '');
    fs.writeFileSync('src/app/app.module.ts', moduleTsContent);
  }

  initialize(configPath: string = defaultConfigPath) {
    config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    allReplaces.length = 0;
    for (const replaceKey of Object.keys(config.replacer)) {
      allReplaces.push({
        find: new RegExp(`${replaceKey}`, 'g'),
        value: config.replacer[replaceKey] + ''
      });
    }
    for (const replaceKey of Object.keys(config.styles.replacer)) {
      allReplaces.push({
        find: new RegExp(`\\${replaceKey}__`, 'g'),
        value: config.styles.replacer[replaceKey] + ''
      });
    }
  }

  i18nGenerateFromJson() {
    const i18nPath = fs.existsSync('src/assets/i18n') ? 'src/assets/i18n' : '../../assets/i18n';
    new NgxTranslateLangster({
      folderPath: i18nPath,
      langPackExtension: '.lang.js',
      ignorePatternsAdditional: ['**/ganymede/**', '**/ganymede.ts']
    }).generateFromJson();
  }

  i18nUpdate() {
    const i18nPath = fs.existsSync('src/assets/i18n') ? 'src/assets/i18n' : '../../assets/i18n';
    new NgxTranslateLangster({
      folderPath: i18nPath,
      langPackExtension: '.lang.js',
      ignorePatternsAdditional: ['**/ganymede/**', '**/ganymede.ts']
    }).update();
  }

  private configReplacerDo() {
    const allTargets = [].concat(configReplacerTargets, styleReplacesTargets);
    for (const filePath of allTargets) {
      try {
        console.log(`Setting template variables in '${filePath}'`);
        const backUpFilePath = this.getBackUpFilePath(filePath);
        if ( !fs.existsSync(backUpFilePath) ) { fs.copyFileSync(filePath, backUpFilePath); }
        let fileContent = fs.readFileSync(filePath, 'utf-8');
        for (const replacer of allReplaces) {
          fileContent = fileContent.replace(replacer.find, replacer.value);
        }
        fs.writeFileSync(filePath, fileContent);
      } catch (e) {
        console.error(e);
      }
    }
  }

  private configReplacerUndo() {
    const allTargets = [].concat(configReplacerTargets, styleReplacesTargets);
    for (const filePath of allTargets) {
      try {
        console.log(`Reverting template variables in '${filePath}'`);
        const backUpFilePath = this.getBackUpFilePath(filePath);
        if ( fs.existsSync(backUpFilePath) ) { fs.copyFileSync(backUpFilePath, filePath); }
      } catch (e) {
        console.error(e);
      }
    }
  }

  private configReplacerRefresh() {
    this.configReplacerUndo();
    this.configReplacerDo();
  }

  private getBackUpFilePath(filePath: string) {
    const dotSplit = filePath.split('.');
    const extension = dotSplit.pop();
    dotSplit.push('TEMPLATE');
    dotSplit.push(extension);
    return dotSplit.join('.');
  }
}


const appGen = new GanymedeAppGenerator();
appGen.initialize();
appGen.executeBasedOnArgs();



function prepCommandLineArgs() {
  const args = JSON.parse(JSON.stringify(process.argv));
  args.shift(); args.shift(); // remove cmd and file; `node file.js`
  return args;
}
