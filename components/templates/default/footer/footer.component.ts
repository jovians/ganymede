/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { EnvService } from '../../../services/env.service';
import { AppService } from '../../../services/app.service';
import { Components } from '../../../../../ui.components';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent implements OnInit {
  static registration = Components.register(FooterComponent, () => require('./footer.component.json'));

  constructor(
    public app: AppService,
    public env: EnvService
  ) { }

  ngOnInit() {
    
  }

}
