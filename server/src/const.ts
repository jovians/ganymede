/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import {
  GanymedeAppBase,
  GanymedeAppExtensions,
} from '../../defaults/ganymede.app.interface';

export class ServerConst {
  static initialized = false;
  static data: ServerConstData = {
    prod: false,
    salts: {
      browserTimestamp: ''
    },
    global: {
      // global conf visible to all modules & extensions
      http: {
        securityHeaders: {
          profile: 'allow-all',
          allowRequestOrigin: '*',
          allowRequestHeaders: '*',
        }
      },
      destor: {
        basePath: '/api-destor',
      },
      auth: {
        basePath: '/api-auth',
      },
      ext: {
        basePath: '/api-ext',
      },
    },
    base: {
      modules: {
        auth: {
          type: 'default',
        },
        mailer: {
          type: '',
          data: { id: '', key: '' },
        },
      }
    },
    extensions: {
      native: {},
      external: {}
    }
  };
  static setData(data: ServerConstData) {
    ServerConst.data = data;
    ServerConst.initialized = true;
  }
}

export interface ServerConstData {
  prod?: boolean;
  context?: 'local-aio' | string;
  salts?: {
    browserTimestamp: string;
  };
  global?: ServerConstDataGlobal;
  base?: GanymedeAppBase;
  extensions?: GanymedeAppExtensions;
}

export interface ServerConstDataGlobal {
  http?: {
    securityHeaders?: {
      profile: 'allow-all' | string;
      allowRequestOrigin: '*' | string;
      allowRequestHeaders: '*' | string;
    }
  };
  api?: {
    basePath: '/api' | string;
  };
  destor?: {
    basePath: '/api-destor' | string;
  };
  auth?: {
    basePath: '/api-auth' | string;
  };
  ext?: {
    basePath: '/api-ext' | string;
  };
}
