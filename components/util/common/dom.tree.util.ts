/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ElementRef } from '@angular/core';

export class DomTreeUtil {

  static elementOf(component: ElementRef) {
    return component.nativeElement as HTMLElement;
  }

  static containerElementOf(component: ElementRef) {
    return component.nativeElement.parentElement as HTMLElement;
  }
}
