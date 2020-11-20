import { Route, UrlMatchResult, UrlSegment, UrlSegmentGroup } from '@angular/router';

export function consumeSubDir(path: string) {
  const pathSplit = path.split('/');
  const matcher = (segments: UrlSegment[], group: UrlSegmentGroup, route: Route) => {
    for (let i = 0; i < pathSplit.length; ++i) {
      if (pathSplit[i] !== segments[i].path) {
        return null;
      }
    }
    return { consumed: segments }  as UrlMatchResult;
  };
  return matcher;
}

export interface RouteDataTemplate {
  layout?: string;
  scrollbar?: 'show' | 'hide';
}

export interface RouteDataNavigatableContent {
  name: string;
  path?: string;
  link?: string;
  type?: string;
  md?: string;
  root?: string;
  leftNavType?: string;
  children?: RouteDataNavigatableContent[];
}

export interface RouteDataPage {
  name?: string;
  path?: string;
  link?: string;
  type?: string;
  root?: string;
  mountpath?: string;
  nolang?: boolean;
  children?: RouteDataNavigatableContent[];
}

export interface RouteData {
  templateData: RouteDataTemplate;
  pageData: RouteDataPage;
}
