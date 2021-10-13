/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { GanymedeSecretsResolver } from '../../ganymede.app.interface';
import { ganymedeAppData } from '../../../../../../ganymede.app';
import * as fs from 'fs';
import { Destor } from './destor';
import { currentEnv } from '../shared/common';

export class SecretsResolver {
  static prefix: string = '<destor.';

  isLocalJson = false;
  allData: any = null;

  config: GanymedeSecretsResolver;

  constructor(config: GanymedeSecretsResolver) {
    this.config = config;
    if (config.type === 'local-json-file') {
      this.isLocalJson = true;
      if (fs.existsSync(config.jsonFile)) {
        this.allData = JSON.parse(fs.readFileSync(config.jsonFile, 'utf8'));
      } else {
        throw new Error(`Cannot find secrets datastore file: '${config.jsonFile}'`);
      }
    } else if (config.type === 'source-from-destor') {

    }
  }

  async resolveContent(content: string): Promise<string> {
    // TODO
    return null;
  }

  async resolveFromDestor(secretPath: string[]) {
    const result = await Destor.get({
      path: `/api-destor/v1/secret-resolve/${currentEnv}`, data: { path: secretPath }
    });
    if (!result) { return null; }
    return result.value;
  }

  async resolve(expression: string, passthru: boolean = false): Promise<string> {
    return new Promise<string>(async resolve => {
      const notFoundResponse = passthru ? expression : '';
      if (!expression || !expression.startsWith(SecretsResolver.prefix)) {
        return resolve(notFoundResponse);
      }
      try {
        const secretPaths = expression.split(SecretsResolver.prefix)[1].split('>')[0].split('.');
        let current;
        if (this.isLocalJson) {
          current = this.allData;
        } else {
          try {
            return resolve(await this.resolveFromDestor(secretPaths));
          } catch (e) {
            return resolve(notFoundResponse);
          }
        }
        if (!current) { return resolve(notFoundResponse); }
        for (const key of secretPaths) {
          if (key === '__perm__') { return resolve(notFoundResponse); }
          if (!current || !current[key]) { return resolve(notFoundResponse); }
          current = current[key];
        }
        if (current && typeof current === 'string') {
          return resolve(current);
        } else {
          return resolve(notFoundResponse);
        }
      } catch (e) {
        return resolve(notFoundResponse);
      }
    });
  }
}

export const secrets = new SecretsResolver(ganymedeAppData.secretsResolution);
