/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Components } from '../../../../../ui.components';
import { Component, Input, OnInit, OnChanges, SimpleChanges, ElementRef, OnDestroy } from '@angular/core';
import { DomTreeUtil } from '../../../util/common/dom.tree.util';
import { SizeUtil } from '../../../util/common/size.util';
import { MutationUtil } from '../../../util/common/mutation.observer';
import { topMomentOut } from '../../../util/shared/common';
import { ix } from '@jovian/type-tools';

@Component({
  selector: 'app-wavefront-embedded-chart',
  templateUrl: './wavefront-embedded-chart.component.html',
  styleUrls: ['./wavefront-embedded-chart.component.scss']
})
export class WavefrontEmbeddedChartComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  static registration = Components.register(WavefrontEmbeddedChartComponent, () => require('./wavefront-embedded-chart.component.json'));

  @Input() protocol = 'https';
  @Input() domain = 'wavefront.com';
  @Input() chartId = '';
  @Input() percentDimension = false;
  @Input() width: number | string = 300;
  @Input() height: number | string = null;

  constructor(private host: ElementRef) {
    super('wavefront-embedded-chart');
  }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges) {
    this.nudgeChart();
  }

  getCurrentId() { return `wavefront-embedded-${this.chartId}`; }

  clearChartArea() {
    const id = this.getCurrentId();
    const el = document.getElementById(id);
  }

  nudgeChart() {
    topMomentOut(this, 'nudgeChart', 50, () => {
      this.clearChartArea();
      const id = this.getCurrentId();
      const el = document.getElementById(id);
      const cont = DomTreeUtil.containerElementOf(this.host);
      const keeper = { width: 0, height: 0, iframe: null };
      const dynamicResize = () => {
        if (!this.percentDimension) {
          keeper.iframe.setAttribute('width', this.width);
          keeper.iframe.setAttribute('height', this.height ? this.height : keeper.iframe.height);
        } else {
          keeper.iframe.setAttribute('width', keeper.width * parseFloat(this.width as any) / 100);
          keeper.iframe.setAttribute('height', this.height ? keeper.height * parseFloat(this.height as any) / 100
                                                           : keeper.iframe.height);
        }
      };
      SizeUtil.linkDimension(this, cont, dim => {
        keeper.width = dim.width; keeper.height = dim.height;
        if (!keeper.iframe) { return; }
        dynamicResize();
      });
      MutationUtil.link(this, this.host.nativeElement, mutations => {
        if (keeper.iframe) { return; }
        for (const mut of mutations) {
          for (const addedNode of Array.from(mut.addedNodes)) {
            if (addedNode.nodeName === 'IFRAME' && (addedNode as any).src.indexOf('legend') === -1) {
              keeper.iframe = addedNode;
              dynamicResize();
            }
          }
        }
      });
      const embedder = document.createElement('script');
      embedder.src = `${this.protocol}://${this.domain}/embedded/${this.chartId}/js`;
      embedder.id = id;
      el.parentElement.appendChild(embedder);
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

}
