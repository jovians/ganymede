/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { ix } from '@jovian/type-tools';

declare var window: Window;
declare var document: Document;

@Injectable({
  providedIn: 'root'
})
export class InputEventService extends ix.Entity {

  constructor() {
    super('input-event-service');
    supportWheelListenEvents();
    (window as any).addWheelListener(document, e => {
      this.ixRx<WheelEvent>('wheel').next(e);
    }, { passive: false });
  }
  get wheel$() { return this.ixRx<WheelEvent>('wheel').obs(); }
}

// from https://stackoverflow.com/a/33335675
function supportWheelListenEvents() {
  let prefix = '';
  // tslint:disable-next-line: variable-name
  let _addEventListener;
  let support;
  // detect event model
  if (window.addEventListener) {
    _addEventListener = 'addEventListener';
  } else {
    _addEventListener = 'attachEvent';
    prefix = 'on';
  }
  // detect available wheel event
  support = 'onwheel' in document.createElement('div') ? 'wheel' : // Modern browsers support "wheel"
            (document as any).onmousewheel !== undefined ? 'mousewheel' : // Webkit and IE support at least "mousewheel"
            'DOMMouseScroll'; // let's assume that remaining browsers are older Firefox
  (window as any).addWheelListener = (elem, callback, useCapture) => {
      _addWheelListener( elem, support, callback, useCapture);
      // handle MozMousePixelScroll in older Firefox
      if ( support === 'DOMMouseScroll' ) {
          _addWheelListener(elem, 'MozMousePixelScroll', callback, useCapture);
      }
  };
  function _addWheelListener(elem, eventName, callback, useCapture) {
    elem[ _addEventListener ]( prefix + eventName, support === 'wheel' ? callback : originalEvent => {
      // tslint:disable-next-line: no-unused-expression deprecation
      !originalEvent && ( originalEvent = window.event );
      // create a normalized event object
      const event = {
        // keep a ref to the original event object
        originalEvent,
        target: originalEvent.target || originalEvent.srcElement,
        type: 'wheel',
        deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
        deltaX: 0,
        deltaZ: 0,
        preventDefault: () => {
            originalEvent.preventDefault ?
                originalEvent.preventDefault() :
                originalEvent.returnValue = false;
        }
      };
      // calculate deltaY (and deltaX) according to the event
      if ( support === 'mousewheel' ) {
        (event as any).deltaY = - 1 / 40 * originalEvent.wheelDelta;
        // Webkit also support wheelDeltaX
        // tslint:disable-next-line: no-unused-expression
        originalEvent.wheelDeltaX && ( event.deltaX = - 1 / 40 * originalEvent.wheelDeltaX );
      } else {
        (event as any).deltaY = originalEvent.detail;
      }
      // it's time to fire the callback
      return callback( event );
    }, useCapture || false );
  }
}
