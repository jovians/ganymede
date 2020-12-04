import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { consumeSubDir, RouteData, RouteDataNavigatableContent, RouteDataPage } from '../../util/route.helper';
import { MarkdownFrameComponent } from '../../markdown/markdown-frame/markdown-frame.component';
import { AppService } from '../../services/app.service';
import { RouteObservingService } from '../../services/route-observing.service';
import { CKEDITOR } from '../../util/ckeditor.utils';
import { HttpClient } from '@angular/common/http';
import { ApiCallerService } from '../../services/api-caller.service';
import { PreInitUtils } from '../../util/preinit.util';
// import { MutationWatcher } from '../../util/mutation.observer';

// declare var Prism: any;

export enum BasicContentType {
  HTML = 'HTML',
  MARKDOWN = 'MD'
}

export interface BasicContentMetadata {
  type: BasicContentType;
  i18n: { [lang: string]: number };
}

@Component({
  selector: 'app-basic-contents',
  templateUrl: './basic-contents.component.html',
  styleUrls: ['./basic-contents.component.scss']
})
export class BasicContentsComponent implements OnInit {

  public static asRoute(subdir: string, routeData: RouteData, otherParams?: any) {
    const routeDef =  {
      matcher: consumeSubDir(subdir),
      component: BasicContentsComponent,
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
  @ViewChild('notFoundMessage') notFoundMessage: ElementRef;
  @ViewChild('outputArea') outputArea: ElementRef;

  contentPath = '';
  contentNotFound = true;
  contentNotCurrentLang = false;
  contentData: RouteDataPage | RouteDataNavigatableContent;

  constructor(
    public app: AppService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private apiCaller: ApiCallerService,
    private routeObservingService: RouteObservingService,
  ) {
    this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.route.data.subscribe(data => {
          this.contentData = this.getTargetFile(data as RouteData);
          if (this.contentData) { this.loadMarkdown(); }
        });
      }
    });

    PreInitUtils.entrypoint();

    // this.http.get('/api/ganymede/auth/deviceTimestamp', {responseType: 'text'}).subscribe(data => {
    //   console.log('getBrowserTimestamp', data);
    // }, e => { console.log(e); });

    // (window as any)['uniqueSession'] = 'sdfsdfsdf';
    // console.log((window as any)['uniqueSession']);
  }

  onReady(editor) {
    // console.log(e);
    // editor.data.processor = new GFMDataProcessor();
    // editor.extraPlugins = 'markdown';
    // console.log(editor);
    // console.log(editor.ui.componentFactory.names())
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  getTargetFile(data: RouteData): RouteDataPage | RouteDataNavigatableContent {
    const paths = [];
    let contentNode = data.pageData;
    if (!contentNode) { return null; }
    // this.markdownPathIsRoot = false;
    if (contentNode.path !== this.route.snapshot.url[0].path) {
      return null;
    }
    if (this.route.snapshot.url.length === 1) {
      // this.markdownPathIsRoot = true;
      this.contentPath = this.app.defaultUserContentsPath + '/' + contentNode.path;
      return contentNode;
    }
    paths.push(contentNode.path);
    for (const seg of this.route.snapshot.url.slice(1)) {
      const matched = contentNode.children.filter(item => item.path === seg.path)[0];
      if (!matched) { return null; }
      contentNode = matched;
      paths.push(contentNode.path);
    }
    this.contentPath = this.app.defaultUserContentsPath + '/' + paths.slice(0, -1).join('/');
    return contentNode;
  }

  async loadMarkdown() {
    if (!this.contentPath || !this.markdownFrame) { return false; }
    const metadataPath = this.getMetadataJsonPath();
    this.contentNotCurrentLang = false;
    this.http.get<BasicContentMetadata>(metadataPath, {responseType: 'json'}).subscribe(async contentMetadata => {
        let targetLang = null;
        if (contentMetadata.i18n[this.app.lang]) {
          targetLang = this.app.lang;
        } else {
          this.contentNotCurrentLang = true;
          for (const lang of this.app.langList) {
            if (contentMetadata.i18n[this.app.lang]) {
              targetLang = lang;
              break;
            }
          }
        }
        if (!targetLang) { targetLang = Object.keys(contentMetadata.i18n)[0]; }
        if (!targetLang) {
          this.contentNotFound = true;
          return;
        }
        const targetPath = this.getContentPathNoExtension()
                            + '.' + targetLang
                            + '.' + this.convertContentTypeToExtension(contentMetadata.type);
        const loaded = await this.markdownFrame.load(targetPath);
    }, e => {
      console.log(e);
    });
    // this.markdownNotCurrentLang = false;
    // let loaded = false;
    // if (this.markdownPath && this.markdownFrame) {
    //   try {
    //     if (this.markdownPathIsRoot) {
    //       loaded = await this.markdownFrame.load(this.markdownPath + '/_root.' + this.app.lang + '.md');
    //     } else {
    //       loaded = await this.markdownFrame.load(this.markdownPath + '/' + this.contentData.path + '.' + this.app.lang + '.md');
    //     }
    //   } catch (e) {}
    //   if (loaded) { this.markdownNotFound = false; return; }
    //   for (const lang of this.app.langList) {
    //     if (lang === this.app.lang) { continue; }
    //     try {
    //       if (this.markdownPathIsRoot) {
    //         loaded = await this.markdownFrame.load(this.markdownPath + '/_root.' + lang + '.md');
    //       } else {
    //         loaded = await this.markdownFrame.load(this.markdownPath + '/' + this.contentData.path + '.' + lang + '.md');
    //       }
    //       this.markdownNotCurrentLang = true;
    //       this.markdownNotFound = false;
    //       return;
    //     } catch (e) { }
    //   }
    // }
    // this.markdownNotFound = true;
    // if (this.notFoundMessage) { this.notFoundMessage.nativeElement.style.opacity = 1; }
    // if (this.markdownFrame) { this.markdownFrame.unload(); }
  }

  ngAfterViewInit() {
    this.loadMarkdown();
    // CKEDITOR.getClassicEditor().then(editorDef => {
    //   // CKEDITOR.getRootDef().filter.allowedContent.push('infoBox');
    //   editorDef.create( document.querySelector( '#editor' ), {
    //     codeBlock: {
    //       languages: [
    //         { language: 'typescript', label: 'TypeScript' },
    //         { language: 'javascript', label: 'JavaScript' },
    //         { language: 'html', label: 'HTML' },
    //       ]
    //     },
    //   } )
    //   .then( editor => {

    //   } )
    //   .catch( error => {
    //       console.error( error.stack );
    //   } );
    // });
  }

  ngOnInit(): void {

  }

  private getMetadataJsonPath() {
    const subpaths = this.contentPath.split('/');
    return this.contentPath + '/' + subpaths[subpaths.length - 1] + '._meta.json';
  }

  private getContentPathNoExtension() {
    const subpaths = this.contentPath.split('/');
    return this.contentPath + '/' + subpaths[subpaths.length - 1];
  }

  private convertContentTypeToExtension(type: BasicContentType) {
    switch (type) {
      case BasicContentType.HTML: return 'html';
      case BasicContentType.MARKDOWN: return 'md';
      default: return null;
    }
  }
}
