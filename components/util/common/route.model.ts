/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { ActivatedRoute, RouterEvent, UrlMatchResult, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';

type ParamsType = {[name:string]: string};
type DataMapType = {[name:string]: any};

export const baseRouteData = {};

export const currentRoute = {
  routeData: null as RouteData,
  routeChildData: null as RouteDataNavigatableContent,
  activatedRoute: null as ActivatedRoute,
  uriData: {
    params: {} as ParamsType,
    queryParams: {} as ParamsType,
    fragment: null as string,
    data: {} as DataMapType,
  },
  validatedUri: {
    validatonCache: {},
    queryParams: {},
    params: {},
    fragment: null,
    data: {},
  } as ValidatedUriData,
};

export interface RouteDataTemplate {
  layout?: string;
  scrollbar?: 'show' | 'hide';
}

const RouteContentLocalId = { index: 0 }
export function setRouteContentId(item: RouteDataNavigatableContent) {
  if (!item || item._route_id) { return; }
  ++RouteContentLocalId.index;
  item._route_id = `r-${RouteContentLocalId.index}`;
  // Object.defineProperty(item, '_route_id', { value: RouteContentLocalId.index + '' });
}

export const routeComponentExceptionMap: {[domain: string]: {[link: string]: RouteDataNavigatableContent}} = {};

export function initRouteContentNode(args: {
  domain: string,
  item: RouteDataNavigatableContent,
  parent: RouteDataNavigatableContent,
  advancedRouteUriHandler: BasicRouteAdvancedRouteHandling,
  settings: {
    basepath: string,
  },
}) {
  const { domain, item, parent, settings } = args;
  setRouteContentId(item);
  const getParentGetter = (p: RouteDataNavigatableContent) => { return () => p } ;
  item.link = parent?.link ? parent.link + '/' + item.path : settings.basepath;
  item.linkLocal = parent ? 
                      parent.linkLocal === '' ? item.path : 
                        parent.linkLocal + '/' + item.path
                      : '';
  if (!item.uriBehavior && args.advancedRouteUriHandler) {
    item.uriBehavior = args.advancedRouteUriHandler;
  }
  item.getParent = getParentGetter(parent);
  if (item.component) { 
    if (!routeComponentExceptionMap[domain]) { routeComponentExceptionMap[domain] = {}; }
    routeComponentExceptionMap[domain][item.link] = item;
  }
  if (args.item.children) {
    for (const child of args.item.children) {
      initRouteContentNode({
        domain,
        item: child,
        parent: item,
        advancedRouteUriHandler: item.uriBehavior?.childRoute?.[child.path],
        settings: { basepath: settings.basepath },
      })
    }
  }
}

export interface RouteDataNavigatableContent {
  _route_id?: string;
  name?: string;
  path?: string;
  link?: string;
  linkLocal?: string;
  type?: string;
  md?: string;
  root?: string;
  leftNavType?: string;
  hasContent?: boolean;
  children?: RouteDataNavigatableContent[];
  component?: any;
  canActivate?: any;
  layout?: any;
  data?: any;
  uriBehavior?: BasicRouteAdvancedRouteHandling;
  getParent?: () => RouteDataNavigatableContent;
}

export interface RouteDataPage extends RouteDataNavigatableContent {
  mountpath?: string;
  nolang?: boolean;
  treeView?: TreeViewAsyncData;
}

export interface RouteMatchableDefinition {
  path?: string;
  matcher?: (segments: UrlSegment[]) => UrlMatchResult;
  exceptions?: {[path: string]: any};
  component: any;
  canActivate: any[];
  data: RouteData;
  basePath: string;
}

export interface RouteData<T = any> {
  templateData: RouteDataTemplate;
  pageData: RouteDataPage;
  pageParams?: T;
  reuse?: boolean;
  pathOverwrite?: ({from: string, to: string} | ((path: string, e?: RouterEvent) => (string | void)))[];
  staticOnly?: boolean;
  dynamicRoutes?: { pattern: string; resolver: string | ((path: string) => Promise<any>); }[];
  sourceDataPath?: string;
}

export interface TreeViewAsyncData<T = any> {
  root$?: Observable<TreeViewAsyncData<T>[]>;
  absolutePath?: string;
  text?: string;
  icon?: string;
  expandable?: boolean;
  expanded?: boolean;
  resolverType?: string | 'lazy' | 'precompiled-json';
  getChildren?: (node: TreeViewAsyncData<T>) => Observable<TreeViewAsyncData<T>[]>;
}

export interface UriBehaviorRule {
  src: {
    type: 'absolute' | 'local';
    path: string;
  }
  allowQueryParams?: string[];
  allowAnchors?: string[];
}

export interface BasicRouteAdvancedRouteHandling {
  queryParamsHandling?: '' | 'preserve' | 'merge';
  queryParams?: UriBehaviorRule[];
  anchors?: UriBehaviorRule[];
  childRoute?: { [childPath: string]: BasicRouteAdvancedRouteHandling; };
}

export interface BasicRouteAdvancedSettings {
  uriBehavior?: BasicRouteAdvancedRouteHandling;
}

export interface ValidatedUriData {
  validatonCache?: {
    [routeContentId: string]: {
      sourceRoute?: ActivatedRoute,
      sourceRouteData?: RouteDataNavigatableContent,
      item?: RouteDataNavigatableContent,  
      inputs: {
        queryParams?: ParamsType;
        params?: ParamsType,
        fragment?: string,
        data?: DataMapType,
      };
    }
  }
  queryParams?: ParamsType;
  params?: ParamsType,
  fragment?: string,
  data?: DataMapType,
}

export function getValidationCache(item: RouteDataNavigatableContent) {
  let validationCache = currentRoute.validatedUri.validatonCache[item._route_id];
  if (validationCache) { return validationCache; }
  return currentRoute.validatedUri.validatonCache[item._route_id] = { inputs: {} };
}

export function validateBasedOnUriBehavior(item: RouteDataNavigatableContent) {
  setRouteContentId(item);
  const sourceRoute = currentRoute.activatedRoute;
  const validationCache = getValidationCache(item);
  if (validationCache.sourceRoute === sourceRoute &&
      validationCache.item === item &&
      validationCache.sourceRouteData === currentRoute.routeChildData
  ) {
    return;
  } else {
    validationCache.item = item;
    validationCache.sourceRoute = sourceRoute;
    validationCache.sourceRouteData = currentRoute.routeChildData;
    validationCache.inputs = {
      queryParams: {},

    };
  }
  // console.log(currentRoute);
  // console.log(item, item.uriBehavior, validationCache.sourceRouteData, validationCache.sourceRouteData.uriBehavior);
  // console.log(item, sourceRoute);
  const uriData: ValidatedUriData = JSON.parse(JSON.stringify(currentRoute.uriData));
  const routeChain: RouteDataNavigatableContent[] = [];
  let node = item;
  while(node) {
    routeChain.push(node);
    node = node.getParent?.();
  }
  for (const node of routeChain) {
    if (!node.uriBehavior) { continue; }
    if (node.uriBehavior.queryParams?.length > 0) {
      for (const rule of node.uriBehavior.queryParams) {
        if (rule.src.type === 'local') {
          let applicable = false;
          if (rule.src.path === '*') {
            // console.log(`applicable rule: *`)
            applicable = true;
          } else if (rule.src.path.endsWith('*')) {
            const matchPattern = rule.src.path.split('*')[0];
            // console.log(validationCache.sourceRouteData.linkLocal);
            if (validationCache.sourceRouteData.linkLocal?.startsWith(matchPattern)) {
              // console.log(`applicable rule: ${rule.src.path}`)
              applicable = true;
            }
          } else if (rule.src.path === validationCache.sourceRouteData.linkLocal) {
            // console.log(`applicable rule: ${rule.src.path}`)
            applicable = true;
          }
          if (!applicable) { continue; }
          for (const paramName of Object.keys(uriData.queryParams)) {
            if (rule.allowQueryParams && rule.allowQueryParams.indexOf(paramName) === -1) {
              delete uriData.queryParams[paramName];
            }
          }
          Object.assign(currentRoute.validatedUri, uriData);
          return;
        }
      }
    }
  }
  Object.assign(currentRoute.validatedUri, uriData);
  return;
}

const defaultEmptyQueryParam: ParamsType = {};

export const linker = {
  endHere: (e) => {
    if (!e) { e = window?.event; }
    if (e?.stopPropagation) { e.stopPropagation(); }
  },
  prepareNavigate: (item: RouteDataNavigatableContent, settings?: { continuePropagation?: boolean }) => {
    if (!item) { return; }
    const e = window?.event; if (e?.stopPropagation && settings?.continuePropagation) { e.stopPropagation(); }
    validateBasedOnUriBehavior(item);
  },
  validate: (item: RouteDataNavigatableContent, settings?: { continuePropagation?: boolean }) => {
    if (!item) { return; }
    const e = window?.event; if (e?.stopPropagation && settings?.continuePropagation) { e.stopPropagation(); }
    validateBasedOnUriBehavior(item);
  },
  routerLink: (item: RouteDataNavigatableContent) => {
    return [item.link.startsWith('/') ? item.link : '/' + item.link];
  },
  queryParams: (item: RouteDataNavigatableContent, queryParams: ParamsType = currentRoute.validatedUri.queryParams) => {
    const validationCache = getValidationCache(item);
    if (validationCache.inputs.queryParams === queryParams) {
      return currentRoute.validatedUri.queryParams;
    }
    const currentRouteQueryParams = currentRoute.validatedUri.queryParams;
    for (const paramName of Object.keys(currentRouteQueryParams)) {
      if (queryParams.hasOwnProperty(paramName)) {
        currentRouteQueryParams[paramName] = queryParams[paramName];
      }
    }
    validationCache.inputs.queryParams = queryParams;
    return currentRoute.validatedUri.queryParams;
  }
};
