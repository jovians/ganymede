/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Component, OnInit, Input } from '@angular/core';
import { Theme, themeClrDefaultChoices, ThemeTypes } from '../../util/common/theme.controller';
import { kvOrder } from '../../util/directive/filter/keyvalue.order';

@Component({
  selector: 'gany-settings-theme-selector',
  templateUrl: './theme-selector.component.html',
  styleUrls: ['./theme-selector.component.scss']
})
export class ThemeSelectorComponent implements OnInit {
  kvOrder = kvOrder;
  @Input() headerVisible: boolean = false;
  @Input() headerText: string = 'Theme';
  @Input() themeChoices: {[key: string]: string} = themeClrDefaultChoices;
  selectedTheme: string;
  private locker;

  constructor() {}

  ngOnInit(): void {
    this.selectedTheme = `${Theme.currentThemeBase}-${Theme.currentThemeType}`;
  }

  themeChange() {
    const locker = this.locker = {};
    setTimeout(() => {
      if (locker !== this.locker) { return; }
      const themePair = this.selectedTheme.split('-');
      const themeBase = themePair[0];
      const themeType = themePair[1];
      Theme.set(themeBase, themeType as ThemeTypes, true);
    });
  }

}
