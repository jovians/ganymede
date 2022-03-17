/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
type Prefix = ('0' | '0i' | 'k' | 'ki' | 'M' | 'Mi' | 'G' | 'Gi' | 'T' | 'Ti' | 'P' | 'Pi' | 'E' | 'Ei' );
export class Unit {
  static KiB = 1024;
  static MiB = 1048576;
  static GiB = 1073741824;
  static TiB = 1099511627776;
  static prefixes: Prefix;

  static sliceDecimalZeroes(v: string) {
    if (v.indexOf('.') === -1) { return v; }
    while (v.indexOf('.') >= 0 && (v.endsWith('0') || v.endsWith('.'))) { v = v.slice(0, -1); }
    return v;
  }

  static adjust = (n: number | string, prefix?: Prefix): { value: string, prefix: Prefix } => {
    if (typeof n === 'string') { n = parseFloat(n); }
    if (n < 0.01 && n >= 0) { return { value: '0', prefix }; }
    if (n < 1) {
      return { value: Unit.sliceDecimalZeroes(n.toFixed(2)), prefix };
    } else if (n < 10) {
      return { value: Unit.sliceDecimalZeroes(n.toFixed(2)), prefix };
    } else if (n < 100) {
      return { value: Unit.sliceDecimalZeroes(n.toFixed(1)), prefix };
    } else if (n < 1000) {
      return { value: Unit.sliceDecimalZeroes(n.toFixed(0)), prefix };
    } else {
      const next = Unit.bigger(prefix);
      if (next.factor === 1) { return { value: n.toFixed(0), prefix }; }
      return Unit.adjust(n / next.factor, next.prefix);
    }
  };

  static formatted = (n: number | string, prefix: Prefix, unit: string): string => {
    if (typeof n === 'string') { n = parseFloat(n); }
    const fmat = this.adjust(n, prefix);
    return `${fmat.value} ${fmat.prefix}${unit}`;
  };

  static bigger = (prefix: Prefix): { prefix: Prefix, factor: number } => {
    switch(prefix) {
      case '0': return { prefix: 'k', factor: 1000 };
      case '0i': return { prefix: 'ki', factor: 1024 };
      case 'k': return { prefix: 'M', factor: 1000 };
      case 'ki': return { prefix: 'Mi', factor: 1024 };
      case 'M': return { prefix: 'G', factor: 1000 };
      case 'Mi': return { prefix: 'Gi', factor: 1024 };
      case 'G': return { prefix: 'T', factor: 1000 };
      case 'Gi': return { prefix: 'Ti', factor: 1024 };
      case 'T': return { prefix: 'P', factor: 1000 };
      case 'Ti': return { prefix: 'Pi', factor: 1024 };
      case 'P': return { prefix: 'E', factor: 1000 };
      case 'Pi': return { prefix: 'Ei', factor: 1024 };
      default: return { prefix, factor: 1 };
    }
  };

  static lesser = (prefix: Prefix): { prefix: Prefix, factor: number } => {
    switch(prefix) {
      case 'k': return { prefix: 'M', factor: 1000 };
      case 'ki': return { prefix: 'Mi', factor: 1024 };
      case 'M': return { prefix: 'G', factor: 1000 };
      case 'Mi': return { prefix: 'Gi', factor: 1024 };
      case 'G': return { prefix: 'T', factor: 1000 };
      case 'Gi': return { prefix: 'Ti', factor: 1024 };
      default: return { prefix, factor: 1 };
    }
  };

  static simplePercent = (value: number | string, max: number | string) => {
    if (typeof value === 'string') { value = parseFloat(value); }
    if (typeof max === 'string') { max = parseFloat(max); }
    const percent = value / max * 100;
    const percentStr = (percent >= 1 || percent === 0) ? percent.toFixed(0) : percent.toFixed(1);
    return `${percentStr}%`;
  }

}
