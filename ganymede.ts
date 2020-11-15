/**
 * Jovian Io App Generator (Angular using Clarity, and server components)
 * (c) Jovian 2020, All rights reserved.
 */

 // tslint:disable: no-console
const fs = require('fs');
const crypt = require('crypto');
const execSync = require('child_process').execSync;

const allReplaces: {find: RegExp, value: string}[] = [];
let config = null;

const defaultConfigPath = 'ganymede.conf.json';

const configReplacerTargets = [
  'package.json',
  'angular.json',
  'karma.conf.js',
  'src/index.html',
  'e2e/src/app.spec.ts',
];

const styleReplacesTargets = [
  'src/variables.scss',
];

class GanymedeAppGenerator {

  public config;

  constructor() {}

  executeBasedOnArgs() {
    const a = prepCommandLineArgs();
    if (a[0] === 'appset') {
      if (a[1] === 'revert') {
        this.revert();
      } else if (a[1] === 'refresh') {
        this.refresh();
      } else {
        this.generate();
      }
    } else if (a[0] === 'packages-update') {
      this.packageJsonImport();
    } else if (a[0] === 'template-load') {
      this.templateLoad();
    } else if (a[0] === 'license-sign') {
      this.signLicense(a[1], a[2], a[3], a[4]);
    } else if (a[0] === 'license-verify') {
      this.verifyLicense();
    }
  }

  signLicense(org: string, user: string, domain: string, scope: string) {
    const encryptedPrivateKey = fs.readFileSync('.license-signing-key');
    const privateKeyPassphrase = fs.readFileSync('.license-signing-key-passphrase');
    const signer = crypt.createSign('RSA-SHA256');
    signer.update(`GANYMEDE_LICENSE___${org}___${user}___${domain}___${scope}`);
    signer.end();
    const sig = signer.sign({
      key: encryptedPrivateKey,
      passphrase: privateKeyPassphrase
    }, 'hex');
    console.log('License Key: ' + sig);
    return sig;
  }

  verifyLicense(): boolean {
    const forCustomer = fs.existsSync('ganymede/.license-public-key');
    const publicKey = fs.readFileSync(forCustomer ? 'ganymede/.license-public-key' : '.license-public-key');
    const verifier = crypt.createVerify('RSA-SHA256');
    const org = config.license.org;
    const user = config.license.user;
    const domain = config.license.domain;
    const scope = config.license.scope;
    verifier.update(`GANYMEDE_LICENSE___${org}___${user}___${domain}___${scope}`);
    const verified = verifier.verify(publicKey, config.license.key, 'hex');
    console.log(verified ? 'GANYMEDE_LICENSE_VALID' : 'GANYMEDE_LICENSE_NOT_VALID');
    return verified;
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
    // execSync(`cp src/app/ganymede/templates/${templateName}`, {stdio: 'inherit'});
    let moduleTsContent = fs.readFileSync('src/app/app.module.ts', 'utf-8');
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
