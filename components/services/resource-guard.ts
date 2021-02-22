/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AppService } from './app.service';

@Injectable({
  providedIn: 'root'
})
export class ResourceGuard implements CanActivate {

  static routeStatic: boolean = false;
  static routeValid: boolean = false;
  static routeNeedsResolution: boolean = false;
  static routeResolver: (path: string) => Promise<any> = null;
  static authorized: boolean = false;

  constructor(
    private app: AppService,
    private router: Router
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {
    return new Promise<boolean>(async resolve => {
      ResourceGuard.routeValid = false;
      ResourceGuard.authorized = false;
      if (ResourceGuard.routeNeedsResolution) {
        const joinedPath = route.url.map(a => a.path).join('/');
        const result = await ResourceGuard.routeResolver(joinedPath);
        if (!result) {
          return resolve(true);
        }
      } else {
        ResourceGuard.routeValid = true;
        ResourceGuard.authorized = true;
        this.app.httpNotFound = false;
        this.app.httpForbidden = false;
        return resolve(true);
      }
    });
  }
}
