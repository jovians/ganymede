/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Components } from '../../../../ui.components';
import { AppService } from '../../services/app.service';
import { MarkdownFrameComponent } from '../markdown-frame/markdown-frame.component';

@Component({
  selector: 'app-markdown-content',
  templateUrl: './markdown-content.component.html',
  styles: [':host {width:100%; height:100%;}']
})
export class MarkdownContentComponent implements OnInit {
  static registration = Components.register(MarkdownContentComponent, () => require('./markdown-content.component.json'));

  @ViewChild('markdownFrame') markdownFrame: MarkdownFrameComponent;
  @Input() filePath = '';

  constructor(
    private app: AppService,
    private router: Router,
  ) {
    this.app.routeData.subscribe(data => {
      if (data.pageData && data.pageData.type === 'basic-contents') {
        this.loadFile(data.pageData.root);
      }
    });
  }

  // tslint:disable-next-line: use-lifecycle-interface
  ngAfterViewInit() {
    if (this.filePath) { this.loadFile(this.filePath); }
  }

  async loadFile(path: string) {
    if (path.indexOf('~') >= 0) { path = path.replace('~', this.app.defaultUserContentsPath + '/'); }
    if (path.indexOf('{LANG}') >= 0) { path = path.replace('{LANG}', this.app.lang); }
    this.markdownFrame.renderOnError = false;

    try {
      await this.markdownFrame.load(path);
    } catch (e) {
      this.router.navigate(['404']);
    }
  }

  ngOnInit() {

  }

}
