/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Store, createAction, createReducer, ActionCreator, on } from '@ngrx/store';
import { Action, ActionReducer, TypedAction } from '@ngrx/store/src/models';
import { Class, PartialAny, PartialCustom } from '@jovian/type-tools';
import { Observable, Subscription } from 'rxjs';


export class NgrxStoreRoot {
  static enforceSourceStackTrace = false;
  static mainStoreProxy = null;
  static allActions: {
    [key: string]: {
      key: string;
      ns: string;
      dataName: string;
      action: string;
      actionObject: ActionCreator<any, (params: RxInvokeParams) => TypedAction<any>>;
      source?: Class<any>;
      sourceTrace?: Error;
    }
  } = {};
  static allStores: {[storeName: string]: any} = {};
  static getForRoot(additional?: any) {
    if (additional) {
      Object.assign(NgrxStoreRoot.allStores, additional);
    }
    return NgrxStoreRoot.allStores;
  }
  static register<T = any>(dataName: string, reducer: (state: T, action: any) => T) {
    NgrxStoreRoot.allStores[dataName] = reducer;
  }
  static setMainStore(store: Store<any>) {
    RxStoreEntry.setMainStore(store);
  }
  static getMainStoreProxy() {
    if (!NgrxStoreRoot.mainStoreProxy) {
      NgrxStoreRoot.mainStoreProxy = new Proxy({}, {
        get(_, p) {
          if (typeof p === 'string') {
            const entry = RxStoreEntry.registry[p];
            if (!entry) { return null; }
            if (entry.data.__proxy) {
              return entry.data.__proxy;
            }
            return entry.data;
          }
          return null;
        },
      });
    }
    return NgrxStoreRoot.mainStoreProxy;
  }
}

/**
 * Key-value object containing parameters to the invocation.
 */
export interface RxInvokeParams {
  [key: string]: any;
}

export interface RxDataCollection {
  [dataName: string]: RxData<any>;
}

export class RxData<T = any> {
  firstValue: T = null;
  actions: { [actionName: string]: RxAction<T>; };
  instance?: RxDefMember<T>;
  constructor(init: Partial<RxData<T>>) { Object.assign(this, init); }
  get data$() { return this.instance.data$; }
  getLink() { return this.instance.data$; }
  sub(component: any, callback: (data: T) => any) {
    return this.instance.sub(component, callback);
  }
}

export class RxAction<T> {
  actionName: string;
  instance: RxDefMember<T>;
  constructor(public reducer: (state: T, params?: RxInvokeParams) =>  T) {}
  invoke(params?: RxInvokeParams) {
    if (!this.actionName || !this.instance) {
      // TODO
      return null;
    }
    return this.instance.invoke(this.actionName, params);
  }
}

export type AnyStore = any;

export class RxDefMember<T> {
  data$: Observable<T>;
  parent: RxStoreEntry<any>;
  firstValue: T;
  storeKey: string;
  namespace: string;
  dataName: string;
  actions: { [actionName: string]: string; };
  reducer: ActionReducer<string[], Action>;
  
  constructor(init?: Partial<RxDefMember<T>>) { if (init) { Object.assign(this, init); } }
  
  async invoke(actionName: string, params?: RxInvokeParams) {
    return new Promise<boolean>(async resolve => {
      if (!this.parent || !this.parent.store) {
        return resolve(null);
      }
      const actionKey = this.actions[actionName];
      if (!actionKey) { return resolve(null); }
      const actionObj = getAction(actionKey);
      if (!actionObj) { return resolve(null); }
      this.parent.store.dispatch(actionObj.actionObject(params));
      resolve(true);
    });
  }
  sub(component: any, callback: (data: T) => any) {
    if (!this.data$) {
      // TODO
      return;
    }
    // tslint:disable-next-line: deprecation
    const sub = this.data$.subscribe(callback);
    if (!component) {
      // TODO
    } else {
      if (!component.__rx_subs) { component.__rx_subs = []; }
      component.__rx_subs.push(sub);
    }
    return sub;
  }
  unsub(sub: Subscription) {
    if (sub && sub.unsubscribe) { sub.unsubscribe(); }
  }
}

