/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
declare var window: any;

export class ElectronInteractions {
  constructor() {
    window.api.receive("fromMain", data => {
      if (data && data.action) {
        switch (data.action) {
          case 'announce-ack': console.log('Electron IPC checked.'); return;
          case 'on-close-unsaved-changes':
            const result = window.confirm('You have unsaved changes on this app. Terminate the application without saving?');
            if (result) {
              window.api.send("toMain", { action: 'mark-saved', andExit: true });
            }
          return;
        }
      }
    });
    window.api.send("toMain", { action: 'announce' });
  }

  terminateApp() {
    window.api.send("toMain", { action: 'terminate' });
  }

  closeWindow() {
    window.close();
  }

  markUnsaved() {
    window.api.send("toMain", { action: 'mark-unsaved' });
  }

  markSaved() {
    window.api.send("toMain", { action: 'mark-saved' });
  }
}
