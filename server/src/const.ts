export class ServerConst {
  static initialized = false;
  static data = {
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
      ext: {
        basePath: '/api-ext',
      },
    },
    base: {
      modules: {
        auth: { type: 'default' },
        mailer: {
          type: '', data: { id: '', key: '' },
        },
      }
    },
    extensions: {
      native: {},
      external: {}
    } as {[extNs: string]: {[extKey: string]: any; }}
  };
  static setData(data) { ServerConst.data = data; ServerConst.initialized = true; }
}