export class RxStoreEntry<T extends PartialAny<RxDataCollection>> {
  static registry: {[namespace: string]: RxStoreEntry<any>} = {};
  static setMainStore(store: Store<any>) {
    for (const ns of Object.keys(RxStoreEntry.registry)) {
      const entry = RxStoreEntry.registry[ns];
      entry.linkStore(store);
    }
  }
  static getMainStoreProxy
  store: Store<any> = null;
  source: Class<T> = null;
  namespace: string;
  members: PartialCustom<any, RxDefMember<any>> = {};
  data: T;
  constructor(namespace: string, collectionType: Class<T>) {
    this.namespace = namespace;
    this.source = collectionType;
    this.data = new collectionType();
    Object.defineProperty(this.data, '__proxy', {
      value: new Proxy({}, {
        get: (t, p) => {
          if (typeof p === 'string') {
            const d: RxData = this.data[p];
            if (!d) { return null; }
            if (d.data$) {
              return d.data$;  
            } else {
              return null;
            }
          }
          return null;
        },
    })});
    (collectionType as any).rx = this;
    RxStoreEntry.registry[namespace] = this;
    for (const memberName of Object.keys(this.data)) {
      const memberDef = this.data[memberName] as RxData;
      const reducersOnly = {};
      const invocables: RxAction<any>[] = [];
      for (const actionName of Object.keys(memberDef.actions)) {
        const invocable = memberDef.actions[actionName];
        invocable.actionName = actionName;
        reducersOnly[actionName] = invocable.reducer;
        invocables.push(invocable);
      }
      const member = this.addMember(memberName, memberDef.firstValue, reducersOnly);
      memberDef.instance = member;
      for (const invocable of invocables) { invocable.instance = member; }
      NgrxStoreRoot.register(member.storeKey, member.reducer);
    }
  }
  member<S = any>(name: string) { return this.members[name] as RxDefMember<S>; }
  addMember<S>(name: string, initValue: S, actions: { [actionaName: string]: (state: S, params: any) => S; }) {
    const member = this.members[name] = rxDataDef(this.namespace, name, initValue, this.source, actions);
    member.firstValue = initValue;
    member.parent = this;
    return member;
  }
  linkStore(store: Store<any>) {
    if (this.store !== store) {
      this.store = store;
      for (const memberName of Object.keys(this.members)) {
        const member = this.members[memberName];
        if (!member.data$) {
          member.data$ = this.store.select(member.storeKey);
        }
      }
    }
    return this;
  }
}

export function getAction(key: string) {
  return NgrxStoreRoot.allActions[key];
}

export function registerAction(ns: string, dataName: string, source: Class<any>, action: string) {
  const key = ns + '::' + dataName + '::' + action;
  if (!NgrxStoreRoot.allActions[key]) {
    let actionDetails: string;
    let e = NgrxStoreRoot.enforceSourceStackTrace ? new Error(`Stack trace for source of ${key}`) : null;
    if (source) {
      actionDetails = `[${source.name}] ${action} on ${dataName}`;
    } else {
      if (!e) { e = new Error(`Stack trace for source of ${key}`); }
      actionDetails = `[Unknown Source] ${action} on ${dataName}`;
    }
    NgrxStoreRoot.allActions[key] = {
      key, ns, dataName, action,
      source, sourceTrace: e,
      actionObject: createAction(actionDetails, (res: any) => { return res; })
    };
  }
  return key;
}

export function rxDataDef<T>(ns: string, dataName: string, initialValue: T,
                             source: Class<any>, actions: { [actionaName: string]: (state: T, params: RxInvokeParams) => T; }) {
  const storeKey = `${ns}::${dataName}`;
  const def = new RxDefMember({ storeKey, namespace: ns, dataName, actions: {}, reducer: null });
  const reducerArgs: any[] = [initialValue];
  for (const actionName of Object.keys(actions)) {
    const actionLogic = actions[actionName] as any;
    const actionKey = registerAction(ns, dataName, source, actionName);
    const actionObj = getAction(actionKey);
    reducerArgs.push(on(actionObj.actionObject, actionLogic));
    def.actions[actionName] = actionKey;
  }
  def.reducer = createReducer.apply(null, reducerArgs);
  return def;
}
