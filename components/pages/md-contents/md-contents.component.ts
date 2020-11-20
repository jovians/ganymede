import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { consumeSubDir, RouteData, RouteDataNavigatableContent, RouteDataPage } from '../../util/route.helper';
import { MarkdownFrameComponent } from '../../markdown/markdown-frame/markdown-frame.component';
import { AppService } from '../../services/app.service';
import { RouteObservingService } from '../../services/route-observing.service';

@Component({
  selector: 'app-md-contents',
  templateUrl: './md-contents.component.html',
  styleUrls: ['./md-contents.component.scss']
})
export class MdContentsComponent implements OnInit {

  static asRoute(subdir: string, routeData: RouteData, otherParams?: any) {
    const routeDef =  {
      matcher: consumeSubDir(subdir),
      component: MdContentsComponent,
      data: routeData
    };
    if (otherParams) { Object.assign(routeDef, otherParams); }
    if (routeData.pageData) { routeData.pageData.path = subdir; }
    if (routeData.pageData.children) {
      const basepath = routeData.pageData.mountpath ?
                        routeData.pageData.mountpath + '/' + routeData.pageData.path
                      : routeData.pageData.path;
      for (const childRoute of routeData.pageData.children) {
        childRoute.link = basepath + '/' + childRoute.path;
        if (childRoute.children) {
          for (const childRoute2 of childRoute.children) {
            childRoute2.link = basepath + '/' + childRoute.path + '/' + childRoute2.path;
          }
        }
      }
    }
    return routeDef;
  }

  @ViewChild('markdownFrame') markdownFrame: MarkdownFrameComponent;

  markdownNotFound = true;
  markdownPathIsRoot = false;
  markdownPath = '';
  markdownName = '';
  markdownLink = '';
  contentData: RouteDataPage | RouteDataNavigatableContent;


  constructor(
    private app: AppService,
    private route: ActivatedRoute,
    private router: Router,
    private routeObservingService: RouteObservingService,
  ) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.route.data.subscribe(data => {
          this.contentData = this.getTargetFile(data as RouteData);
          if (this.contentData) {
            this.markdownName = this.contentData.name;
            this.markdownLink = this.contentData.link;
            this.loadMarkdown();
          }
        });
      }
    });
  }

  getTargetFile(data: RouteData): RouteDataPage | RouteDataNavigatableContent {
    const paths = [];
    let contentNode = data.pageData;
    if (!contentNode) { return null; }
    this.markdownPathIsRoot = false;
    if (contentNode.path !== this.route.snapshot.url[0].path) {
      return null;
    }
    if (this.route.snapshot.url.length === 1) {
      this.markdownPathIsRoot = true;
      this.markdownPath = this.app.defaultMarkdownAssetPath + '/' + contentNode.path;
      return contentNode;
    }
    paths.push(contentNode.path);
    for (const seg of this.route.snapshot.url.slice(1)) {
      const matched = contentNode.children.filter(item => item.path === seg.path)[0];
      if (!matched) { return null; }
      contentNode = matched;
      paths.push(contentNode.path);
    }
    // this.markdownValid = true;
    this.markdownPath = this.app.defaultMarkdownAssetPath + '/' + paths.slice(0, -1).join('/');
    // this.markdownFrame.load(this.app.defaultMarkdownAssetPath + '/' + paths.join('/') + '.' + this.app.lang + '.md');
    return contentNode;
  }

  async loadMarkdown() {
    if (this.markdownPath && this.markdownFrame) {
      for (const lang of this.app.langList) {
        try {
          let loaded = false;
          if (this.markdownPathIsRoot) {
            loaded = await this.markdownFrame.load(this.markdownPath + '/_root.' + lang + '.md');
          } else {
            loaded = await this.markdownFrame.load(this.markdownPath + '/' + this.contentData.path + '.' + lang + '.md');
          }
          this.markdownNotFound = false;
          return;
        } catch (e) { }
      }
    }
    this.markdownNotFound = true;
    if (this.markdownFrame) { this.markdownFrame.unload(); }
    // for (const lang of this.app.langList) {
    //   try {
    //     console.log(this.app.defaultMarkdownAssetPath + '/404.' + this.app.lang + '.md');
    //     this.markdownFrame.load(this.app.defaultMarkdownAssetPath + '/404.' + this.app.lang + '.md');
    //     return;
    //   } catch (e) { }
    // }
    // this.markdownFrame.load(this.app.defaultMarkdownAssetPath + '/404.md');
  }

  async ngAfterViewInit() {
    this.loadMarkdown();
    // let path = this.router.url.substr(1) + `.md`;
    // path = 'app./test.md';
    // // this.markdownFrame.renderOnError = false;

    // try {
    //   await this.markdownFrame.load(path);
    // } catch (e) {
    //   console.log(e);
    //   // this.router.navigate(['404']);
    // }
  }

  ngOnInit(): void {
  }

}
