import { Component, OnInit, OnChanges, OnDestroy, Input, TemplateRef, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { completeConfigDirectly } from '../../../util/shared/common';
import { ix } from '@jovian/type-tools';
import { SizeUtil } from '../../../util/common/size.util';
import { DomTreeUtil } from '../../../util/common/dom.tree.util';
import { DataFetcher } from 'src/app/ganymede/models/data.fetcher.model';

export class SwimlaneAdvancedPieChartGraphConfig {
  static defaultConfig: Partial<SwimlaneAdvancedPieChartGraphConfig> = {
    view: [700, 400],
    animations: true,
    gradient: true,
    activeEntries: null,
    label: 'Total',
    tooltipDisabled: false,
    tooltipTemplate: null,
    valueFormatting: null,
    nameFormatting: null,
    percentageFormatting: null,
    colorScheme: {domain: ['#5AA454', '#A10A28', '#C7B42C', '#AAAAAA']},
    offset: { top: 0, left: 0, right: 0, bottom: 0 },
    onSelect: ($event) => {},
    onActivate: ($event) => {},
    onDeactivate: ($event) => {},
  };

  view?: number[];
  animations?: boolean;
  gradient?: boolean;
  activeEntries?: any[];
  label?: string;
  tooltipDisabled?: boolean;
  tooltipTemplate?: TemplateRef<any>;
  valueFormatting?: (...a) => any;
  nameFormatting?: (...a) => any;
  percentageFormatting?: (...a) => any;
  colorScheme?: { domain?: string[] };
  offset?: { top?: number; left?: number; right?: number; bottom?: number };
  onSelect?: ($event) => any = () => {};
  onActivate?: ($event) => any = () => {};
  onDeactivate?: ($event) => any = () => {};

  constructor(init?: Partial<SwimlaneAdvancedPieChartGraphConfig>) {
    if (init) { Object.assign(this, init); }
    completeConfigDirectly(this, SwimlaneAdvancedPieChartGraphConfig.defaultConfig);
  }
}

interface DataFetchArgs {
  
}

interface DataFetchResult {
  
}

@Component({
  selector: 'swimlane-adv-pie-chart',
  templateUrl: './swimlane-adv-pie-chart.component.html',
  styleUrls: ['./swimlane-adv-pie-chart.component.scss']
})
export class SwimlaneAdvPieChartComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  
  @Input() graphConfig = new SwimlaneAdvancedPieChartGraphConfig();
  @Input() fetcher: DataFetcher<DataFetchArgs, DataFetchResult>;

  @ViewChild('chartContainer', { static: true }) chartContainer: ElementRef;

  constructor(private host: ElementRef) {
    super('swimlane-adv-pie-chart');
  }

  ngOnInit(): void {
    const cont = this.chartContainer.nativeElement;
    // const chartArea = this.chartArea.nativeElement;
    cont.component = this;
    // cont.style.opacity = 0.01;
    const hostCont = DomTreeUtil.containerElementOf(this.host);
    SizeUtil.linkDimension(this, hostCont, dim => {
      let w = dim.width - 1;
      if (this.graphConfig?.offset?.left) { w -= this.graphConfig?.offset?.left; }
      if (this.graphConfig?.offset?.right) { w -= this.graphConfig?.offset?.right; }
      let h = dim.height - 20;
      if (this.graphConfig?.offset?.top) { h -= this.graphConfig?.offset?.top; }
      if (this.graphConfig?.offset?.bottom) { h -= this.graphConfig?.offset?.bottom; }
      if (w <= 1 || h <= 1) { return; }
      cont.style.opacity = 1;
      this.graphConfig.view = [w, h];
      if (this.chartContainer) {
        this.chartContainer.nativeElement.style.marginLeft = this.graphConfig.offset.left + 'px';
        this.chartContainer.nativeElement.style.marginTop = this.graphConfig.offset.top + 'px';
      }
    });
  }

  ngOnDestroy() {
    this.destroy();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.fetcher) {
      this.fetcher.lazyFetch();
    }
    if (changes.graphConfig) {
      this.loadConfig(changes.graphConfig.currentValue);
    }
  }

  loadConfig(config) {
    completeConfigDirectly(config, SwimlaneAdvancedPieChartGraphConfig.defaultConfig);
    // this.overrideStyle(this.chartContainer, config.containerStyle);
    // this.overrideStyle(this.titleDiv, config.titleStyle);
    // this.overrideStyle(this.descriptionDiv, config.descriptionStyle);
  }

}
