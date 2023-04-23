/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppService, autoUnsub } from '../../services/app.service';
import { Subscription } from 'rxjs';
import { RouteObservingService } from '../../services/route-observing.service';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
import { ResourceGuard } from '../../services/resource-guard';
import { preResolvePath } from '../../util/common/route.pre-resolver';
import { Components } from '../../../../ui.components';
import { DisplayMode, SizeUtil } from '../../util/common/size.util';
import { currentRoute, TreeViewAsyncData } from '../../util/common/route.model';
import { log } from '../../util/shared/logger';
import { bindSub } from '../../util/shared/common';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit {
  static registration = Components.register(AppComponent, () => require('./app.component.json'));

  // @ViewChild('headerComponent') headerComponent: HeaderComponent;
  @ViewChild('mainContainer') mainContainer: ElementRef;
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
  leftSidebarTreeViewData: TreeViewAsyncData = null;
  activatedRouteDataSubscribed = false;
  private routerSubscription: Subscription;

  constructor(
    private app: AppService,
    private route: ActivatedRoute,
    private routeObserver: RouteObservingService,
    ) {
    SizeUtil.addOnWindowResize(e => {
      if (window.innerWidth <= 768) {
        this.app.displayMode = DisplayMode.NARROW;
        this.rightSidebarVisible = this.leftSidebarVisible = true;
      } else {
        this.app.displayMode = DisplayMode.NORMAL;
        this.leftSidebarVisible = this.leftSidebarVisibleSaved;
        this.rightSidebarVisible = this.rightSidebarVisibleSaved;
      }
    });
    preResolvePath().then(ngRoute => {
      if (ngRoute && ngRoute.data) { this.handleRouteData(ngRoute.data); }
    });
    this.routeObserver.setRoute(this.route);
    this.routeObserver.eventRouteChange.subscribe(url => {
      if (!this.activatedRouteDataSubscribed && this.route.firstChild) {
        this.route.firstChild.data.subscribe(data => {
          this.handleRouteData(data);
        });
        this.activatedRouteDataSubscribed = true;
      }
    });
    this.routeObserver.eventActivationStart.subscribe(e => {
      this.handleRouteData(e.snapshot.data);
      this.leftSidebarVisibleSaved = this.leftSidebarVisible;
      this.rightSidebarVisibleSaved = this.rightSidebarVisible;
    });
    currentRoute.activatedRoute = route;
    bindSub(this, this.route.params, params => { currentRoute.uriData.params = params; });
    bindSub(this, this.route.queryParams, queryParams => { currentRoute.uriData.queryParams = queryParams; });
    bindSub(this, this.route.fragment, fragment => { currentRoute.uriData.fragment = fragment; });
    bindSub(this, this.route.data, data => { currentRoute.uriData.data = data; });
  }

  ngAfterViewInit(): void {
    this.app.setMainContentArea(this.mainContentArea);
    this.routeObserver.scrollSaveTarget = this.mainContentArea;
    this.showApp();
    setTimeout(() => { window.dispatchEvent(new Event('resize')); }, 30);
    const checker = setInterval(() => { window.dispatchEvent(new Event('resize')); }, 66);
    setTimeout(() => { clearInterval(checker); }, 300);
  }

  showApp() {
    this.containerComponent.nativeElement.style.opacity = 1;
  }

  hideApp() {
    this.containerComponent.nativeElement.style.opacity = 0;
  }

  async handleRouteData(data) {
    let layout = data.templateData?.layout;
    if (currentRoute.routeChildData && currentRoute.routeChildData.layout) {
      layout = currentRoute.routeChildData.layout;
    }
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
      default:
        log.info(`Unrecognized route layout spec: '${layout}'`);
        break;
    }
    let footer = data.templateData?.footer;
    if (footer === undefined || footer === 'default') { footer = 'no'; } // no footer by default
    switch (footer) {
      case 'yes': this.footerVisible = true; break;
      case 'no': this.footerVisible = false; break;
    }

    if (data.templateData && data.templateData.scrollbar === 'hide') {
      this.mainContentArea.nativeElement.classList.add('no-scrollbar');
    } else {
      this.mainContentArea.nativeElement.classList.remove('no-scrollbar');
    }

    if (data.pageData) {
      this.leftSidebarNavItems = [];
      this.leftSidebarTreeViewData = null;
      if (data.pageData.type === 'basic' || data.pageData.type === 'basic-contents') {
        if (data.pageData.treeView) {
          this.leftSidebarTreeViewData = data.pageData.treeView;
        } else {
          this.leftSidebarNavItems = data.pageData.children;
        }
      }
    } else {
      this.leftSidebarNavItems = [];
      this.leftSidebarVisible = false;
      this.rightSidebarVisible = false;
    }

    if (this.app.header) {
      if (this.app.header.alwaysOn) {
        this.headerVisible = true;
      }
    }

    if (this.app.footer) {
      if (this.app.footer.alwaysOn) {
        this.footerVisible = true;
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
    autoUnsub(this);
    if (this.routerSubscription) { this.routerSubscription.unsubscribe(); }
  }

}
