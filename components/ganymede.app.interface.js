"use strict";
exports.__esModule = true;
var rxjs_1 = require("rxjs");
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
        this.logoTitle = baseImgPath + "/.png";
        // logoTitleVertical = `${baseImgPath}/.png`;
        this.icon = baseIcoPath + "/apple-icon.png";
        this.loginImage = baseImgPath + "/s.jpg";
        this.landingVideo = baseVidPath + "/devops_landing.mp4";
        this.lang = 'en';
        this.langList = ['en'];
        this.defaultUserContentsPath = '/assets/user-contents';
        this.routeData = new rxjs_1.Subject();
        this.features = {
            preinit: {}
        };
        if (initializer) {
            Object.assign(this, initializer);
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
