/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { XtermConnectionOptions, XtermTerminalController, XtermTerminalSessionsRegistry, XtermTerminalWrapper } from './xterm.models';

@Injectable({
  providedIn: 'root'
})
export class XtermService {

  sessions: XtermTerminalSessionsRegistry = {};

  constructor() {}

  register(wrapper: XtermTerminalWrapper, options: XtermConnectionOptions) {
    let session = this.sessions[wrapper.sessionId];
    if (session) {
      session.mirrorWrappers.push(wrapper);
    } else {
      const controller = new XtermTerminalController(wrapper, options);
      session = this.sessions[wrapper.sessionId] = { wrapper, controller, mirrorWrappers: [] };
      wrapper.registry = this.sessions;
    }
    return session.controller;
  }
}
