/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Subject } from 'rxjs';

export class DataFetcher<T = any, S = any> extends Subject<void> {
  arg: T;
  data: S;
  dataReady: boolean = false;
  dataPromise: Promise<S> | S;
  noData: boolean;
  locker: {};
  fetchStartTime: number;
  fetchEndTime: number;
  fetch: (arg: T, resolver?: DataFetcher<T, S>) => Promise<S> | S;
  constructor(init?:Partial<DataFetcher<T, S>>) {
    super();
    if (init) { Object.assign(this, init); }
  }
  asNoData(errorMessage?: string) {
    this.dataReady = true;
    this.noData = true;
  }
  asGoodData(data: S) {
    this.dataReady = true;
    this.noData = false;
    this.fetchEndTime = Date.now();  
    this.data = data;
    return data;
  }
  lazyFetch(msWithin: number = 10) {
    if (!this.fetch) { return; }
    const locker = this.locker = {};
    this.dataReady = false;
    setTimeout(() => {
      if (locker !== this.locker) { return; }
      this.fetchStartTime = Date.now();
      this.dataPromise = Promise.resolve(this.fetch(this.arg, this));
    }, msWithin);
  }
  nudge() { this.next(); }
}

