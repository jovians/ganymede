/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit } from '@angular/core';
import { Components } from '../../../../../../../ui.components';
import { AppService } from '../../../../../../components/services/app.service';
import { asRouteBasic, RouteData } from '../../../../../../components/util/route.helper';

@Component({
  selector: 'app-ext-native-infra-page',
  templateUrl: './ext-native-infra-page.component.html',
  styleUrls: ['./ext-native-infra-page.component.scss']
})
export class ExtNativeInfraPageComponent implements OnInit {
  static registration = Components.register(ExtNativeInfraPageComponent, () => require('./ext-native-infra-page.component.json'));

  public static asRoute(subdir: string, routeData: RouteData, otherParams?: any) {
    const routeDef = asRouteBasic(subdir, routeData, otherParams);
    routeDef.main.component = ExtNativeInfraPageComponent;
    return [routeDef.main, ...routeDef.others];
  }
  constructor(public app: AppService) { }

  ngOnInit(): void {
  }

}
