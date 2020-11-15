import { Component, OnDestroy, ViewChild, ElementRef, AfterViewInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { RouteObservingService } from '../../../services/route-observing.service';
import { AuthService } from '../../../services/auth.service';
import { AppService } from '../../../services/app.service';

// import { headerNavigation } from '../../../app-routing.module';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnDestroy, AfterViewInit {

  @Input() public menuList;
  private selectedRef = null;
  private routeSubscription: Subscription;

  constructor(
    public app: AppService,
    public auth: AuthService,
    private routeObservingService: RouteObservingService,
  ) {
    // this.menuList = headerNavigation;
  }

  handleUrlChange(url: string) {
    const majorPath = url.split('/')[1];
    const detected = this.menuList.filter(item => item.path === majorPath)[0];
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
    this.handleUrlChange(this.routeObservingService.currentUrl);
    this.routeSubscription = this.routeObservingService.subscribe((url) => {
      this.handleUrlChange(url);
    });
  }

  ngOnDestroy() {
    if (this.routeSubscription) { this.routeSubscription.unsubscribe(); }
  }

}
