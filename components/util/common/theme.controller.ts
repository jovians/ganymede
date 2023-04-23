/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { ix } from 'ts-comply';
import { ganymedeAppData } from '../../../../../../ganymede.app';

const cssPath = 'assets/css';
const themesPath = 'assets/css/theme';
let themeSectionDiv = null;

export enum ThemeTypes {
  DEFAULT = 'DEFAULT',
  UNIVERSAL = 'UNIVERSAL',
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  BLACK = 'BLACK',
}

export enum ThemeBases {
  CLARITY = 'CLARITY',
}

export interface ThemeInfo {
  default?: boolean;
  cssFile: string;
  dark?: boolean;
  bg?: string;
}

export class ThemeController extends ix.Entity {
  registry: {[themeName: string]: {[themeType: string]: ThemeInfo }} = {
    [ThemeBases.CLARITY]: {
      [ThemeTypes.LIGHT]: { cssFile: `${themesPath}/clr-ui.light.css`, default: true, bg: '#fafafa' },
      [ThemeTypes.DARK]: { cssFile: `${themesPath}/clr-ui.dark.css`, dark: true, bg: '#1b2a32' },
      [ThemeTypes.BLACK]: { cssFile: `${themesPath}/clr-ui.black.css`, dark: true, bg: '#000000' },
    }
  };
  currentThemeBase: string = null;
  currentThemeType: string = null;
  isDark: boolean = false;
  private themeChangeLock;
  constructor() { super('theme-controller'); }
  ensure(themeBase: string, themeType?: ThemeTypes) {
    if (!themeType) { themeType = this.getDefaultThemeType(themeBase) as ThemeTypes; }
    if (!themeType) { throw new Error(`Default theme type for ${themeBase} cannot be found`); }
    const existing = document.getElementById(`theme-${themeBase}`);
    if (existing && existing.getAttribute('value') === themeType) { return; }
    this.set(themeBase, themeType);
  }
  getDefaultThemeType(themeBase: string) {
    const themeBaseMap = this.registry[themeBase];
    if (!themeBaseMap) { throw new Error(`this ${themeBase} cannot be found on theme registry.`); }
    let defaultThemeType;
    for (const themeType of Object.keys(themeBaseMap)) {
      const theme = themeBaseMap[themeType];
      if (theme.default) { defaultThemeType = theme; return themeType; }
    }
    return ganymedeAppData?.theme?.type;
  }
  set(themeBase?: string, themeType?: ThemeTypes, fade?: boolean, loadCallback?: (...args) => any) {
    if (!themeBase) { themeBase = this.currentThemeBase; }
    if (this.currentThemeBase === themeBase && this.currentThemeType === themeType) { return; }
    if (themeType as any === '' || themeType as any === 'DEFAULT') { themeType = ganymedeAppData?.theme?.type as any; }
    if (!themeType) { themeType = this.getDefaultThemeType(themeBase) as ThemeTypes; }
    if (!themeType) { throw new Error(`Default theme type for ${themeBase} cannot be found`); }
    const theme = this.registry[themeBase]?.[themeType];
    if (!theme) { throw new Error(`this ${themeBase}:${themeType} cannot be found on theme registry.`); }
    // const appRoot = document.getElementsByTagName('APP-ROOT')[0] as HTMLElement;
    if (fade) {
      document.body.style.transition = 'none';
      document.body.style.opacity = '0.003';
    }
    const cssFileSrc = (window as any).srcResolver ? (window as any).srcResolver(theme.cssFile) : theme.cssFile;
    const existing = document.getElementById(`theme-${themeBase}`);
    if (existing) { existing.parentElement.removeChild(existing); }
    const cssLink = document.createElement('LINK');
    const lock = this.themeChangeLock = {};
    cssLink.setAttribute('id', `theme-${themeBase}`);
    cssLink.setAttribute('value', themeType);
    cssLink.setAttribute('rel', 'stylesheet');
    cssLink.setAttribute('href', cssFileSrc);
    cssLink.onload = _ => {
      const oudated = lock !== this.themeChangeLock;
      if (loadCallback) { loadCallback(oudated); }
      if (!oudated && fade) {
        document.body.style.transition = null;
        setTimeout(() => {
          if (lock !== this.themeChangeLock) { return; }
          document.body.style.opacity = '1';
        }, 10);
      }
    };
    getThemeSectionDiv();
    setTimeout(() => {
      if (lock !== this.themeChangeLock) { return; }
      if (themeSectionDiv) {
        document.head.insertBefore(cssLink, themeSectionDiv);
      } else {
        document.head.appendChild(cssLink);
      }
    }, 10);
    const oldThemeBase = this.currentThemeBase;
    const oldThemeType = this.currentThemeType;
    const oldThemeDark = this.isDark;
    this.currentThemeBase = themeBase;
    this.currentThemeType = themeType;
    this.isDark = theme.dark ? true : false;
    document.body.setAttribute('theme', `${themeBase}-${themeType}`);
    document.body.setAttribute('theme-family', this.isDark ? 'dark' : 'light');
    const html = document.getElementsByTagName('html')[0];
    html.style.background = theme.bg ? theme.bg : null;
    this.loadExtensionThemes();
    this.persistThemeOnLocalStorage();
  }
  loadExtensionThemes() {
    const prism = document.getElementById('GANY_IMPORT_PRISM_JS_STYLE');
    if (prism) {
      prism.setAttribute('href', this.isDark ? `${cssPath}/prism.dark.css` : `${cssPath}/prism.css`);
    }
  }
  handleEntrypoint() {
    this.loadThemeFromLocalStorage(true);
  }
  persistThemeOnLocalStorage() {
    localStorage.setItem('ganymede-ui-theme', `${this.currentThemeBase}-${this.currentThemeType}`);
  }
  loadThemeFromLocalStorage(fade?: boolean, loadCallback?: (...args) => any) {
    const themeData = localStorage.getItem('ganymede-ui-theme');
    if (!themeData) {
      this.set(ganymedeAppData.theme.base, ganymedeAppData.theme.type as ThemeTypes, fade, loadCallback);
      return false;
    } else {
      this.set(themeData.split('-')[0], themeData.split('-')[1] as ThemeTypes, fade, loadCallback);
      return true;
    }
  }
}

function getThemeSectionDiv() {
  if (themeSectionDiv) { return themeSectionDiv; }
  themeSectionDiv = document.getElementById('head-theme-section');
  return themeSectionDiv;
}

export const Theme = new ThemeController();

export const themeClrDefaultChoices =  {
  'CLARITY-DEFAULT': 'Default',
  'CLARITY-LIGHT': 'Light',
  'CLARITY-DARK': 'Dark',
  'CLARITY-BLACK': 'Midnight',
};
