"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.secretsConfig = void 0;
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
var fs = require("fs");
exports.secretsConfig = fs.existsSync('config/ganymede.secrets.json') ?
    JSON.parse(fs.readFileSync('config/ganymede.secrets.json', 'utf8'))
    : JSON.parse(fs.readFileSync('ganymede.secrets.json', 'utf8'));
