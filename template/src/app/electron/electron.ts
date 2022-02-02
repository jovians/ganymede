import { ElectronUtil } from '../ganymede/electron/electron.util';
import { GanymedeAppData } from '../../ganymede.app.interface';
import { ElectronCustomLogics as userCustom } from './entrypoint';
import { app, BrowserWindow, protocol, shell, ipcMain } from 'electron';
import * as fs from 'fs';

const ganymedeAppData: GanymedeAppData = !process.env.GANY_APP_DATA ? {} :
                          JSON.parse(Buffer.from(process.env.GANY_APP_DATA, 'base64').toString('utf8'));

const electronParams = !process.env.GANY_ELECTRON_DATA ? {} :
                          JSON.parse(Buffer.from(process.env.GANY_ELECTRON_DATA, 'base64').toString('utf8'));
const isDevEnv = fs.existsSync('dist-electron-src');
const appDir = isDevEnv ? __dirname.slice(0, -22) : __dirname.slice(0, -22) + '/app';
process.chdir(appDir);

const srcDir = isDevEnv ? `${appDir}/dist-electron-src/src` : `${appDir}/../dist-electron-src/src`;
const conf = require(`${appDir}/ganymede.conf.json`);
const profile = process.argv[2];
const testEnv = profile === 'test';
const serveRootDir = `${appDir}/dist/${conf.productName}`;

// tslint:disable-next-line: no-console
console.log(`electron module source: ${ElectronUtil.source}`);

userCustom.preinit();

const runtimeState = {
  unsavedChanges: false
};

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: `${serveRootDir}/assets/apple-icon.png`,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      // devTools: testEnv ? true : false,
      preload: `${srcDir}/electron-ipc-preload.js`
    }
  });

  if (!testEnv) {
    // tslint:disable-next-line: no-console
    console.log('starting ganymede app (prod) wrapped in electron...');
    win.loadURL(`file://${serveRootDir}/index.html`);
    // win.webContents.openDevTools()
  } else {
    // tslint:disable-next-line: no-console
    console.log('loading test angular on port 4200...');
    win.loadURL('http://localhost:4200');
  }

  // tslint:disable-next-line: deprecation
  win.webContents.on('new-window', (e, url) => {
    e.preventDefault();
    shell.openExternal(url);
  });

  ipcMain.on('toMain', (e, args) => {
    if (args.action) {
      switch (args.action) {
        case 'announce': win.webContents.send('fromMain', { action: 'announce-ack' }); return;
        case 'terminate': app.quit(); return;
        case 'mark-saved': runtimeState.unsavedChanges = false; if (args.andExit) { app.exit(); } return;
        case 'mark-unsaved': runtimeState.unsavedChanges = true; return;
      }
    }
  });

  win.on('close', (e) => {
    if (runtimeState.unsavedChanges) {
      e.preventDefault();
      win.webContents.send('fromMain', { action: 'on-close-unsaved-changes' });
    } else {
      app.exit();
    }
  });
}

app.on('ready', () => {
  protocol.interceptFileProtocol('file', (request, callback) => {
    const url = request.url.substr(7);
    if (url.startsWith('/assets/')) {
      const newPath = `${serveRootDir}${url}`;
      return callback(newPath);
    } else if (url.startsWith('/api/')) {
      return callback(url);
    } else {
      if (!url.endsWith('index.html')) {
        const newPath = `${serveRootDir}${url}`;
        return callback(newPath);
      } else {
        return callback(url);
      }
    }
  });
  createWindow();
});

app.on('window-all-closed', () => {
  app.quit();
});

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow()
//   }
// });
