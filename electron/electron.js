const baseDir = __dirname;
const conf = require(`${baseDir}/ganymede.conf.json`);
const profile = process.argv[2];
const testEnv = profile === 'test';
const serveRootDir = `${baseDir}/dist/${conf.productName}`;

const { app, BrowserWindow, protocol, shell, ipcMain } = require('electron');

const runtimeState = {
  unsavedChanges: false
};

function createWindow () {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    icon: `${serveRootDir}/assets/apple-icon.png`,
    frame: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: true,
      enableRemoteModule: false,
      // devTools: testEnv ? true : false,
      preload: `${baseDir}/ipc-preload.js`
    }
  })

  if (!testEnv) {
    console.log('starting ganymede app (prod) wrapped in electron...');
    win.loadURL(`file://${serveRootDir}/index.html`);
    // win.webContents.openDevTools()
  } else {
    console.log('loading test angular on port 4200...');
    win.loadURL('http://localhost:4200');
  }

  win.webContents.on('new-window', function(e, url) {
    e.preventDefault();
    shell.openExternal(url);
  });

  ipcMain.on("toMain", (e, args) => {
    if (args.action) {
      switch (args.action) {
        case 'announce': win.webContents.send("fromMain", { action:'announce-ack' }); return;
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
})

app.on('window-all-closed', () => {
  app.quit();
});

// app.on('activate', () => {
//   if (BrowserWindow.getAllWindows().length === 0) {
//     createWindow()
//   }
// });
