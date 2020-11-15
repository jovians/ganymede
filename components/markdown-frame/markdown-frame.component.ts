import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { MarkdownService, MarkdownComponent } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
    selector: 'markdown-frame',
    templateUrl: './markdown-frame.component.html',
    styles: [':host {width:100%; height:100%;}']
})

export class MarkdownFrameComponent implements AfterViewInit {

    @ViewChild('markdownViewer') markdownViewer: MarkdownComponent;
    basePath: string = 'assets/md/';
    src: string = '';
    renderOnError: boolean = false;

    constructor(
        private markdownService: MarkdownService,
        private router: Router,
        private readonly http: HttpClient
        ) {
    }

    ngAfterViewInit() {

    }

    async load(src: string = ''): Promise<void> {
      return new Promise((resolve, reject) => {
        this.src = src;
        if (this.src) {
          this.http.get(this.basePath + this.src, {responseType: 'text'}).subscribe(data => {
              try {
                  this.markdownViewer.render(data, true);
                  resolve();
              } catch (e) {
                  if (this.renderOnError) {
                    this.markdownViewer.render(`Markdown Render Failed: ${e.message}`);
                    console.error(e);
                    resolve();
                  } else {
                    reject(e);
                  }
              }
          }, e => {
            if (this.renderOnError) {
              this.markdownViewer.render(`Markdown Render Failed: ${e.message}`);
              console.error(e);
              resolve();
            } else {
              reject(e);
            }
          });
        } else {
          const e = new Error(`Source not supplied.`);
          if (this.renderOnError) {
            this.markdownViewer.render(`Markdown Load Failed: ${e.message}`);
            console.error(e);
            resolve();
          } else {
            reject(e);
          }
        }
      });
    }

}
