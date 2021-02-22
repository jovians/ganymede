/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { GanymedeAppData } from '../ganymede.app.interface';
import { TranslateService } from '@ngx-translate/core';
import { globallyExtendTranslateParam } from '../util/translate.params';
import { GeolocateUtils } from '../util/geolocation.utils';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class AppService extends GanymedeAppData {

  httpForbidden: boolean = false;
  httpNotFound: boolean = false;

  constructor(private translateService: TranslateService) {
    super();
    Object.assign(this, window.ganymedeAppData);

    // tslint:disable-next-line: no-string-literal
    window['ngxTranslateService'] = this.translateService;
    globallyExtendTranslateParam();

    if (this.features.geolocate && this.features.geolocate.enabled) {
      GeolocateUtils.initialize().then(data => {

      });
    }
  }
}
