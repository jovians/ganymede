import { Injectable } from '@angular/core';

declare var window: any;

@Injectable({
  providedIn: 'root'
})
export class PrismHighlightService {
  
  lib: any; // Prism library
  constructor() {
    if (window.Prism) {
      window.Prism.plugins.filterHighlightAll.reject.addSelector('pre[tabindex] > code');
    }
    this.lib = window.Prism;
  }

  async nudgeHighlight(component: any, async = true, delay = 250): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      let resolved = false;
      const locker = (component as any).__prism_highlight_locker = {};
      setTimeout(() => {
        if (locker !== (component as any).__prism_highlight_locker) {
          resolved = true;
          return resolve(false);
        }
        this.lib.highlightAll(async,() => {
          if (resolved) { return; }
          resolved = true;
          return resolve(true);
        });
      }, delay);
    });
  }

  getLanguageClass(lang: string) {
    switch(lang.toLowerCase()) {
      case 'c/c++': return 'language-clike';
      case 'cuda': return 'language-clike';
      case 'c#': return 'language-csharp';
      case 'java': return 'language-java';
      case 'apex': return 'language-apex';
      case 'kotlin': return 'language-kotlin';
      case 'text': return 'language-text';
      case 'vb.net': return 'language-vbnet';
      case 'scala': return 'language-scala';
      case 'fortran': return 'language-fortran';
      case 'go': return 'language-go';
      case 'html': return 'language-markup';
      case 'javascript': return 'language-javascript';
      case 'objective-c': return 'language-objectivec';
      case 'php': return 'language-php';
      case 'python': return 'language-python';
      case 'html': return 'language-markup';
      case 'ruby': return 'language-ruby';
      case 'swift': return 'language-swift';
      case 'typescript': return 'language-typescript';
      default: return 'language-text';
    }
  }
}
