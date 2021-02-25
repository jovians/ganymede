/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ElementRef, OnDestroy } from '@angular/core';
import { DomIdUtil } from './dom.id.util';

export enum LifecycleLinkType {
  RESIZE_DETECT = 'RESIZE_DETECT',
  MUTATION_SUBTREE = 'MUTATION_SUBTREE',
}

export interface LifecycleLinkable extends OnDestroy {
  lifecycleCallbacks?: { onDestroy: () => (Promise<void> | void)}[];
}

export class LifecycleLinker {
  static link(linkType: string, angularComponent: LifecycleLinkable, target: any): { onDestroy: () => (Promise<void> | void)} {
    if (typeof target !== 'object') { throw new Error(`Cannot link lifecycle to non-object target. (target=${target})`); }
    if (!target._gany_lc_links) { Object.defineProperty(target, '_gany_lc_links', { value: {} }); }
    DomIdUtil.readyAngularComponent(angularComponent);
    const hashId = (angularComponent as any)._gany_hash_id;
    const linkKey = hashId + '|' + linkType;
    if (target._gany_lc_links[linkKey]) { return null; } // already linked
    target._gany_lc_links[linkKey] = true;
    const onDestroyObj: { onDestroy: () => (Promise<void> | void)} = {
      onDestroy: () => {}
    };
    if (!angularComponent.lifecycleCallbacks) { angularComponent.lifecycleCallbacks = []; }
    angularComponent.lifecycleCallbacks.push(onDestroyObj);
    return onDestroyObj;
  }

  static containerElementOf(component: ElementRef) {
    return component.nativeElement.parentElement as HTMLElement;
  }
}

export function lifecycleEnd(component: LifecycleLinkable) {
  if (component.lifecycleCallbacks) {
    for (const onDestroyObj of component.lifecycleCallbacks) {
      if (onDestroyObj && onDestroyObj.onDestroy) {
        onDestroyObj.onDestroy();
      }
    }
    component.lifecycleCallbacks.length = 0;
    delete component.lifecycleCallbacks;
  }
}
