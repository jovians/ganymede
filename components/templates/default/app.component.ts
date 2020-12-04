import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivationStart, NavigationEnd, ActivatedRoute } from '@angular/router';
import { AppService } from '../../services/app.service';
import { Subscription } from 'rxjs';
import { RouteObservingService } from '../../services/route-observing.service';
import { LeftSidebarComponent } from './left-sidebar/left-sidebar.component';
// import { HeaderComponent } from './modules/header/header.component';
// import { RouteObservingService } from './shared/services/route-observing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  // @ViewChild('headerComponent') headerComponent: HeaderComponent;
  @ViewChild('leftSideBarComponent') leftSideBarComponent: LeftSidebarComponent;
  @ViewChild('mainContentArea') mainContentArea: ElementRef;

  headerVisible: boolean;
  footerVisible: boolean;
  leftSidebarVisible: boolean;
  rightSidebarVisible: boolean;
  leftSidebarVisibleSaved: boolean;
  rightSidebarVisibleSaved: boolean;

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

    this.app.routeData.next(data);
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.routerSubscription) { this.routerSubscription.unsubscribe(); }
  }

}
