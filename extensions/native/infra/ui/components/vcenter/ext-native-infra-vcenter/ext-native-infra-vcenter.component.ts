/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { autoUnsub } from '@jovian/type-tools';
import { ExtNativeInfraService } from '../../shared/ext-native-infra.service';
import { AppService } from '../../../../../../../components/services/app.service';

@Component({
  selector: 'app-ext-native-infra-vcenter',
  templateUrl: './ext-native-infra-vcenter.component.html',
  styleUrls: ['./ext-native-infra-vcenter.component.scss']
})
export class ExtNativeInfraVcenterComponent implements OnInit, OnDestroy {

  constructor(
    public app: AppService,
    private infraApi: ExtNativeInfraService
  ) {
    const ds = this.infraApi.rx.data;
    setTimeout(() => {
      ds.vcenter.quickStats.actions.FETCH.dispatch({key: 'sddc1'});
    }, 3000);
    // setTimeout(() => {
    //   ds.test.actions.RESET.dispatch({});
    // }, 8000);
  }

  ngOnInit(): void {
  }

  ngOnDestroy() {
    autoUnsub(this);
  }

}
