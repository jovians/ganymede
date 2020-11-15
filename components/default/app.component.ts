import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { Router, ActivationStart, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
// import { HeaderComponent } from './modules/header/header.component';
// import { RouteObservingService } from './shared/services/route-observing.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  // @ViewChild('headerComponent') headerComponent: HeaderComponent;
  @ViewChild('mainContentArea') mainContentArea: ElementRef;

  public headerVisible: boolean;
  public footerVisible: boolean;
  public leftSidebarVisible: boolean;
  public rightSidebarVisible: boolean;
  public leftSidebarVisibleSaved: boolean;
  public rightSidebarVisibleSaved: boolean;

  private routerSubscription: Subscription;

  constructor(
    private router: Router,
    // private routeObservingService: RouteObservingService,
    ) {
    window.onresize = (e) => {
      if (window.innerWidth <= 768) {
        this.rightSidebarVisible = this.leftSidebarVisible = true;
      } else {
        this.leftSidebarVisible = this.leftSidebarVisibleSaved;
        this.rightSidebarVisible = this.rightSidebarVisibleSaved;
      }
    };
    this.routerSubscription = this.router.events.subscribe((e) => {
      if (e instanceof NavigationEnd) {
        // this.routeObservingService.setUrlSegment(e.url);
        window.dispatchEvent(new Event('resize'));
      } else if (e instanceof ActivationStart) {
        let data = e.snapshot.data;
        if (!data) { data = {}; }

        let layout = data.layout;
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

        let footer = data.footer;
        if (footer === undefined || footer === 'default') { footer = 'yes'; }
        switch (footer) {
          case 'yes': this.footerVisible = true; break;
          case 'no': this.footerVisible = false; break;
        }

        if (data.scrollbar === 'hide') {
          this.mainContentArea.nativeElement.classList.add('no-scrollbar');
        } else {
          this.mainContentArea.nativeElement.classList.remove('no-scrollbar');
        }

        this.leftSidebarVisibleSaved = this.leftSidebarVisible;
        this.rightSidebarVisibleSaved = this.rightSidebarVisible;
      }
    });

  }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.routerSubscription) { this.routerSubscription.unsubscribe(); }
  }

}
