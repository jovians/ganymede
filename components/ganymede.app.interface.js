"use strict";
exports.__esModule = true;
var rxjs_1 = require("rxjs");
var debug_controller_1 = require("./util/debug.controller");
var baseImgPath = '/assets/img';
var baseIcoPath = '/assets/ico';
var baseVidPath = '/assets/vid';
var self = new Function('return this')();
var isNodeJs = self.btoa === undefined;
var GanymedeAppData = /** @class */ (function () {
    function GanymedeAppData(initializer) {
        this.name = 'Ganymede App';
        this.fullname = "Sample Ganymede App";
        this.toptitle = "";
        this.subtitle = "";
        this.logo = baseIcoPath + "/apple-icon.png";
        // logoTitle = `${baseImgPath}/.png`;
        // logoTitleVertical = `${baseImgPath}/.png`;
        this.icon = baseIcoPath + "/apple-icon.png";
        this.loginImage = baseImgPath + "/s.jpg";
        this.landingPath = "/";
        this.landingVideo = "";
        this.lang = 'en';
        this.langList = ['en'];
        this.defaultUserContentsPath = '/assets/user-contents';
        this.routeData = new rxjs_1.Subject();
        this.features = {
            preinit: {},
            licenseFooter: { messageHTML: 'Powered by Ganymede' }
        };
        this.header = {
            alwaysOn: true, exceptRoutes: [],
            search: { enabled: false }
        };
        this.headerActions = [];
        this.footer = { alwaysOn: false, exceptRoutes: [] };
        this.footerActions = { left: [], middle: [], right: [] };
        this.requestIntercept = { type: 'simple' };
        this.debug = debug_controller_1.debugController;
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
