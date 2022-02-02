/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ganylog } from './console.util';
import { v4 as uuidv4 } from 'uuid';
import { LifecycleLinker, LifecycleLinkType } from './lifecycle.linker';
import { ix } from '@jovian/type-tools';

declare var window: any;

const visChangeCallbacksMap = {};
window.addEventListener('visibilitychange', e => {
  for (const key of Object.keys(visChangeCallbacksMap)) {
    visChangeCallbacksMap[key]();
  }
});

interface SizeUtilFullInfo {
  width: number;
  height: number;
  computedWidth: number;
  computedHeight: number;
}

export enum DisplayMode {
  NONE = 'NONE', NARROW = 'NARROW', NORMAL = 'NORMAL', WIDE = 'WIDE',
}

export class SizeUtil {
  static computedStyleCacheExpire = 100;
  static windowOnResizeHandlers: ((e) => any)[] = [];
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
  static linkDimension(component: ix.Entity, target: HTMLElement, onResize: (dim: SizeUtilFullInfo) => void) {
    const id = uuidv4();
    const link = LifecycleLinker.link(LifecycleLinkType.RESIZE_DETECT, component, target);
    if (link) {
      let observer = new window.ResizeObserver(() => {
        onResize(SizeUtil.percentDimension(target, true));
      });
      visChangeCallbacksMap[id] = () => {
        onResize(SizeUtil.percentDimension(target, true));
      };
      observer.observe(target);
      link.onDestroy = () => {
        observer.unobserve(target);
        observer = null;
        delete visChangeCallbacksMap[id];
      };
    }
  }
  static addOnWindowResize(handler: (e) => any) {
    if (SizeUtil.windowOnResizeHandlers.length === 0) {
      window.addEventListener('resize', e => {
        for (const resizeHandler of SizeUtil.windowOnResizeHandlers) {
          try { resizeHandler(e); } catch (e) { ganylog('SizeUtil', e); }
        }
      });
    }
    SizeUtil.windowOnResizeHandlers.push(handler);
  }
}
