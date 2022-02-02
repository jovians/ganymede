/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import * as fs from 'fs';

export const secretsConfig = fs.existsSync('config/ganymede.secrets.json') ?
                JSON.parse(fs.readFileSync('config/ganymede.secrets.json', 'utf8'))
              : JSON.parse(fs.readFileSync('ganymede.secrets.json', 'utf8'));

