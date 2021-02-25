/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { Router, ActivationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppService } from '../../services/app.service';
import { Subscription } from 'rxjs';
import { RouteObservingService } from '../../services/route-observing.service';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { ResourceGuard } from '../../services/resource-guard';
import { preResolvePath } from '../../util/route.pre-resolver';
import { Components } from '../../../../ui.components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  static registration = Components.register(AppComponent, () => require('./app.component.json'));

  // @ViewChild('headerComponent') headerComponent: HeaderComponent;
  @ViewChild('containerComponent') containerComponent: ElementRef;
  @ViewChild('leftSideBarComponent') leftSideBarComponent: LeftSidebarComponent;
  @ViewChild('mainContentArea') mainContentArea: ElementRef;

  headerVisible: boolean;
  footerVisible: boolean;
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  leftSidebarVisibleSaved: boolean;
  rightSidebarVisibleSaved: boolean;
  resGuard = ResourceGuard;

  leftSidebarNavItems = [];
  activatedRouteDataSubscribed = false;
  private routerSubscription: Subscription;

  constructor(
    private app: AppService,
    private router: Router,
    private route: ActivatedRoute,
    private routeObservingService: RouteObservingService,
    ) {
    window.onresize = (e) => {
      if (window.innerWidth <= 768) {
        this.rightSidebarVisible = this.leftSidebarVisible = true;
      } else {
        this.leftSidebarVisible = this.leftSidebarVisibleSaved;
        this.rightSidebarVisible = this.rightSidebarVisibleSaved;
      }
    };
    preResolvePath().then(ngRoute => {
      if (ngRoute && ngRoute.data) { this.handleRouteData(ngRoute.data); }
    });
    this.routerSubscription = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.routeObservingService.setUrlSegment(e.url);
        if (!this.activatedRouteDataSubscribed) {
          this.route.firstChild.data.subscribe(data => {
            this.handleRouteData(data);
          });
          this.activatedRouteDataSubscribed = true;
        }
        window.dispatchEvent(new Event('resize'));
      } else if (e instanceof ActivationStart) {
        this.handleRouteData(e.snapshot.data);
        this.leftSidebarVisibleSaved = this.leftSidebarVisible;
        this.rightSidebarVisibleSaved = this.rightSidebarVisible;
      }
    });

  }

  ngAfterViewInit(): void {
    this.showApp();
  }

  showApp() {
    this.containerComponent.nativeElement.style.opacity = 1;
  }

  hideApp() {
    this.containerComponent.nativeElement.style.opacity = 0;
  }

  async handleRouteData(data) {
    if (data.templateData) {
      let layout = data.templateData.layout;
      if (layout === undefined || layout === 'default') { layout = 'one-sidebar'; }
      switch (layout) {
        case 'full':
          this.headerVisible = true; this.leftSidebarVisible = true; this.rightSidebarVisible = true;
          break;
        case 'one-sidebar':
          this.headerVisible = true; this.leftSidebarVisible = true; this.rightSidebarVisible = false;
          break;
        case 'header-only':
          this.headerVisible = true; this.leftSidebarVisible = false; this.rightSidebarVisible = false;
          break;
        case 'nothing':
          this.headerVisible = false; this.leftSidebarVisible = false; this.rightSidebarVisible = false;
          break;
      }
      let footer = data.templateData.footer;
      if (footer === undefined || footer === 'default') { footer = 'yes'; }
      switch (footer) {
        case 'yes': this.footerVisible = true; break;
        case 'no': this.footerVisible = false; break;
      }

      if (data.templateData.scrollbar === 'hide') {
        this.mainContentArea.nativeElement.classList.add('no-scrollbar');
      } else {
        this.mainContentArea.nativeElement.classList.remove('no-scrollbar');
      }
    }

    if (data.pageData) {
      this.leftSidebarNavItems = [];
      if (data.pageData.type === 'basic-contents') {
        this.leftSidebarNavItems = data.pageData.children;
      }
    }

    setTimeout(() => {
      if (!this.resGuard.routeValid || !this.resGuard.authorized) {
        this.footerVisible = false;
        this.leftSidebarVisible = false;
        this.rightSidebarVisible = false;
        if (this.leftSideBarComponent) {
          this.leftSideBarComponent.navItems = [];
        }
      }
    }, 0);

    this.app.routeData.next(data);
  }

  ngOnInit() {}

  ngOnDestroy() {
    if (this.routerSubscription) { this.routerSubscription.unsubscribe(); }
  }

}
