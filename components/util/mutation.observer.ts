/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

interface MutationWatcherConfig {
  childList?: boolean;
  subtree?: boolean;
  attributes?: boolean;
  characterData?: boolean;
}

export class MutationWatcher {

  observer: MutationObserver;
  onAny: () => void;
  onNew: (node: HTMLElement) => void;
  onDelete: (node: HTMLElement) => void;

  constructor(target: HTMLElement, config?: MutationWatcherConfig) {
    if (!config) { config = { childList: true, subtree: true, attributes: false }; }
    this.observer = new MutationObserver(mutations => { this.onElementMutation(mutations); });
    this.observer.observe(target, config);
  }

  onElementMutation(mutations: MutationRecord[]) {
    if (this.onAny) { this.onAny(); }
    if (this.onNew) { this.forAllAddedHTMLNodes(mutations, this.onNew); }
    if (this.onDelete) { this.forAllRemovedHTMLNodes(mutations, this.onDelete); }
  }

  private forAllRemovedHTMLNodes(mutations: MutationRecord[], callback: (node: HTMLElement) => void) {
    for (const mutation of mutations) {
      for (const element of mutation.removedNodes as any as HTMLElement[]) {
        const allElems = this.recursiveGetSubElements(element);
        for (const target of allElems) { callback(target); }
      }
    }
  }

  private forAllAddedHTMLNodes(mutations: MutationRecord[], callback: (node: HTMLElement) => void) {
    for (const mutation of mutations) {
      for (const element of mutation.addedNodes as any as HTMLElement[]) {
        const allElems = this.recursiveGetSubElements(element);
        for (const target of allElems) { callback(target); }
      }
    }
  }

  private recursiveGetSubElements(element: HTMLElement, list: HTMLElement[] = []) {
    if (!element) { return list; }
    list.push(element);
    if (!element.children || element.children.length === 0) { return list; }
    for (const childElement of element.children as any as HTMLElement[]) {
      this.recursiveGetSubElements(childElement, list);
    }
    return list;
  }
}
