import { Component, OnInit, Input, OnChanges, OnDestroy } from '@angular/core';
import { ix } from '../../../services/app.service';
import { Unit } from '../../../util/shared/unit.utils';

const belowThresholdScheme = { domain: ['rgb(0, 106, 145)'] };
const aboveThresholdScheme = { domain: ['rgb(194, 85, 0)'] };

@Component({
  selector: 'swimlane-adv-util-gauge',
  templateUrl: './swimlane-adv-util-gauge.component.html',
  styleUrls: ['./swimlane-adv-util-gauge.component.scss']
})
export class SwimlaneAdvUtilGaugeComponent extends ix.Entity implements OnInit, OnChanges, OnDestroy {
  @Input() title: string = '';
  @Input() titleInfo: { message?: string; icon?: { shape: string; badge: string; status: string; }} = null;
  @Input() value: number = 0;
  @Input() valuePrefix: typeof Unit.prefixes;
  @Input() valuePercentToFixed: number = 0;
  @Input() maxValue: number;
  @Input() maxValuePrefix: typeof Unit.prefixes;
  @Input() maxValueLineOverride = '';
  @Input() maxValueText = 'Max';
  @Input() unit: string = "";
  @Input() size: ('xl' | 'lg' | 'md' | 'sm' | 'xs') = 'md';
  @Input() threshold: number = 0;
  @Input() thresholdPercent: number = 0;
  @Input() peak: number = 0;

  styles: { [key: string]: boolean } = {};
  colorScheme = belowThresholdScheme;
  graphData: { name: string; value: number; }[] = [{ name: "", value: 0 }, { name: "", value: 0 }];
  valuePercent: number;
  valuePercentString = '';
  valueString = '';
  valuePrefixString = '';
  maxValueString = '';
  maxValuePrefixString = '';

  constructor() {
    super('swimlane-adv-util-gauge');
  }

  ngOnInit() {}

  ngOnChanges() {
    let data = [{ name: "", value: this.value }];
    if (this.peak && this.peak > 0 && this.peak >= this.value) {
      data.push({ name: "", value: this.peak });
    } else if (this.threshold && this.threshold > 0 && this.value > this.threshold) {
      data.push({ name: "", value: this.threshold });
    }
    for (var key in this.styles) { if (this.styles.hasOwnProperty(key)) { delete this.styles[key]; } }
    this.styles[this.size] = true;
    this.graphData = data;
    if (this.value === 0 && this.maxValue === 0) { this.maxValue = 0.0001; }
    this.valuePercent = this.value / this.maxValue * 100;
    if (isNaN(this.valuePercent)) { this.valuePercent = 0; }
    this.valuePercentString = (this.valuePercent >= 0.95 || this.value < 0.000001)
      ? this.valuePercent.toFixed(this.valuePercentToFixed)
      : this.valuePercent.toFixed(1);
    const val = Unit.adjust(this.value, this.valuePrefix);
    this.valueString = val.value;
    this.valuePrefixString = val.prefix;
    const capa = Unit.adjust(this.maxValue, this.maxValuePrefix);
    this.maxValueString = capa.value;
    this.maxValuePrefixString = capa.prefix;
    let isAboveThreshold = this.threshold && this.threshold > 0 && this.value > this.threshold;
    if (this.thresholdPercent) { isAboveThreshold = this.valuePercent > this.thresholdPercent; }
    this.styles["red-lining"] = isAboveThreshold;
    this.colorScheme = isAboveThreshold ? aboveThresholdScheme : belowThresholdScheme;
  }

  ngOnDestroy() {
    this.destroy();
  }

}
