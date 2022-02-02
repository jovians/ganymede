"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGanymedeAppData = exports.GanymedeAppData = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var baseImgPath = '/assets/img';
var baseIcoPath = '/assets/ico';
var baseVidPath = '/assets/vid';
var self = new Function('return this')();
var isNodeJs = self.btoa === undefined;
var useDestor = true;
var GanymedeAppData = /** @class */ (function () {
    function GanymedeAppData(initializer) {
        this.name = 'Ganymede App';
        this.fullname = "Sample Ganymede App";
        this.toptitle = "";
        this.subtitle = "";
        this.logo = baseIcoPath + "/apple-icon.png";
        this.icon = baseIcoPath + "/apple-icon.png";
        this.loginImage = baseImgPath + "/s.jpg";
        this.landingPath = "/";
        this.landingVideo = "";
        this.lang = 'en';
        this.langList = ['en'];
        this.defaultUserContentsPath = '/assets/contents';
        this.features = {
            licenseFooter: { messageHTML: 'Powered by Ganymede' },
            // preinit: {},
            // serviceWorker: { enabled: true },
        };
        this.base = {};
        this.extensions = {};
        this.secretsResolution = useDestor ? {
            type: 'source-from-destor',
        } : {
            type: 'local-json-file', jsonFile: 'ganymede.secrets.json'
        };
        this.logger = null;
        this.header = {
            alwaysOn: true, exceptRoutes: [],
            search: { enabled: false }
        };
        this.headerActions = [];
        this.footer = { alwaysOn: false, exceptRoutes: [] };
        this.footerActions = { left: [], middle: [], right: [] };
        this.requestIntercept = { type: 'simple' };
        this.theme = { base: 'CLARITY', type: 'LIGHT' };
        if (initializer) {
            var defaultFeatures = this.features;
            Object.assign(this, initializer);
            for (var _i = 0, _a = Object.keys(defaultFeatures); _i < _a.length; _i++) {
                var featureName = _a[_i];
                if (!this.features[featureName]) {
                    this.features[featureName] = defaultFeatures[featureName];
                }
            }
        }
    }
    return GanymedeAppData;
}());
exports.GanymedeAppData = GanymedeAppData;
function getGanymedeAppData() {
    if (!isNodeJs) {
        return self.ganymedeAppData;
    }
}
exports.getGanymedeAppData = getGanymedeAppData;
