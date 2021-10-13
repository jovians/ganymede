/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Components } from '../../../../../ui.components';
import { AppService } from '../../../services/app.service';
import { RouteObservingService } from '../../../services/route-observing.service';

@Component({
  selector: 'app-left-sidebar',
  templateUrl: './left-sidebar.component.html',
  styleUrls: ['./left-sidebar.component.scss'],
})
export class LeftSidebarComponent implements OnInit, AfterViewInit, OnDestroy {
  static registration = Components.register(LeftSidebarComponent, () => require('./left-sidebar.component.json'));

  @Input() navItems = [];
  @Input() menuList;
  idemGuard = Date.now();
  private routeSubscription: Subscription;
  private selectedRef = null;

  constructor(
    public app: AppService,
    public router: Router,
    private routeObserver: RouteObservingService,
  ) {
    this.menuList = app.template.header.nav;
  }

  ngOnInit() { }

  ngAfterViewInit() {
    this.handleUrlChange(this.routeObserver.currentUrl);
    this.routeSubscription = this.routeObserver.eventRouteChange.subscribe(url => {
      this.handleUrlChange(url);
    });
  }

  handleUrlChange(url: string) {
    if (!url) { return; }
    const majorPath = url.split('/')[1];
    const detected = this.menuList.filter(item => item.path.split('/')[0] === majorPath)[0];
    if (this.selectedRef) {
      const el = document.getElementById('main-menu-item-' + this.selectedRef.path);
      if (!el) {
        el.classList.remove('active');
        this.selectedRef.active = false;
      }
    }
    if (!detected) { return; }
    const target = document.getElementById('main-menu-item-' + detected.path);
    if (target) {
      target.classList.add('active');
      this.selectedRef = detected;
      this.selectedRef.active = true;
    }
  }

  navActiveStatus(itemData) {
    return this.router.url.startsWith('/' + itemData.link);
  }

  endHere(e) { e.stopPropagation(); }

  ngOnDestroy() {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }
}
