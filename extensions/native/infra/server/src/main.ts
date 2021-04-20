/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { NativeInfraExtensionServer } from './native.infra.server';

let extData = process.env.EXT_DATA_BASE64;
if (extData) { extData = JSON.parse(Buffer.from(extData, 'base64').toString('utf8')); }

let globalConfData = process.env.GLOBAL_CONF_DATA_BASE64;
if (globalConfData) { globalConfData = JSON.parse(Buffer.from(globalConfData, 'base64').toString('utf8')); }

new NativeInfraExtensionServer().start(extData, globalConfData);
