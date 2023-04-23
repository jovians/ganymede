/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ix } from 'ts-comply';
import { SizeUtil } from '../../util/common/size.util';
import { completeConfigDirectly } from '../../util/shared/common';

const xterm = require('xterm');
const xtermAddonFit = require('xterm-addon-fit');

export interface XtermTerminalSessionsRegistry {
  [sessionId: string]: {
    controller: XtermTerminalController;
    wrapper: XtermTerminalWrapper;
    mirrorWrappers: XtermTerminalWrapper[];
  };
}

export interface XtermTerminalWrapperOptions {
  srcComponent: ix.Entity;
  sessionId: string;
  domId: string;
  cols?: number;
  rows?: number;
  domDetectTimeout?: number;
  enableAddonFit?: boolean;
}

export class XtermTerminalWrapper extends ix.Entity {
  registry: XtermTerminalSessionsRegistry;
  controller: XtermTerminalController;
  sessionId: string;
  srcComponent: ix.Entity;
  domId: string;
  cont: any;
  terminalDom: any;
  cols: number = 80;
  rows: number = 24;
  terminal: any;
  addons = {
    fit: { instance: null, enabled: false, initialized: false },
  };
  ready: boolean;
  constructor(init: XtermTerminalWrapperOptions) {
    super('xterm-terminal-wrapper');
    if (init) { Object.assign(this, init); }
    this.terminal = new xterm.Terminal();
    this.cols = init.cols ? init.cols : 80;
    this.rows = init.rows ? init.rows : 24;
    this.terminal.resize(80, 24);
    this.terminal.onResize(e => {
      this.cols = e.cols ? e.cols : this.cols;
      this.rows = e.rows ? e.rows : this.rows;
      this.ixRx<{ cols: number, rows: number }>('resize').next({ cols: this.cols, rows: this.rows });
    });
    this.terminal.onKey(e => {
      this.ixRx<{ key: string }>('key').next(e);
    });
    this.terminal.onData(data => {
      if (data.charCodeAt(0) !== 27 && data.length > 2) {
        this.ixRx<string>('data').next(data);
      }
    });
    if (!init.domDetectTimeout) { init.domDetectTimeout = 5000; }
    this.detectContainerElement(init.domId, init.domDetectTimeout);
    if (init.enableAddonFit) { this.enableFit(); }
  }
  get ready$() { return this.ixRx<void>('ready').obs(); }
  get failure$() { return this.ixRx<void>('failure').obs(); }
  get key$() { return this.ixRx<{ key: string }>('key').obs(); }
  get data$() { return this.ixRx<string>('data').obs(); }
  get resize$() { return this.ixRx<{ cols: number, rows: number }>('resize').obs(); }
  get reattach$() { return this.ixRx<any>('reattach').obs(); }
  reattach(srcComponent: ix.Entity, domId: string, timeout = 5000, checkingInterval = 100) {
    let cont;
    const startTime = Date.now();
    const checkerId = setInterval(() => {
      cont = document.getElementById(domId);
      if (cont) {
        clearInterval(checkerId);
        this.onReattach(srcComponent, cont);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkerId);
        this.onTimeout(domId, timeout);
      }
    }, checkingInterval);
  }
  detectContainerElement(domId: string, timeout = 5000, checkingInterval = 100) {
    let cont;
    const startTime = Date.now();
    const checkerId = setInterval(() => {
      cont = document.getElementById(domId);
      if (cont) {
        clearInterval(checkerId);
        this.onReady(cont);
      } else if (Date.now() - startTime > timeout) {
        clearInterval(checkerId);
        this.onTimeout(domId, timeout);
      }
    }, checkingInterval);
  }
  onReattach(srcComponent: ix.Entity, cont) {
    this.srcComponent = srcComponent;
    this.cont = cont;
    this.initializeIntoContainer(cont);
    this.ixRx('reattach').next(cont);
    if (this.addons?.fit?.initialized) {
      SizeUtil.linkDimension(this.srcComponent, this.cont, _ => {
        try {
          this.addons.fit.instance.fit();
        } catch (e) { console.warn(e); }
      });
    }
  }
  onReady(cont) {
    this.cont = cont;
    this.initializeIntoContainer(cont);
    this.ready = true;
    this.ixRx('ready').next(null);
  }
  onTimeout(domId: string, timeout: number) {
    this.ixError(`Terminal wrapper element by id '${domId}' could not be found within ${timeout} ms.`);
    this.ixRx('failure').next(null);
  }
  initializeIntoContainer(cont) {
    this.terminal.open(cont);
    this.terminalDom = cont.firstChild;
    this.addons?.fit?.instance?.fit();
  }
  enableFit() {
    if (this.addons.fit.enabled) { return; }
    this.addons.fit.enabled = true;
    this.addons.fit.instance = new xtermAddonFit.FitAddon();
    this.terminal.loadAddon(this.addons.fit.instance);
    this.ready$.subscribe(() => {
      if (this.addons.fit.initialized) { return; }
      this.addons.fit.initialized = true;
      SizeUtil.linkDimension(this.srcComponent, this.cont, _ => {
        try {
          this.addons.fit.instance.fit();
        } catch (e) { console.warn(e); }
      });
    });
  }
}

export class XtermConnectionOptions {
  static default = new XtermConnectionOptions({

  }, false);
  url: string = '';
  token?: string = '';
  extraTls?: boolean = true;
  constructor(init?: Partial<XtermConnectionOptions>, completeFromDefault = true) {
    if (init) { Object.assign(this, init); }
    if (completeFromDefault) { completeConfigDirectly(this, XtermConnectionOptions.default); }
  }
}

export class XtermTerminalController extends ix.Entity {
  sessionId: string;
  options: XtermConnectionOptions;
  wsClient: WebSocket;
  wrapper: XtermTerminalWrapper;
  ctrlSequence: string;
  constructor(terminalWrapper: XtermTerminalWrapper, options: Partial<XtermConnectionOptions>) {
    super('xterm-terminal-controller');
    this.sessionId = terminalWrapper.sessionId;
    this.ctrlSequence = String.fromCharCode(16, 16) + this.sessionId;
    this.wrapper = terminalWrapper;
    this.wrapper.controller = this;
    this.options = new XtermConnectionOptions(options);
    this.connect();
  }
  getReqeustPayload() {
    return Buffer.from(JSON.stringify({
      sessionId: this.sessionId,
    }), 'utf8').toString('base64');
  }
  connect() {
    if (this.wrapper.ready) {
      this.makeConnection();
    } else {
      this.ixListen(this.wrapper.ready$, () => {
        this.makeConnection();
      });
    }
  }
  sendResize(cols: number, rows: number) {
    this.wsClient.send(this.ctrlSequence + 'resize\njson\n' + JSON.stringify({ cols, rows }));
  }
  makeConnection() {
    this.wsClient = new WebSocket(`${this.options.url}/__xterm_wss__/?a=${this.getReqeustPayload()}`);
    this.wsClient.onopen = () => {
      this.sendResize(this.wrapper.cols, this.wrapper.rows);
      this.wsClient.onmessage = e => {
        this.wrapper.terminal.write(e.data);
      };
      this.ixListen(this.wrapper.key$, e => {
        this.wsClient.send(e.key);
      });
      this.ixListen(this.wrapper.data$, data => {
        this.wsClient.send(data);
      });
      this.ixListen(this.wrapper.resize$, e => {
        this.sendResize(e.cols, e.rows);
      });
    };
  }
}
