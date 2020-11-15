/*
 * Copyright 2018-2019 Jovian, all rights reserved.
 */

import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent,
        HttpInterceptor, HttpResponse } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {


    return next.handle(request).pipe(

      catchError((error) => {
        return throwError(error);
      }),

      map((e: HttpResponse<any>) => {
        return e;
      })

    );
  }

}
