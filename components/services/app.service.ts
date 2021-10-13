/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ElementRef, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Store } from '@ngrx/store';
import { Actions } from '@ngrx/effects';

import { EnvService } from '../services/env.service';
import { rx } from '../util/common/ngrx.stores';
import { debugController } from '../util/shared/debug.controller';

import { GanymedeAppData } from '../ganymede.app.interface';
import { globallyExtendTranslateParam } from '../util/common/translate.params';
import { GeolocateUtils } from '../util/common/geolocation.utils';
import { CommandsRegistrar } from '../util/common/commands.registrar';
import { RouteObservingService } from './route-observing.service';
import { ServiceWorkerUtil } from '../util/common/service.worker.utils';
import { DisplayMode } from '../util/common/size.util';
import { Subject } from 'rxjs';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class AppService extends GanymedeAppData {
  static config = window.ganymedeAppData;

  httpForbidden: boolean = false;
  httpNotFound: boolean = false;
  displayMode: DisplayMode = DisplayMode.NORMAL;
  store: any;
  config: GanymedeAppData;

  routeData = new Subject<any>();

  debug = debugController;

  private mainContentArea: ElementRef = null;

  constructor(
    public env: EnvService,
    public http: HttpClient,
    public storeBase: Store<rx.AnyStore>,
    private translateService: TranslateService,
    private router: Router,
    private routeObserver: RouteObservingService,
    private actions$: Actions,
  ) {
    super();
    this.config = window.ganymedeAppData;
    Object.assign(this, window.ganymedeAppData);

    // tslint:disable-next-line: no-string-literal
    window['ngxTranslateService'] = this.translateService;
    // tslint:disable-next-line: no-string-literal
    window['ngRouter'] = this.router;
    this.routeObserver.setRouter(this.router);

    this.store = rx.NgrxStoreRoot.initialize(this.storeBase, this.actions$, {
      http: this.http
    });

    globallyExtendTranslateParam();

    if (this.features.geolocate && this.features.geolocate.enabled) {
      GeolocateUtils.initialize().then(data => {

      });
    }

    if (this.features.serviceWorker && this.features.serviceWorker.enabled) {
      ServiceWorkerUtil.initialize();
    }
  }

  async run(cmd: { namespace: string, command: string, params?: any }) {
    const cmdObject = { namespace: '', command: '', params: null };
    if (cmd.namespace && (cmd.namespace as any).call) {
      cmdObject.namespace = await Promise.resolve((cmd.namespace as any)());
    } else { cmdObject.namespace = cmd.namespace; }
    if (cmd.command && (cmd.command as any).call) {
      cmdObject.command = await Promise.resolve((cmd.command as any)());
    } else { cmdObject.command = cmd.command; }
    cmdObject.params = cmd.params ? JSON.parse(JSON.stringify(cmd.params)) : cmd.params;
    if (this.debug.outputCommands) {
      // tslint:disable-next-line: no-console
      console.info(`App command requested: ${cmdObject.namespace}::${cmdObject.command}, params =>`, cmdObject.params);
    }
    const output = CommandsRegistrar.run(cmd.namespace, cmd.command, cmd.params);
    return await Promise.resolve(output);
  }

  setMainContentArea(mainContentArea: ElementRef) {
    this.mainContentArea = mainContentArea;
  }

  setMainContentAreaScroll(scrollTop: number = 0, scrollLeft: number = null) {
    if (this.mainContentArea) {
      this.mainContentArea.nativeElement.scrollTop = scrollTop;
      if (scrollLeft !== null) {
        this.mainContentArea.nativeElement.scrollLeft = scrollLeft;
      }
    }
  }

}

export function extRegisterRx(extKey: string) {

}

export function extGetData(extKey: string) {

}

export { rx };
