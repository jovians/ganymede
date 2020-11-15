/**
 * Jovian Io App Generator (Angular using Clarity, and server components)
 * (c) Jovian 2020, All rights reserved.
 */

 // tslint:disable: no-console
const fs = require('fs');
const sharp = require('sharp');

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
    }
    if (a[0] === 'packages-update') {
      this.packageJsonImport();
    }
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
