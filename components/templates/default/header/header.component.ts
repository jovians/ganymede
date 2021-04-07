/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouteObservingService } from '../../../services/route-observing.service';
import { AuthService } from '../../../services/auth.service';
import { AppService } from '../../../services/app.service';
import { EnvService } from '../../../services/env.service';
import { Components } from '../../../../../ui.components';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy, AfterViewInit {
  static registration = Components.register(HeaderComponent, () => require('./header.component.json'));

  @Input() menuList;
  private selectedRef = null;
  private routeSubscription: Subscription;

  constructor(
    public app: AppService,
    public env: EnvService,
    public auth: AuthService,
    private routeObserver: RouteObservingService,
  ) {
    this.menuList = app.template.header.nav;
  }

  handleUrlChange(url: string) {
    if (!url) { return; }
    const majorPath = url.split('/')[1];
    const detected = this.menuList.filter(item => item.path.split('/')[0] === majorPath)[0];
    if (this.selectedRef) {
      const el = document.getElementById('topmenu-item-' + this.selectedRef.path);
      el.classList.remove('active');
      this.selectedRef.active = false;
    }
    if (!detected) { return; }
    const target = document.getElementById('topmenu-item-' + detected.path);
    target.classList.add('active');
    this.selectedRef = detected;
    this.selectedRef.active = true;
  }

  ngAfterViewInit() {
    this.handleUrlChange(this.routeObserver.currentUrl);
    this.routeSubscription = this.routeObserver.eventRouteChange.subscribe(url => {
      this.handleUrlChange(url);
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }

  async runCommand(commandObject: any) {
    if (!commandObject || !commandObject.command) { return; }
    return this.app.run(commandObject);
  }
}
