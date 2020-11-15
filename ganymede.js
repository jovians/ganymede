/**
 * Jovian Io App Generator (Angular using Clarity, and server components)
 * (c) Jovian 2020, All rights reserved.
 */
// tslint:disable: no-console
var fs = require('fs');
var crypt = require('crypto');
var execSync = require('child_process').execSync;
var allReplaces = [];
var config = null;
var defaultConfigPath = 'ganymede.conf.json';
var configReplacerTargets = [
    'package.json',
    'angular.json',
    'karma.conf.js',
    'src/index.html',
    'e2e/src/app.spec.ts',
];
var styleReplacesTargets = [
    'src/variables.scss',
];
var GanymedeAppGenerator = /** @class */ (function () {
    function GanymedeAppGenerator() {
    }
    GanymedeAppGenerator.prototype.executeBasedOnArgs = function () {
        var a = prepCommandLineArgs();
        if (a[0] === 'appset') {
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
        else if (a[0] === 'packages-update') {
            this.packageJsonImport();
        }
        else if (a[0] === 'template-load') {
            this.templateLoad();
        }
        else if (a[0] === 'license-sign') {
            this.signLicense(a[1], a[2], a[3], a[4]);
        }
        else if (a[0] === 'license-verify') {
            this.verifyLicense();
        }
    };
    GanymedeAppGenerator.prototype.signLicense = function (org, user, domain, scope) {
        var encryptedPrivateKey = fs.readFileSync('.license-signing-key');
        var privateKeyPassphrase = fs.readFileSync('.license-signing-key-passphrase');
        var signer = crypt.createSign('RSA-SHA256');
        signer.update("GANYMEDE_LICENSE___" + org + "___" + user + "___" + domain + "___" + scope);
        signer.end();
        var sig = signer.sign({
            key: encryptedPrivateKey,
            passphrase: privateKeyPassphrase
        }, 'hex');
        console.log('License Key: ' + sig);
        return sig;
    };
    GanymedeAppGenerator.prototype.verifyLicense = function () {
        var publicKey = fs.readFileSync('src/app/ganymede/.license-public-key');
        var verifier = crypt.createVerify('RSA-SHA256');
        var org = config.license.org;
        var user = config.license.user;
        var domain = config.license.domain;
        var scope = config.license.scope;
        verifier.update("GANYMEDE_LICENSE___" + org + "___" + user + "___" + domain + "___" + scope);
        var verified = verifier.verify(publicKey, config.license.key, 'hex');
        console.log(verified ? 'GANYMEDE_LICENSE_VALID' : 'GANYMEDE_LICENSE_NOT_VALID');
        var indexContent = fs.readFileSync('src/index.html', 'utf-8');
        indexContent = indexContent.replace('<gany.LICENSE_ORG>', config.license.org);
        indexContent = indexContent.replace('<gany.LICENSE_USER>', config.license.user);
        indexContent = indexContent.replace('<gany.LICENSE_DOMAIN>', config.license.domain);
        indexContent = indexContent.replace('<gany.LICENSE_SCOPE>', config.license.scope);
        indexContent = indexContent.replace('<gany.LICENSE_KEY>', config.license.key);
        fs.writeFileSync('src/index.html', indexContent);
        return verified;
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
    };
    GanymedeAppGenerator.prototype.templateLoad = function () {
        var templateName = config.template.main;
        var moduleTsContent = fs.readFileSync('src/app/app.module.ts', 'utf-8');
        moduleTsContent = moduleTsContent.replace('<gany.APP_TEMPLATE_NAME>', templateName);
        moduleTsContent = moduleTsContent.replace('<gany.APP_IMPORTS>', '');
        moduleTsContent = moduleTsContent.replace('<gany.APP_DECLARATIONS>', '');
        fs.writeFileSync('src/app/app.module.ts', moduleTsContent);
    };
    GanymedeAppGenerator.prototype.initialize = function (configPath) {
        if (configPath === void 0) { configPath = defaultConfigPath; }
        config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
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
    GanymedeAppGenerator.prototype.configReplacerDo = function () {
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
appGen.initialize();
appGen.executeBasedOnArgs();
function prepCommandLineArgs() {
    var args = JSON.parse(JSON.stringify(process.argv));
    args.shift();
    args.shift(); // remove cmd and file; `node file.js`
    return args;
}
