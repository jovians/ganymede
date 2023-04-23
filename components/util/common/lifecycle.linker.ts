/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ElementRef, OnDestroy } from '@angular/core';
import { ix } from 'ts-comply';
import { DomIdUtil } from './dom.id.util';

export enum LifecycleLinkType {
  RESIZE_DETECT = 'RESIZE_DETECT',
  MUTATION_SUBTREE = 'MUTATION_SUBTREE',
}

export class LifecycleLinker {
  static link(linkType: string, angularComponent: ix.Entity, target: any): { onDestroy: () => (Promise<void> | void)} {
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
    angularComponent.addOnDestroy(() => {
      onDestroyObj.onDestroy();
    });
    return onDestroyObj;
  }

  static containerElementOf(component: ElementRef) {
    return component.nativeElement.parentElement as HTMLElement;
  }
}
