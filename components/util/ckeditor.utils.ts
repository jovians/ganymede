export class CKEDITOR {
  static classic = 'ClassicEditor';
  static markdown = 'MarkdownEditor';
  static balloon = 'BalloonEditor';
  static decoupled = 'DecoupledEditor';
  static inline = 'InlineEditor';

  static initialized = false;
  static initializing = false;
  static sourcePromise;
  static getRootDef() {
    // tslint:disable-next-line: no-string-literal
    return window['CKEDITORS'];
  }
  static getEditor(editorType: string): Promise<any> {
    if (CKEDITOR.initialized) {
      return new Promise(resolve => {
        resolve((window as any).CKEDITORS[editorType]);
      });
    } else if (CKEDITOR.initializing) {
      return CKEDITOR.sourcePromise;
    } else {
      CKEDITOR.initializing = true;
      CKEDITOR.sourcePromise = new Promise(resolve => {
        const scriptTag = document.createElement('script');
        scriptTag.setAttribute('src', 'assets/ckeditor/ckeditor.js');
        scriptTag.setAttribute('async', '');
        scriptTag.setAttribute('defer', '');
        document.head.appendChild(scriptTag);
        // tslint:disable-next-line: no-string-literal
        window['__init_CKEDITOR__'] = editors => {
          CKEDITOR.initialized = true;
          CKEDITOR.initializing = false;
          (window as any).CKEDITORS = editors;
          resolve(editors[editorType]);
        };
      });
      return CKEDITOR.sourcePromise;
    }
  }
  static getClassicEditor() {
    return CKEDITOR.getEditor(CKEDITOR.classic);
  }
  static getMarkdownEditor() {
    return CKEDITOR.getEditor(CKEDITOR.markdown);
  }
  static getInlineEditor() {
    return CKEDITOR.getEditor(CKEDITOR.inline);
  }
  static getBalloonEditor() {
    return CKEDITOR.getEditor(CKEDITOR.balloon);
  }
  static getDecoupledEditor() {
    return CKEDITOR.getEditor(CKEDITOR.decoupled);
  }
}
