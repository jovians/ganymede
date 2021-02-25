/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { EnvService } from '../../../services/env.service';
import { AppService } from '../../../services/app.service';
import { Components } from '../../../../../ui.components';
import { ganymedeLicense } from '../../../../ganymede.license';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit, OnDestroy {
  static registration = Components.register(FooterComponent, () => require('./footer.component.json'));

  licenseSubs: Subscription;

  constructor(
    public app: AppService,
    public env: EnvService,
  ) {}

  ngOnInit() {
    this.licenseSubs = ganymedeLicense.subscribe(valid => {
      this.env.licenseValid = valid;
      setTimeout(() => { this.env.licenseValid = this.env.licenseValid; }, 500);
    });
  }

  ngOnDestroy() {
    if (this.licenseSubs) { this.licenseSubs.unsubscribe(); }
  }

}
