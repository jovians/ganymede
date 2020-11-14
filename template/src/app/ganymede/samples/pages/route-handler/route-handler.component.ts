import { Component, AfterViewInit, ViewChild} from '@angular/core';
import { MarkdownFrameComponent } from '../../../markdown-frame/markdown-frame.component';
import { Router } from '@angular/router';


@Component({
  selector: 'app-route-handler',
  templateUrl: './route-handler.component.html',
  styleUrls: ['./route-handler.component.scss']
})
export class RouteHandlerComponent implements AfterViewInit {

  @ViewChild('markdownFrame') markdownFrame: MarkdownFrameComponent;

  constructor(
    private router: Router,
  ) { }

  async ngAfterViewInit() {
    const path = this.router.url.substr(1) + '.md';
    this.markdownFrame.renderOnError = false;

    try {
      await this.markdownFrame.load(path);
    } catch (e) {
      this.router.navigate(['404']);
    }

  }
}
