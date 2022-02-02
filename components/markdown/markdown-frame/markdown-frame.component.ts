/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { MarkdownService, MarkdownComponent } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Components } from '../../../../ui.components';

const mdImageRegExp = /!\[(?<alttext>.*?)\]\((?<filename>.*?)(?=\"|\))(?<optionalpart>\".*\")?\)/g;

@Component({
    selector: 'markdown-frame',
    templateUrl: './markdown-frame.component.html',
    styles: [':host {width:100%; height:100%;}']
})
export class MarkdownFrameComponent implements AfterViewInit, OnDestroy {
  static registration = Components.register(MarkdownFrameComponent, () => require('./markdown-frame.component.json'));

  @ViewChild('markdownViewer') markdownViewer: MarkdownComponent;
  src: string = '';
  renderOnError: boolean = false;
  destroyed = false;

  constructor(
      private markdownService: MarkdownService,
      private router: Router,
      private readonly http: HttpClient
      ) {
  }

  ngAfterViewInit() {

  }

  ngOnDestroy() {
    this.destroyed = true;
  }

  unload() { this.markdownViewer.render(``); }

  async load(src: string = ''): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.src = src;
      if (this.src) {
        this.http.get(this.src, {responseType: 'text'}).subscribe(data => {
            if (src.startsWith('/')) {
              const srcPath = src.split('/').slice(0, -1).join('/');
              const lines = data.split('\n');
              const newContent = [];
              for (let line of lines) {
                line = line.replace('<THIS_CONTENT_PATH>', srcPath);
                let transformedLine = line;
                const matches = line.matchAll(mdImageRegExp);
                for (const match of matches) {
                  if (match.groups?.filename &&
                      !match.groups.filename.startsWith('http://') &&
                      !match.groups.filename.startsWith('https://') &&
                      !match.groups.filename.startsWith('/assets/')) {
                      const lookFor = match[0];
                      const replaced = lookFor.replace(
                                            match.groups.filename,
                                            `${srcPath}/${match.groups.filename}`);
                      const replacedLine = line.replace(lookFor, replaced);
                      transformedLine = replacedLine;
                  }
                }
                newContent.push(transformedLine);
              }
              data = newContent.join('\n');
            }
            // for (const groupKey of Object.keys(groups)) {
            //   console.log(groupKey, groups[groupKey]);
            // }
            try {
                this.markdownViewer.render(data, true);
                resolve(true);
            } catch (e) {
                if (this.renderOnError) {
                  this.markdownViewer.render(`Markdown Render Failed: ${e.message}`);
                  // console.error(e);
                  resolve(true);
                } else {
                  reject(e);
                }
            }
        }, e => {
          if (this.renderOnError) {
            this.markdownViewer.render(`Markdown Render Failed: ${e.message}`);
            // console.error(e);
            resolve(true);
          } else {
            reject(e);
          }
        });
      } else {
        const e = new Error(`Source not supplied.`);
        if (this.renderOnError) {
          this.markdownViewer.render(`Markdown Load Failed: ${e.message}`);
          // console.error(e);
          resolve(true);
        } else {
          reject(e);
        }
      }
    });
  }
}
