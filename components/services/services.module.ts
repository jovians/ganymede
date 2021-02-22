/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { NgModule } from '@angular/core';
import { Modules } from '../../../ui.modules';
import { ApiCallerService } from './api-caller.service';
import { AppService } from './app.service';
import { AuthService } from './auth.service';
import { CryptoService } from './crypto.service';
import { EnvService } from './env.service';
import { ResourceGuard } from './resource-guard';
import { RouteObservingService } from './route-observing.service';

@NgModule({
  imports: [],
  declarations: [],
  exports: []
})
export class GenymedeServicesModule {
  static registration = Modules.register(GenymedeServicesModule, () => require('./services.module.json'));
}
