"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const crypto = __importStar(require("crypto"));
const fourq_1 = require("@jovian/fourq");
const langster_1 = require("@jovian/langster");
const http = require('http');
const allReplaces = [];
let config = null;
const defaultConfigPath = 'ganymede.conf.json';
const configReplacerTargets = [
    'package.json',
    'angular.json',
    'karma.conf.js',
    'src/index.html',
    'src/assets-root/manifest.json',
];
const styleReplacesTargets = [
    'src/variables.scss',
];
class GanymedeAppGenerator {
    constructor() { }
    executeBasedOnArgs() {
        const a = prepCommandLineArgs();
        const opname = a[0];
        if (opname === 'appset') {
            requireGanyConf();
            if (a[1] === 'revert') {
                this.revert();
            }
            else if (a[1] === 'refresh') {
                this.refresh();
            }
            else {
                this.generate();
            }
        }
        else if (opname === 'packages-update') {
            this.packageJsonImport();
        }
        else if (opname === 'template-load') {
            requireGanyConf();
            this.templateLoad();
        }
        else if (opname === 'license-keygen') {
            this.generateLicenseSigningKey();
        }
        else if (opname === 'license-sign') {
            requireGanyConf();
            this.signLicense(a[1], a[2], a[3], a[4], a[5], a[6]);
        }
        else if (opname === 'license-verify') {
            requireGanyConf();
            this.verifyLicense();
        }
        else if (opname === 'license-stamp') {
            requireGanyConf();
            this.stampLicense();
        }
        else if (opname === 'param-file-init') {
            requireGanyConf();
            this.paramFileInit();
        }
        else if (opname === 'i18n-update') {
            requireGanyConf();
            this.i18nUpdate();
        }
        else if (opname === 'i18n-generate') {
            requireGanyConf();
            this.i18nGenerateFromJson();
        }
        else if (opname === 'encrypt-file') {
            this.encryptFile(a[1], a[2]);
        }
        else if (opname === 'decrypt-file') {
            this.decryptFile(a[1], a[2]);
        }
        else if (opname === 'product-name') {
            requireGanyConf();
            console.log(config.productName);
        }
        else if (opname === 'stash') {
        }
        else if (opname === 'stash-pop') {
        }
        else if (opname === 'product-name-set') {
            requireGanyConf();
            this.setProductName(a[1]);
        }
        else if (opname === 'version') {
            console.log(require('./package.json').version);
        }
    }
    setProductName(productNameSet) {
        const productName = productNameSet.indexOf(':') >= 0 ? productNameSet.split(':')[0] : productNameSet;
        const commonName = productNameSet.indexOf(':') >= 0 ? productNameSet.split(':')[1] : productName;
        const configJson = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf-8'));
        configJson.productName = productName;
        configJson.replacer['<gany.APP_TITLE>'] = commonName;
        configJson.replacer['<gany.ANGULAR_APP_NAME>'] = productName;
        configJson.replacer['<gany.APP_PACKAGE_NAME>'] = productName;
        fs.writeFileSync(defaultConfigPath, JSON.stringify(configJson, null, 2), 'utf-8');
    }
    encryptFile(filePath, passphrase) {
        if (!passphrase) {
            if (fs.existsSync('./.archive.encryption.key')) {
                passphrase = fs.readFileSync('./.archive.encryption.key', 'utf8');
            }
            else {
                throw new Error('Passphrase is required for encryption');
            }
        }
        const fileContent = fs.readFileSync(filePath);
        const passphraseHash = crypto.createHash('sha256').update('AES_ENCRYPT_SALT::' + passphrase).digest();
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', passphraseHash, iv);
        let encrypted = cipher.update(fileContent);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        const encryptedFileData = Buffer.concat([Buffer.from('aes-256-cbc:' + iv.toString('hex') + ':', 'ascii'), encrypted]);
        fs.writeFileSync(filePath + '.enc', encryptedFileData);
    }
    decryptFile(filePath, passphrase) {
        if (!passphrase) {
            if (fs.existsSync('./.archive.encryption.key')) {
                passphrase = fs.readFileSync('./.archive.encryption.key', 'utf8');
            }
            else {
                throw new Error('Passphrase is required for decryption');
            }
        }
        const fileContents = fs.readFileSync(filePath);
        const passphraseHash = crypto.createHash('sha256').update('AES_ENCRYPT_SALT::' + passphrase).digest();
        const encryptionScheme = 'aes-256-cbc';
        let ivEnd;
        for (let i = 12; i < fileContents.length; ++i) {
            if (fileContents[i] === 58) {
                ivEnd = i;
                break;
            }
        }
        const encryptionIV = Buffer.from(fileContents.slice(12, ivEnd).toString('ascii'), 'hex');
        const encryptedData = fileContents.slice(ivEnd + 1);
        let decrypted;
        try {
            const decipher = crypto.createDecipheriv(encryptionScheme, passphraseHash, encryptionIV);
            decrypted = decipher.update(encryptedData);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
        }
        catch (e) {
            return console.log('Passphrase incorrect.');
        }
        fs.writeFileSync(filePath.slice(0, -4), decrypted);
    }
    generateLicenseSigningKey() {
        const seed = crypto.randomBytes(32);
        const keypair = fourq_1.FourQ.generateFromSeed(seed);
        const publicKeyBase64 = keypair.publicKey.toString('base64');
        const secretKeyBase64 = keypair.secretKey.toString('base64');
        fs.writeFileSync('license-public-key', 'fourq:' + publicKeyBase64);
        const prompt = require('prompt');
        prompt.start();
        prompt.get([{ name: 'passphrase', hidden: true }], (e, result) => {
            if (e) {
                return console.log('\nCanceled.');
            }
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
    signLicense(org, user, app, domain, scope, etc) {
        return __awaiter(this, void 0, void 0, function* () {
            const encryptedPrivateKeyInfo = (yield getRequest('127.0.0.1', '/get-encryped-signing-key', 58267)).split(':');
            const publicKeyBase64 = fs.readFileSync('license-public-key', 'utf8').split(':')[1];
            const prompt = require('prompt');
            prompt.start();
            prompt.get([{ name: 'passphrase', hidden: true }], (e, result) => {
                if (e) {
                    return console.log('\nCanceled.');
                }
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
                }
                catch (e) {
                    return console.log('Passphrase incorrect.');
                }
                const secretKey = decrypted;
                const licenseMessage = Buffer.from(`GANYMEDE_LICENSE___${org}___${user}___${app}___${domain}___${scope}___${etc}`);
                console.log(`License message: ${licenseMessage}`);
                const sig = fourq_1.FourQ.sign(licenseMessage, secretKey);
                const valid = fourq_1.FourQ.verify(sig.data, licenseMessage, Buffer.from(publicKeyBase64, 'base64'));
                if (valid) {
                    console.log('License Key: ' + sig.data.toString('base64'));
                }
                else {
                    console.log('Fatal: signed signaure does not verified to be true');
                }
            });
        });
    }
    verifyLicense() {
        const pubkeySource = fs.existsSync('license-public-key') ? 'license-public-key' : 'src/app/ganymede/license-public-key';
        const publicKeyBase64 = fs.readFileSync(pubkeySource, 'utf8').split(':')[1];
        const org = config.license.org;
        const user = config.license.user;
        const app = config.license.app;
        const domain = config.license.domain;
        const scope = config.license.scope;
        const etc = config.license.etc;
        const licenseMessage = Buffer.from(`GANYMEDE_LICENSE___${org}___${user}___${app}___${domain}___${scope}___${etc}`);
        const sigData = Buffer.from(config.license.key, 'base64');
        const valid = fourq_1.FourQ.verify(sigData, licenseMessage, Buffer.from(publicKeyBase64, 'base64'));
        const licenseMessage2 = Buffer.from(`GANYMEDE_LICENSE___${org}___${user}___${app}___localhost___${scope}___${etc}`);
        const sigData2 = Buffer.from(config.license.keyLocal, 'base64');
        const valid2 = fourq_1.FourQ.verify(sigData2, licenseMessage2, Buffer.from(publicKeyBase64, 'base64'));
        console.log(`domain=${valid ? 'valid' : 'not_valid'};localhost=${valid2 ? 'valid' : 'not_valid'}`);
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
        if (!fs.existsSync('src/global.scss')) {
            fs.writeFileSync('src/global.scss', '');
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
        if (fs.existsSync('package.saved.json')) {
            const pkgTemplate = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
            const pkgSaved = JSON.parse(fs.readFileSync('package.saved.json', 'utf-8'));
            for (const field of Object.keys(pkgSaved)) {
                if (field === 'name' || field === 'version') {
                    continue;
                }
                for (const field2 of Object.keys(pkgSaved[field])) {
                    pkgTemplate[field][field2] = pkgSaved[field][field2];
                }
            }
            fs.writeFileSync('package.json', JSON.stringify(pkgTemplate, null, 2));
        }
    }
    templateLoad() {
        const templateName = config.template.main;
        let moduleTsContent = fs.readFileSync('src/app/app.module.ts', 'utf-8');
        moduleTsContent = moduleTsContent.replace('<gany.APP_TEMPLATE_NAME>', templateName);
        moduleTsContent = moduleTsContent.replace('<gany.APP_IMPORTS>', '');
        moduleTsContent = moduleTsContent.replace('<gany.APP_DECLARATIONS>', '');
        fs.writeFileSync('src/app/app.module.ts', moduleTsContent);
    }
    loadConfig(configPath = defaultConfigPath) {
        if (!config) {
            try {
                config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            }
            catch (e) {
                config = null;
            }
        }
    }
    initializeReplaces(configPath = defaultConfigPath) {
        this.loadConfig(configPath);
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
        new langster_1.NgxTranslateLangster({
            folderPath: i18nPath,
            langPackExtension: '.lang.js',
            ignorePatternsAdditional: ['**/ganymede/**', '**/ganymede.ts']
        }).generateFromJson();
    }
    i18nUpdate() {
        const i18nPath = fs.existsSync('src/assets/i18n') ? 'src/assets/i18n' : '../../assets/i18n';
        new langster_1.NgxTranslateLangster({
            folderPath: i18nPath,
            langPackExtension: '.lang.js',
            ignorePatternsAdditional: ['**/ganymede/**', '**/ganymede.ts']
        }).update();
    }
    configReplacerDo() {
        this.initializeReplaces();
        const allTargets = [].concat(configReplacerTargets, styleReplacesTargets);
        for (const filePath of allTargets) {
            try {
                console.log(`Setting template variables in '${filePath}'`);
                const backUpFilePath = this.getBackUpFilePath(filePath);
                if (!fs.existsSync(backUpFilePath)) {
                    fs.copyFileSync(filePath, backUpFilePath);
                }
                let fileContent = fs.readFileSync(filePath, 'utf-8');
                for (const replacer of allReplaces) {
                    fileContent = fileContent.replace(replacer.find, replacer.value);
                }
                fs.writeFileSync(filePath, fileContent);
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    configReplacerUndo() {
        this.initializeReplaces();
        const allTargets = [].concat(configReplacerTargets, styleReplacesTargets);
        for (const filePath of allTargets) {
            try {
                console.log(`Reverting template variables in '${filePath}'`);
                const backUpFilePath = this.getBackUpFilePath(filePath);
                if (fs.existsSync(backUpFilePath)) {
                    fs.copyFileSync(backUpFilePath, filePath);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    }
    configReplacerRefresh() {
        this.configReplacerUndo();
        this.configReplacerDo();
    }
    getBackUpFilePath(filePath) {
        const dotSplit = filePath.split('.');
        const extension = dotSplit.pop();
        dotSplit.push('TEMPLATE');
        dotSplit.push(extension);
        return dotSplit.join('.');
    }
}
const appGen = new GanymedeAppGenerator();
appGen.loadConfig();
appGen.executeBasedOnArgs();
function prepCommandLineArgs() {
    const args = JSON.parse(JSON.stringify(process.argv));
    args.shift();
    args.shift();
    return args;
}
function requireGanyConf() {
    if (!config) {
        console.log(new Error('This command requires ganymede.conf.json to exist at cwd.'));
        process.exit(1);
    }
}
function getRequest(host, path, port = 80) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(resolve => {
            http.request({ host, path, port }, (res) => {
                const chunks = [];
                res.on('data', chunk => { chunks.push(chunk); });
                res.on('end', () => { resolve(chunks.join('')); });
            }).end();
        });
    });
}
