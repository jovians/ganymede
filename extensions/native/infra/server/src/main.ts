/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { DESTOR } from 'ts-comply/src/common/env/env.destor';
import { NativeInfraExtensionServer } from './native.infra.server';

let extData: any = process.env.EXT_DATA_BASE64;
if (extData) { extData = JSON.parse(Buffer.from(extData, 'base64').toString('utf8')); }
if (extData._destor_list) { DESTOR.LIST = extData._destor_list; }

let globalConfData: any = process.env.GLOBAL_CONF_DATA_BASE64;
if (globalConfData) { globalConfData = JSON.parse(Buffer.from(globalConfData, 'base64').toString('utf8')); }

new NativeInfraExtensionServer(extData, globalConfData).start({ port: extData.port });
