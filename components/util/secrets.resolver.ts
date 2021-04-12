/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { GanymedeSecretsResolver } from '../ganymede.app.interface';
import { ganymedeAppData } from '../../../../../ganymede.app';

const isNodeJs = (typeof process !== 'undefined') && (process.release.name === 'node');

export class SecretsResolver {
  static prefix: string = '<secret.';

  isLocalJson = false;
  allData: any = null;
  config: GanymedeSecretsResolver;

  constructor(config: GanymedeSecretsResolver) {
    this.config = config;
    if (config.type === 'local-json-file') {
      this.isLocalJson = true;
      if (isNodeJs) {
        const fs = require('fs');
        if (fs.existsSync(config.jsonFile)) {
          this.allData = JSON.parse(fs.readFileSync(config.jsonFile, 'utf8'));
        } else {
          throw new Error(`Cannot find secrets datastore file: '${config.jsonFile}'`);
        }
      }
    }
  }
  async resolveContent(content: string): Promise<string> {
    // TODO
    return null;
  }
  async resolve(expression: string): Promise<string> {
    return new Promise<string>(resolve => {
      if (!expression || !expression.startsWith(SecretsResolver.prefix)) {
        return resolve(expression);
      }
      try {
        const secretPaths = expression.split(SecretsResolver.prefix)[1].split('>')[0].split('.');
        let current;
        if (this.isLocalJson) {
          current = this.allData;
        } else {
          // TODO
        }
        if (!current) {
          return resolve(expression);
        }
        for (const key of secretPaths) {
          if (!current || !current[key]) {
            return resolve(expression);
          }
          current = current[key];
        }
        if (current && typeof current === 'string') {
          return resolve(current);
        } else {
          return resolve(expression);
        }
      } catch (e) {
        return resolve(expression);
      }
    });
  }
}

export const secrets = new SecretsResolver(ganymedeAppData.secretsResolution);
