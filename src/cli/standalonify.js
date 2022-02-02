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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Standalonify = exports.StandalonifyConfig = void 0;
const fs = __importStar(require("fs"));
const node_html_parser_1 = require("node-html-parser");
const common_1 = require("../../components/util/shared/common");
const srcResolverLogic = `\
window.baseHref="/";
window.srcResolver = function(url) {
  if (window.standaloneHtmlAssets && !url.startsWith('http://') && !url.startsWith('https://')) {
    if (!url.startsWith('/')) { url = '/' + url; }
    const baseHrefTrimmed = window.baseHref.endsWith('/') ? window.baseHref.slice(0, -1) : window.baseHref;
    if (url.startsWith(baseHrefTrimmed + '/assets/')) {
      const uriKey = url.substring(baseHrefTrimmed.length + 1);
      const base64Uri = window.standaloneHtmlAssets[uriKey];
      return base64Uri ? base64Uri : url;
    } else if (url.startsWith('/assets/')) {
      const base64Uri = window.standaloneHtmlAssets[url.slice(1)];
      return base64Uri ? base64Uri : url;
    }
  }
  return url;
};

window.standaloneHtmlAssets = {\n`;
class StandalonifyConfig {
    constructor(init) {
        this.cwd = '';
        if (init) {
            Object.assign(this, init);
        }
        (0, common_1.completeConfigDirectly)(this, StandalonifyConfig.defaultConfig);
    }
}
exports.StandalonifyConfig = StandalonifyConfig;
StandalonifyConfig.defaultConfig = {
    cwd: ''
};
class Standalonify {
    constructor(config) {
        this.config = new StandalonifyConfig();
        if (config) {
            this.config = new StandalonifyConfig(config);
        }
    }
    execute() {
        const indexContent = fs.readFileSync(this.filepath(`index.html`), 'utf8');
        let replacedContent = indexContent;
        const htmlTree = (0, node_html_parser_1.parse)(indexContent);
        const html = htmlTree.childNodes[1];
        let head, body;
        for (const el of html.childNodes) {
            if (el.rawTagName === 'head') {
                head = el;
            }
            if (el.rawTagName === 'body') {
                body = el;
            }
        }
        const allJsSources = [];
        for (const el of head.childNodes) {
            if (!el.rawTagName) {
                continue;
            }
            if (el.rawTagName === 'link') {
                const isIcon = el.attributes.rel && el.attributes.href && el.attributes.rel.indexOf('icon') >= 0;
                const isStyle = el.attributes.rel === 'stylesheet' || (el.attributes.rel === 'preload' && el.attributes.as === 'style');
                if (isIcon || isStyle) {
                    const file = el.attributes.href;
                    replacedContent = replacedContent.replace(`href="${file}"`, `href="${this.getFileDataUri(file)}"`);
                }
            }
            if (el.rawTagName === 'script' && el.attributes.src) {
                allJsSources.push({ type: 'regular', file: el.attributes.src });
            }
        }
        for (const el of body.childNodes) {
            if (!el.rawTagName) {
                continue;
            }
            if (el.rawTagName === 'script' && el.attributes.src) {
                allJsSources.push({ type: 'angular', file: el.attributes.src });
            }
        }
        const jsMonoliths = [
            'window.standaloneHtml = true;\n'
        ];
        for (const jsSrc of allJsSources) {
            if (jsSrc.type === 'regular') {
                jsMonoliths.push(`(function(){\n${this.fileContentInUtf8(jsSrc.file)}\n})();`);
            }
            else {
                jsMonoliths.push(this.fileContentInUtf8(jsSrc.file));
            }
        }
        let standaloneHtmlAssets = [];
        let jsMonolithsJoined = jsMonoliths.join('\n');
        const jsMonolith = `${this.getDataUriHeader('.js')},${Buffer.from(jsMonolithsJoined, 'utf8').toString('base64')}`;
        const lines = replacedContent.split('\n');
        const newLinesWithoutScript = [];
        for (const line of lines) {
            if (!line.trim().startsWith('<script')) {
                newLinesWithoutScript.push(line);
            }
        }
        if (jsMonolithsJoined.indexOf('"standaloneHtmlAssets":[') >= 0) {
            const assetsListStr = jsMonolithsJoined.split('"standaloneHtmlAssets":')[1].split(']')[0] + ']';
            standaloneHtmlAssets = JSON.parse(assetsListStr);
            if (standaloneHtmlAssets.length > 0) {
                let standaloneHtmlAssetsJs = srcResolverLogic;
                const standaloneHtmlAssetsLines = [];
                for (const assetFile of standaloneHtmlAssets) {
                    standaloneHtmlAssetsLines.push(`\n  "${assetFile}":\n    "${this.getFileDataUri(assetFile)}"`);
                }
                standaloneHtmlAssetsJs += standaloneHtmlAssetsLines.join(',\n') + '}';
                jsMonolithsJoined = `${standaloneHtmlAssetsJs}\n\n${jsMonolithsJoined}`;
            }
        }
        jsMonolithsJoined = `window.standaloneHtml = true;\n\n${jsMonolithsJoined}`;
        replacedContent = newLinesWithoutScript.join('\n');
        replacedContent = replacedContent.split('<body>')[0] + `<body><app-root></app-root><script defer src="main.monolith.js"></script></body>\n</html>`;
        fs.writeFileSync(this.filepath(`index.standalone.html`), replacedContent, 'utf8');
        fs.writeFileSync(this.filepath(`main.monolith.js`), jsMonolithsJoined, 'utf8');
    }
    filepath(file) { return this.config.cwd ? `${this.config.cwd}/${file}` : file; }
    fileContentInUtf8(file) {
        while (file && file.startsWith('/')) {
            file = file.slice(1);
        }
        try {
            return fs.readFileSync(this.filepath(file), 'utf8');
        }
        catch (e) {
            console.log(`ERROR while getting ${file}`);
        }
        return null;
    }
    fileBinaryContentInBase64(file) {
        while (file && file.startsWith('/')) {
            file = file.slice(1);
        }
        try {
            return fs.readFileSync(this.filepath(file)).toString('base64');
        }
        catch (e) {
            console.log(`ERROR while getting ${file}`);
        }
        return null;
    }
    getDataUriHeader(file) {
        if (file.indexOf('.') < 0) {
            return `data:text/plain;base64`;
        }
        const extension = file.split('.').pop();
        switch (extension.toLowerCase()) {
            case 'png': return `data:image/png;base64`;
            case 'jpg':
            case 'jpeg': return `data:image/jpeg;base64`;
            case 'svg': return `data:image/svg+xml;base64`;
            case 'gif': return `data:image/gif;base64`;
            case 'css': return `data:text/css;base64`;
            case 'xml': return `data:text/xml;base64`;
            case 'js': return `data:application/javascript;base64`;
            case 'json': return `data:application/json;base64`;
            case 'ico': return `data:image/vnd.microsoft.icon;base64`;
            case 'html': return `data:text/html;base64`;
        }
        return `data:text/plain;base64`;
    }
    getFileDataUri(file) {
        return `${this.getDataUriHeader(file)},${this.fileBinaryContentInBase64(file)}`;
    }
}
exports.Standalonify = Standalonify;
new Standalonify({
    cwd: '/Users/joe/Documents/GitHub/happyfam/dist/export'
}).execute();
