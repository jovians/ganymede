/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { LifecycleLinkable, LifecycleLinker, LifecycleLinkType } from './lifecycle.linker';

declare var window: any;

interface SizeUtilFullInfo {
  width: number;
  height: number;
  computedWidth: number;
  computedHeight: number;
}

export class SizeUtil {
  static computedStyleCacheExpire = 100;
  static getComputedStyle(el: any, noCache = false) {
    const last = el._computed_style_last;
    const now = Date.now();
    if (noCache || !last || now - last > SizeUtil.computedStyleCacheExpire) {
      el._computed_style = window.getComputedStyle(document.documentElement);
      el._computed_style_last = now;
    }
    return el._computed_style;
  }
  static percentWidth(referenceElement: any, noCache = false) {
    const cs = SizeUtil.getComputedStyle(referenceElement);
    return parseFloat(cs.width);
  }
  static percentHeight(referenceElement: any, noCache = false) {
    const cs = SizeUtil.getComputedStyle(referenceElement);
    return parseFloat(cs.height);
  }
  static percentDimension(referenceElement: any, noCache = false): SizeUtilFullInfo {
    const cs = SizeUtil.getComputedStyle(referenceElement, noCache);
    return {
      width: referenceElement.offsetWidth,
      height: referenceElement.offsetHeight,
      computedWidth: parseFloat(cs.width),
      computedHeight: parseFloat(cs.height),
    };
  }
  static linkDimension(component: LifecycleLinkable, target: HTMLElement, onResize: (dim: SizeUtilFullInfo) => void) {
    const link = LifecycleLinker.link(LifecycleLinkType.RESIZE_DETECT, component, target);
    if (link) {
      let observer = new window.ResizeObserver(() => {
        onResize(SizeUtil.percentDimension(target, true));
      });
      observer.observe(target);
      link.onDestroy = () => {
        observer.unobserve(target);
        observer = null;
      };
    }
  }
}
