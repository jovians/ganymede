/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit, OnDestroy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ix } from '@jovian/type-tools';
import { v4 as uuidv4 } from 'uuid';
import { XtermTerminalWrapper } from '../xterm.models';
import { XtermService } from '../xterm.service';

@Component({
  selector: 'gany-xterm',
  templateUrl: './xterm.component.html',
  styleUrls: ['./xterm.component.scss']
})
export class XtermComponent extends ix.Entity implements OnInit, OnDestroy, OnChanges {
  @Input() sessionId = '__auto_gen__';
  @Input() targetUrl = '';
  domId = `xterm-dom-id-${uuidv4()}`;
  wrapper: XtermTerminalWrapper;
  setIn = false;
  constructor(private xtermService: XtermService) {
    super('xterm-component');
    setTimeout(() => {
      if (this.sessionId === '__auto_gen__') { this.sessionId = uuidv4(); }
      this.initialize();
    }, 100);
  }

  initialize() {
    if (this.setIn || !this.sessionId || !this.targetUrl) { return; }
    this.setIn = true;
    const session = this.xtermService.sessions[this.sessionId];
    if (session) {
      this.wrapper = session.wrapper;
      this.wrapper.reattach(this, this.domId);
    } else {
      this.wrapper = new XtermTerminalWrapper({
        srcComponent: this,
        sessionId: this.sessionId,
        domId: this.domId,
        enableAddonFit: true
      });
      this.xtermService.register(this.wrapper, { url: this.targetUrl });
    }
  }

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges) {
    this.initialize();
  }

  ngOnDestroy() {
    this.destroy();
  }

}
