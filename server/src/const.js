"use strict";
exports.__esModule = true;
exports.ServerConst = void 0;
var ServerConst = /** @class */ (function () {
    function ServerConst() {
    }
    ServerConst.setData = function (data) { ServerConst.data = data; ServerConst.initialized = true; };
    ServerConst.initialized = false;
    ServerConst.data = {
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
                    allowRequestHeaders: '*'
                }
            },
            ext: {
                basePath: '/api-ext'
            }
        },
        base: {
            modules: {
                auth: { type: 'default' },
                mailer: {
                    type: '', data: { id: '', key: '' }
                }
            }
        },
        extensions: {
            native: {},
            external: {}
        }
    };
    return ServerConst;
}());
exports.ServerConst = ServerConst;
