/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Directive, Input, ViewContainerRef, TemplateRef } from '@angular/core';

// From: https://stackoverflow.com/a/43172992
@Directive({
  selector: '[ngVar]',
})
export class VarDirective {
  @Input()
  set ngVar(context: unknown) {
      this.context.$implicit = this.context.ngVar = context;

      if (!this.hasView) {
          this.vcRef.createEmbeddedView(this.templateRef, this.context);
          this.hasView = true;
      }
  }

  private context: {
      $implicit: unknown;
      ngVar: unknown;
  } = {
      $implicit: null,
      ngVar: null,
  };

  private hasView: boolean = false;

  constructor(
      private templateRef: TemplateRef<any>,
      private vcRef: ViewContainerRef
  ) {}
}
