import { GanymedeAppData } from './src/app/ganymede/components/ganymede.app.interface';
const ganymedeConfJson = require('./ganymede.conf.json');

export const ganymedeAppData = new GanymedeAppData({
  name: 'Ganymede App',

  lang: 'en',
  langList: ['en'],

  template: {
    header: {
      nav: [
        { path: 'ganymede-app', name: 'Ganymede App' },
      ],
      alwaysOn: false,
    }
  },

  features: {

  },

  conf: ganymedeConfJson,
});

const isNodeJs = (typeof process !== 'undefined') && (process.release.name === 'node');
if (!isNodeJs) {
  Object.defineProperty(window, 'ganymedeAppData', { get: () => ganymedeAppData });
}
