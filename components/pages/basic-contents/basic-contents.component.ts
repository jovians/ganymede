/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import {
  asRouteBasic, consumeSubDir, RouteData,
  RouteDataNavigatableContent, RouteDataPage, RouteMatchableDefinition
} from '../../util/common/route.helper';
import { MarkdownFrameComponent } from '../../markdown/markdown-frame/markdown-frame.component';
import { AppService } from '../../services/app.service';
import { RouteObservingService } from '../../services/route-observing.service';
import { HttpClient } from '@angular/common/http';
import { ApiCallerService } from '../../services/api-caller.service';
import { ResourceGuard } from '../../services/resource-guard';
import { Components } from '../../../../ui.components';
import { Subject, Subscription, BehaviorSubject } from 'rxjs';
import { resultify } from '../../util/shared/common';
import { TreeViewAsyncData } from '../../util/common/route.model';
import { AppPromised } from '../../util/common/app.promised';

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
export class BasicContentsComponent implements OnInit, OnDestroy {
  static registration = Components.register(BasicContentsComponent, () => require('./basic-contents.component.json'));

  public static asRoute<T = any>(subdir: string, routeData: RouteData<T>) {
    const routeDef = asRouteBasic(subdir, routeData);
    routeDef.main.component = BasicContentsComponent;
    if (routeData.pageData?.treeView) {
      const viewData = routeData.pageData?.treeView;
      if (viewData.resolverType === 'lazy') {
        const subj1 = new Subject<TreeViewAsyncData<T>[]>();
        // const subj = new BehaviorSubject<TreeViewAsyncData<T>[]>([
        //   { text: 'test', expanded: true, getChildren: () => null, } as  any
        // ]);
        const root$ = subj1.asObservable();
        (async () => {
          await AppPromised.ready;
          const basePath = routeData.sourceDataPath || AppPromised.data.defaultUserContentsPath;
          const indexResult = await resultify(AppPromised.http.get<any>(`${basePath}/${subdir}/index.json`, {responseType: 'json'}));
          if (indexResult.ok) {
            const addItemGetChildren = (item) => {
              // console.log(item);
              item.expandable = item.list?.length ? true : false;
              item.expanded = true;
              if (item.list) {
                for (const ch of item.list) {
                  addItemGetChildren(ch);
                }
              }
            };
            addItemGetChildren(indexResult.data);
            viewData.getChildren = (item: any) => {
              if (item.list?.length) {
                const subj = new BehaviorSubject<TreeViewAsyncData<T>[]>(item.list);
                return subj.asObservable();
              } else {
                return null;
              }
            }
            subj1.next(indexResult.data.list);
            // console.log(indexResult.data.list);
          }
        })();
        viewData.root$ = root$;
        viewData.getChildren = (node) => {
          const subj = new Subject<TreeViewAsyncData<T>[]>();
          // node.
          return null;
          return subj.asObservable();
        };
      } else {
        const subj = new BehaviorSubject<TreeViewAsyncData<T>[]>([
          { text: 'test', expanded: true, getChildren: () => null, } as  any
        ])
        const root$ = subj.asObservable();
        viewData.root$ = root$;
        viewData.getChildren = () => null;
      }
    }
    return [routeDef.main, ...routeDef.others];
  }

  @ViewChild('markdownFrame') markdownFrame: MarkdownFrameComponent;
  @ViewChild('notFoundMessage') notFoundMessage: ElementRef;
  @ViewChild('outputArea') outputArea: ElementRef;

  contentBasePath = this.app.defaultUserContentsPath;
  contentPath = '';
  contentPathLoaded = '';
  contentNotFound = true;
  contentNotCurrentLang = false;
  contentData: RouteDataPage | RouteDataNavigatableContent;
  routerEventSubs: Subscription;

  componentStowedAway: boolean = false;
  rememberRoute = true;
  rememberedRoute = '';

  constructor(
    public app: AppService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private apiCaller: ApiCallerService,
    private routeObserver: RouteObservingService,
  ) {
    this.routerEventSubs = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.route.data.subscribe(data => {
          if (this.componentStowedAway) { return; }
          this.contentData = this.getTargetFile(data as RouteData);
          if (this.contentData) { this.loadMarkdown(); }
        });
      }
    });
  }

  onReady(editor) {
    editor.ui.getEditableElement().parentElement.insertBefore(
      editor.ui.view.toolbar.element,
      editor.ui.getEditableElement()
    );
  }

  getTargetFile(data: RouteData): RouteDataPage | RouteDataNavigatableContent {
    const paths = [];
    let contentNode = data.pageData;
    if (data.sourceDataPath) { this.contentBasePath = data.sourceDataPath; }
    if (!contentNode) { return null; }
    // this.markdownPathIsRoot = false;
    if (contentNode.path !== this.route.snapshot.url[0].path) {
      return null;
    }
    if (this.route.snapshot.url.length === 1) {
      // this.markdownPathIsRoot = true;
      this.contentPath = this.contentBasePath + '/' + contentNode.path;
      return contentNode;
    }
    paths.push(contentNode.path);
    const pathsFromUrl = this.route.snapshot.url.slice(1);
    if (data.pageData.treeView) {
      for (const seg of pathsFromUrl) {
        paths.push(seg.path);
      }
      this.contentPath = this.contentBasePath + '/' + paths.join('/');
    } else {
      for (const seg of pathsFromUrl) {
        if (!contentNode.children) { return null; }
        const matched = contentNode.children.filter(item => item.path === seg.path)[0];
        if (!matched) { return null; }
        contentNode = matched;
        paths.push(contentNode.path);
      }
      this.contentPath = this.app.defaultUserContentsPath + '/' + paths.join('/');
    }
    return contentNode;
  }

  async loadMarkdown() {
    if (!this.contentPath || !this.markdownFrame || this.markdownFrame.destroyed) { return false; }
    if (this.contentPath === this.contentPathLoaded) { return false; }
    this.contentPathLoaded = this.contentPath;
    const metadataPath = this.getMetadataJsonPath();
    this.contentNotCurrentLang = false;
    // console.log(require(`${metadataPath}`));
    const contentMetadataResult = await resultify(this.http.get<BasicContentMetadata>(metadataPath, {responseType: 'json'}));
    if (contentMetadataResult.ok) {
      const contentMetadata = contentMetadataResult.data;
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
      const contentResult = await resultify(this.http.get(targetPath, {responseType: 'text'}));
      if (contentResult.ok) {
        const loaded = await this.markdownFrame.load(targetPath, contentResult.data);
        if (loaded) { this.app.setMainContentAreaScroll(0); }
        return;
      }
    }
    const targetPath = `${this.contentPath}/README.md`;
    const loaded = await this.markdownFrame.load(targetPath);
    if (loaded) { this.app.setMainContentAreaScroll(0); }
  }

  ngAfterViewInit() {
    this.loadMarkdown();
  }

  ngOnInit() {

  }

  ngOnDestroy() {
    if (this.routerEventSubs) {
      this.routerEventSubs.unsubscribe();
    }
  }

  onRouteSave() {
    this.componentStowedAway = true;
  }

  onRouteRestore() {
    this.componentStowedAway = false;
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
