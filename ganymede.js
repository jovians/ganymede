"use strict";
/**
 * Jovian Ganymede App Generator (Angular using Clarity, and server components)
 * (c) Jovian 2020, All rights reserved.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
// tslint:disable: no-console
var fs = require("fs");
var crypto = require("crypto");
var fourq_1 = require("@jovian/fourq");
var langster_1 = require("@jovian/langster");
var http = require('http');
var allReplaces = [];
var config = null;
var defaultConfigPath = 'ganymede.conf.json';
var configReplacerTargets = [
    'package.json',
    'angular.json',
    'karma.conf.js',
    'src/index.html',
    'src/assets/ico/manifest.json',
];
var styleReplacesTargets = [
    'src/variables.scss',
];
var GanymedeAppGenerator = /** @class */ (function () {
    function GanymedeAppGenerator() {
    }
    GanymedeAppGenerator.prototype.executeBasedOnArgs = function () {
        var a = prepCommandLineArgs();
        var opname = a[0];
        if (opname === 'appset') {
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
            this.templateLoad();
        }
        else if (opname === 'license-keygen') {
            this.generateLicenseSigningKey();
        }
        else if (opname === 'license-sign') {
            this.signLicense(a[1], a[2], a[3], a[4]);
        }
        else if (opname === 'license-verify') {
            this.verifyLicense();
        }
        else if (opname === 'license-stamp') {
            this.stampLicense();
        }
        else if (opname === 'param-file-init') {
            this.paramFileInit();
        }
        else if (opname === 'i18n-update') {
            this.i18nUpdate();
        }
        else if (opname === 'i18n-generate') {
            this.i18nGenerateFromJson();
        }
        else if (opname === 'encrypt-file') {
            this.encryptFile(a[1], a[2]);
        }
        else if (opname === 'decrypt-file') {
            this.decryptFile(a[1], a[2]);
        }
        else if (opname === 'product-name') {
            console.log(config.productName);
        }
        else if (opname === 'stash') {
            // this.encryptFile(a[1], a[2]);
        }
        else if (opname === 'stash-pop') {
            // this.decryptFile(a[1], a[2]);
        }
    };
    GanymedeAppGenerator.prototype.encryptFile = function (filePath, passphrase) {
        if (!passphrase) {
            if (fs.existsSync('./.archive.encryption.key')) {
                passphrase = fs.readFileSync('./.archive.encryption.key', 'utf8');
            }
            else {
                throw new Error('Passphrase is required for encryption');
            }
        }
        var fileContent = fs.readFileSync(filePath);
        var passphraseHash = crypto.createHash('sha256').update('AES_ENCRYPT_SALT::' + passphrase).digest();
        var iv = crypto.randomBytes(16);
        var cipher = crypto.createCipheriv('aes-256-cbc', passphraseHash, iv);
        var encrypted = cipher.update(fileContent);
        encrypted = Buffer.concat([encrypted, cipher.final()]);
        var encryptedFileData = Buffer.concat([Buffer.from('aes-256-cbc:' + iv.toString('hex') + ':', 'ascii'), encrypted]);
        fs.writeFileSync(filePath + '.enc', encryptedFileData);
    };
    GanymedeAppGenerator.prototype.decryptFile = function (filePath, passphrase) {
        if (!passphrase) {
            if (fs.existsSync('./.archive.encryption.key')) {
                passphrase = fs.readFileSync('./.archive.encryption.key', 'utf8');
            }
            else {
                throw new Error('Passphrase is required for decryption');
            }
        }
        var fileContents = fs.readFileSync(filePath);
        var passphraseHash = crypto.createHash('sha256').update('AES_ENCRYPT_SALT::' + passphrase).digest();
        var encryptionScheme = 'aes-256-cbc';
        var ivEnd;
        for (var i = 12; i < fileContents.length; ++i) {
            if (fileContents[i] === 58) {
                ivEnd = i;
                break;
            }
        }
        var encryptionIV = Buffer.from(fileContents.slice(12, ivEnd).toString('ascii'), 'hex');
        var encryptedData = fileContents.slice(ivEnd + 1);
        var decrypted;
        try {
            var decipher = crypto.createDecipheriv(encryptionScheme, passphraseHash, encryptionIV);
            decrypted = decipher.update(encryptedData);
            decrypted = Buffer.concat([decrypted, decipher.final()]);
        }
        catch (e) {
            return console.log('Passphrase incorrect.');
        }
        fs.writeFileSync(filePath.slice(0, -4), decrypted);
    };
    GanymedeAppGenerator.prototype.generateLicenseSigningKey = function () {
        var seed = crypto.randomBytes(32);
        var keypair = fourq_1.FourQ.generateFromSeed(seed);
        var publicKeyBase64 = keypair.publicKey.toString('base64');
        var secretKeyBase64 = keypair.secretKey.toString('base64');
        fs.writeFileSync('license-public-key', 'fourq:' + publicKeyBase64);
        var prompt = require('prompt');
        prompt.start();
        prompt.get([{ name: 'passphrase', hidden: true }], function (e, result) {
            if (e) {
                return console.log('\nCanceled.');
            }
            var passphrase = result.passphrase;
            var passphraseHash = crypto.createHash('sha256').update('GANYMEDE_SALT::' + passphrase).digest();
            var iv = crypto.randomBytes(16);
            var cipher = crypto.createCipheriv('aes-256-cbc', passphraseHash, iv);
            var encrypted = cipher.update(Buffer.from(secretKeyBase64, 'base64'));
            encrypted = Buffer.concat([encrypted, cipher.final()]);
            var encryptedPrivateKeyData = 'aes-256-cbc:' + iv.toString('hex') + ':' + encrypted.toString('hex');
            fs.writeFileSync('.license-signing-key', encryptedPrivateKeyData);
            console.log('Public Key: ' + publicKeyBase64);
            console.log('Encrypted Private Key: ' + encryptedPrivateKeyData);
        });
    };
    GanymedeAppGenerator.prototype.signLicense = function (org, user, domain, scope) {
        return __awaiter(this, void 0, void 0, function () {
            var encryptedPrivateKeyInfo, publicKeyBase64, prompt;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, getRequest('127.0.0.1', '/get-encryped-signing-key', 58267)];
                    case 1:
                        encryptedPrivateKeyInfo = (_a.sent()).split(':');
                        publicKeyBase64 = fs.readFileSync('license-public-key', 'utf8').split(':')[1];
                        prompt = require('prompt');
                        prompt.start();
                        prompt.get([{ name: 'passphrase', hidden: true }], function (e, result) {
                            if (e) {
                                return console.log('\nCanceled.');
                            }
                            var passphrase = result.passphrase;
                            var passphraseHash = crypto.createHash('sha256').update('GANYMEDE_SALT::' + passphrase).digest();
                            var encryptionScheme = encryptedPrivateKeyInfo.shift();
                            var encryptionIV = encryptedPrivateKeyInfo.shift();
                            var encryptedText = encryptedPrivateKeyInfo.shift();
                            var encryptedData = Buffer.from(encryptedText, 'hex');
                            var decrypted;
                            try {
                                var decipher = crypto.createDecipheriv(encryptionScheme, passphraseHash, Buffer.from(encryptionIV, 'hex'));
                                decrypted = decipher.update(encryptedData);
                                decrypted = Buffer.concat([decrypted, decipher.final()]);
                            }
                            catch (e) {
                                return console.log('Passphrase incorrect.');
                            }
                            // console.log(decrypted.toString('base64'));
                            var secretKey = decrypted;
                            var licenseMessage = Buffer.from("GANYMEDE_LICENSE___" + org + "___" + user + "___" + domain + "___" + scope);
                            var sig = fourq_1.FourQ.sign(licenseMessage, secretKey);
                            var valid = fourq_1.FourQ.verify(sig.data, licenseMessage, Buffer.from(publicKeyBase64, 'base64'));
                            if (valid) {
                                console.log('License Key: ' + sig.data.toString('base64'));
                            }
                            else {
                                console.log('Fatal: signed signaure does not verified to be true');
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    GanymedeAppGenerator.prototype.verifyLicense = function () {
        var publicKeyBase64 = fs.readFileSync('src/app/ganymede/license-public-key', 'utf8').split(':')[1];
        var org = config.license.org;
        var user = config.license.user;
        var domain = config.license.domain;
        var scope = config.license.scope;
        var licenseMessage = Buffer.from("GANYMEDE_LICENSE___" + org + "___" + user + "___" + domain + "___" + scope);
        var sigData = Buffer.from(config.license.key, 'base64');
        var valid = fourq_1.FourQ.verify(sigData, licenseMessage, Buffer.from(publicKeyBase64, 'base64'));
        console.log(valid ? 'GANYMEDE_LICENSE_VALID' : 'GANYMEDE_LICENSE_NOT_VALID');
        return valid;
    };
    GanymedeAppGenerator.prototype.stampLicense = function () {
        var indexContent = fs.readFileSync('src/index.html', 'utf-8');
        indexContent = indexContent.replace('<gany.LICENSE_ORG>', config.license.org);
        indexContent = indexContent.replace('<gany.LICENSE_USER>', config.license.user);
        indexContent = indexContent.replace('<gany.LICENSE_DOMAIN>', config.license.domain);
        indexContent = indexContent.replace('<gany.LICENSE_SCOPE>', config.license.scope);
        indexContent = indexContent.replace('<gany.LICENSE_KEY>', config.license.key);
        fs.writeFileSync('src/index.html', indexContent);
    };
    GanymedeAppGenerator.prototype.paramFileInit = function () {
        if (!fs.existsSync('src/global.scss')) {
            fs.writeFileSync('src/global.scss', '');
        }
    };
    GanymedeAppGenerator.prototype.generate = function () {
        console.log("Setting template variables...");
        this.configReplacerDo();
    };
    GanymedeAppGenerator.prototype.revert = function () {
        console.log("Reverting template variables...");
        this.configReplacerUndo();
    };
    GanymedeAppGenerator.prototype.refresh = function () {
        console.log("Refreshing template variables...");
        this.configReplacerRefresh();
    };
    GanymedeAppGenerator.prototype.packageJsonImport = function () {
        if (fs.existsSync('package.saved.json')) {
            var pkgTemplate = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
            var pkgSaved = JSON.parse(fs.readFileSync('package.saved.json', 'utf-8'));
            for (var _i = 0, _a = Object.keys(pkgSaved); _i < _a.length; _i++) {
                var field = _a[_i];
                if (field === 'name' || field === 'version') {
                    continue;
                }
                for (var _b = 0, _c = Object.keys(pkgSaved[field]); _b < _c.length; _b++) {
                    var field2 = _c[_b];
                    pkgTemplate[field][field2] = pkgSaved[field][field2];
                }
            }
            fs.writeFileSync('package.json', JSON.stringify(pkgTemplate, null, 2));
        }
    };
    GanymedeAppGenerator.prototype.templateLoad = function () {
        var templateName = config.template.main;
        var moduleTsContent = fs.readFileSync('src/app/app.module.ts', 'utf-8');
        moduleTsContent = moduleTsContent.replace('<gany.APP_TEMPLATE_NAME>', templateName);
        moduleTsContent = moduleTsContent.replace('<gany.APP_IMPORTS>', '');
        moduleTsContent = moduleTsContent.replace('<gany.APP_DECLARATIONS>', '');
        fs.writeFileSync('src/app/app.module.ts', moduleTsContent);
    };
    GanymedeAppGenerator.prototype.loadConfig = function (configPath) {
        if (configPath === void 0) { configPath = defaultConfigPath; }
        if (!config) {
            config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
        }
    };
    GanymedeAppGenerator.prototype.initializeReplaces = function (configPath) {
        if (configPath === void 0) { configPath = defaultConfigPath; }
        this.loadConfig(configPath);
        allReplaces.length = 0;
        for (var _i = 0, _a = Object.keys(config.replacer); _i < _a.length; _i++) {
            var replaceKey = _a[_i];
            allReplaces.push({
                find: new RegExp("" + replaceKey, 'g'),
                value: config.replacer[replaceKey] + ''
            });
        }
        for (var _b = 0, _c = Object.keys(config.styles.replacer); _b < _c.length; _b++) {
            var replaceKey = _c[_b];
            allReplaces.push({
                find: new RegExp("\\" + replaceKey + "__", 'g'),
                value: config.styles.replacer[replaceKey] + ''
            });
        }
    };
    GanymedeAppGenerator.prototype.i18nGenerateFromJson = function () {
        var i18nPath = fs.existsSync('src/assets/i18n') ? 'src/assets/i18n' : '../../assets/i18n';
        new langster_1.NgxTranslateLangster({
            folderPath: i18nPath,
            langPackExtension: '.lang.js',
            ignorePatternsAdditional: ['**/ganymede/**', '**/ganymede.ts']
        }).generateFromJson();
    };
    GanymedeAppGenerator.prototype.i18nUpdate = function () {
        var i18nPath = fs.existsSync('src/assets/i18n') ? 'src/assets/i18n' : '../../assets/i18n';
        new langster_1.NgxTranslateLangster({
            folderPath: i18nPath,
            langPackExtension: '.lang.js',
            ignorePatternsAdditional: ['**/ganymede/**', '**/ganymede.ts']
        }).update();
    };
    GanymedeAppGenerator.prototype.configReplacerDo = function () {
        this.initializeReplaces();
        var allTargets = [].concat(configReplacerTargets, styleReplacesTargets);
        for (var _i = 0, allTargets_1 = allTargets; _i < allTargets_1.length; _i++) {
            var filePath = allTargets_1[_i];
            try {
                console.log("Setting template variables in '" + filePath + "'");
                var backUpFilePath = this.getBackUpFilePath(filePath);
                if (!fs.existsSync(backUpFilePath)) {
                    fs.copyFileSync(filePath, backUpFilePath);
                }
                var fileContent = fs.readFileSync(filePath, 'utf-8');
                for (var _a = 0, allReplaces_1 = allReplaces; _a < allReplaces_1.length; _a++) {
                    var replacer = allReplaces_1[_a];
                    fileContent = fileContent.replace(replacer.find, replacer.value);
                }
                fs.writeFileSync(filePath, fileContent);
            }
            catch (e) {
                console.error(e);
            }
        }
    };
    GanymedeAppGenerator.prototype.configReplacerUndo = function () {
        this.initializeReplaces();
        var allTargets = [].concat(configReplacerTargets, styleReplacesTargets);
        for (var _i = 0, allTargets_2 = allTargets; _i < allTargets_2.length; _i++) {
            var filePath = allTargets_2[_i];
            try {
                console.log("Reverting template variables in '" + filePath + "'");
                var backUpFilePath = this.getBackUpFilePath(filePath);
                if (fs.existsSync(backUpFilePath)) {
                    fs.copyFileSync(backUpFilePath, filePath);
                }
            }
            catch (e) {
                console.error(e);
            }
        }
    };
    GanymedeAppGenerator.prototype.configReplacerRefresh = function () {
        this.configReplacerUndo();
        this.configReplacerDo();
    };
    GanymedeAppGenerator.prototype.getBackUpFilePath = function (filePath) {
        var dotSplit = filePath.split('.');
        var extension = dotSplit.pop();
        dotSplit.push('TEMPLATE');
        dotSplit.push(extension);
        return dotSplit.join('.');
    };
    return GanymedeAppGenerator;
}());
var appGen = new GanymedeAppGenerator();
appGen.loadConfig();
appGen.executeBasedOnArgs();
function prepCommandLineArgs() {
    var args = JSON.parse(JSON.stringify(process.argv));
    args.shift();
    args.shift(); // remove cmd and file; `node file.js`
    return args;
}
function getRequest(host, path, port) {
    if (port === void 0) { port = 80; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) {
                    http.request({ host: host, path: path, port: port }, function (res) {
                        var chunks = [];
                        res.on('data', function (chunk) { chunks.push(chunk); });
                        res.on('end', function () { resolve(chunks.join('')); });
                    }).end();
                })];
        });
    });
}
