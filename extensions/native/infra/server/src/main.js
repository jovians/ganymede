"use strict";
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
exports.__esModule = true;
var native_infra_server_1 = require("./native.infra.server");
var extData = process.env.EXT_DATA_BASE64;
if (extData) {
    extData = JSON.parse(Buffer.from(extData, 'base64').toString('utf8'));
}
var globalConfData = process.env.GLOBAL_CONF_DATA_BASE64;
if (globalConfData) {
    globalConfData = JSON.parse(Buffer.from(globalConfData, 'base64').toString('utf8'));
}
new native_infra_server_1.NativeInfraExtensionServer().start(extData, globalConfData);
