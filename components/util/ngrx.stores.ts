/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { HttpClient } from '@angular/common/http';
import { Store, createAction, createReducer, ActionCreator, on } from '@ngrx/store';
import { Action, ActionReducer, TypedAction } from '@ngrx/store/src/models';
import { Class, PartialAny, PartialCustom } from '@jovian/type-tools';
import { from, Observable, of, Subscription } from 'rxjs';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, mergeMap } from 'rxjs/operators';

export interface RxComm {
  http: HttpClient;
}

export class NgrxStoreRoot {
  static delimiter = '.';
  static recordAllActions = false;
  static showActions = true;
  static showActionErrors = true;
  static traceActionSource = true;
  static mainStateProxy = null;
  static actions$: Actions;
  static actionsQueue: RxAction<any>[] = [];
  static allActions: {
    [key: string]: {
      key: string;
      ns: string;
      dataName: string;
      action: string;
      actionType: string;
      actionObject: ActionCreator<any, (params: RxInvokeParams) => TypedAction<any>>;
      source?: Class<any>;
      sourceTrace?: Error;
    }
  } = {};
  static comm: RxComm = {
    http: null,
  };
  static allData: {[dataPath: string]: any} = {};
  static allDataDetils: {[dataPath: string]: RxData} = {};
  static allEffectsList: Observable<any>[] = [];
  static allEffectsClassList: Class<any>[] = [];
  static actionsHistory: {action: Action, t: number}[] = [];
  static actionErrorsHistory: {action: RxAction<any>, error: Error, t: number}[] = [];
  static getStores(additional?: {[storeName: string]: any}) {
    if (additional) {
      Object.assign(NgrxStoreRoot.allData, additional);
    }
    return NgrxStoreRoot.allData;
  }
  static getEffectClasses(additional?: Class<any>[]) {
    if (additional) {
      for (const cls of additional) {
        NgrxStoreRoot.allEffectsClassList.push(cls);
      }
    }
    return NgrxStoreRoot.allEffectsClassList;
  }
  static registerData<T = any>(dataName: string, reducer: (state: T, action: any) => T) {
    NgrxStoreRoot.allData[dataName] = reducer;
  }
  static registerEffect(effect: Observable<any>) {
    NgrxStoreRoot.allEffectsList.push(effect);
  }
  static registerEffectClass(effectClass: Class<any>) {
    NgrxStoreRoot.allEffectsClassList.push(effectClass);
  }
  static initialize(store: Store<any>, actions$: Actions, comm: Partial<RxComm>) {
    RxStoreEntry.setMainStore(store);
    NgrxStoreRoot.actions$ = actions$;
    // tslint:disable-next-line: deprecation
    NgrxStoreRoot.actions$.subscribe(action => {
      // tslint:disable-next-line: no-console
      if (NgrxStoreRoot.showActions) { console.log(action); }
      NgrxStoreRoot.actionsHistory.push({action, t: Date.now()});
    });
    Object.assign(NgrxStoreRoot.comm, comm);
    for (const action of NgrxStoreRoot.actionsQueue) {
      if (!action.effect$) { action.registerEffect(); }
    }
  }
  // deprecated
  // static getStateProxy() {
  //   if (!NgrxStoreRoot.mainStateProxy) {
  //     NgrxStoreRoot.mainStateProxy = new Proxy({}, {
  //       get(_, p) {
  //         if (typeof p === 'string') {
  //           const entry = RxStoreEntry.registry[p];
  //           if (!entry) { return null; }
  //           if (entry.data.__proxy) {
  //             return entry.data.__proxy;
  //           }
  //           return entry.data;
  //         }
  //         return null;
  //       },
  //     });
  //   }
  //   return NgrxStoreRoot.mainStateProxy;
  // }
  static getCentralStore() {
    return RxStoreEntry.dataRegistry;
  }
  static listAllRegisteredData() {
    return Object.keys(NgrxStoreRoot.allData);
  }
  static listAllRegisteredActions() {
    return Object.keys(NgrxStoreRoot.allActions);
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

export interface RxDataOptions {
  sync?: {
    interval?: number;
  };
}

export class RxData<T = any> {
  firstValue: T;
  actions: {
    [actionName: string]: RxAction<T>;
    SET?: RxAction<T>;
  };
  info?: any;
  options?: RxDataOptions;
  instance?: RxDefMember<T>;
  constructor(init: Partial<RxData<T>>) { Object.assign(this, init); }
  get data$() { return this.instance.data$; }
  getLink() { return this.instance.data$; }
  sub(component: any, callback: (data: T) => any) {
    return this.instance.sub(component, callback);
  }
}

export interface RxActionOptions {
  timeout?: number;
}

export class RxActionSync<T> {
  info = 'RxActionSync';
  logic: any;
  reducer: ((state: T, params?: RxInvokeParams, comm?: RxComm) => (T | Promise<T>));
  setter?: RxActionSync<T>;
  actionName: string;
  actionType: string;
  actionError?: string;
  instance?: RxDefMember<T>;
  options?: RxActionOptions;
  trace?: Error;
  constructor(options: RxActionOptions, logic: (state: T, params?: RxInvokeParams, comm?: RxComm) => T) {
    if (!options) { options = {}; }
    this.options = options;
    this.reducer = logic;
  }
  dispatch(params?: RxInvokeParams) {
    if (NgrxStoreRoot.traceActionSource) { this.trace = new Error(''); }
    if (!this.actionName || !this.instance) { return null; }
    return this.instance.dispatch(this.actionName, params);
  }
  registerEffect() {}
}

export class RxAction<T> {
  reducer: any;
  logic: (state: T, params?: RxInvokeParams, comm?: RxComm) => Promise<T>;
  info = 'RxAction';
  actionName?: string;
  actionType?: string;
  actionError?: string;
  setter?: RxActionSync<T>;
  params?: RxInvokeParams;
  effect$?: Observable<any>;
  instance?: RxDefMember<T>;
  options?: RxActionOptions;
  trace?: Error;
  constructor(options: RxActionOptions, logic: (state: T, params?: RxInvokeParams, comm?: RxComm) => Promise<T>) {
    if (!options) { options = {}; }
    this.options = options;
    this.logic = logic;
  }
  dispatch(params?: RxInvokeParams) {
    if (NgrxStoreRoot.traceActionSource) { this.trace = new Error(''); }
    if (!this.actionName || !this.instance) { return null; }
    this.params = params;
    return this.instance.dispatch(this.actionName, params, this);
  }
  registerEffect() {
    if (this.effect$) { return; }
    if (NgrxStoreRoot.actions$) {
      const effectsPipe = NgrxStoreRoot.actions$.pipe(
        ofType(this.actionType),
        mergeMap(() => {
          const logicPromise = this.logic(
            this.instance.currentValue,
            this.params,
            NgrxStoreRoot.comm
          );
          return from(logicPromise).pipe(
            map(result => {
              this.setter.dispatch({ value: result });
              return { type: this.actionType, payload: result };
            }),
            catchError((e) => {
              // tslint:disable-next-line: no-console
              if (NgrxStoreRoot.showActionErrors) {
                // tslint:disable-next-line: no-console
                console.error(
                  e,
                  '\nAction dispatched from: ', this.trace,
                  '\nAction object: ', this);
              }
              NgrxStoreRoot.actionErrorsHistory.push({action: this, error: e, t: Date.now()});
              return of({ type: this.actionError });
            })
          );
        })
      );
      this.effect$ = createEffect(() => effectsPipe);
      // tslint:disable-next-line: deprecation
      this.effect$.subscribe(_ => {});
    } else {
      NgrxStoreRoot.actionsQueue.push(this);
    }
  }
}

export type AnyStore = any;

export class RxDefMember<T> {
  data$: Observable<T>;
  parent: RxStoreEntry<any>;
  currentValue: T;
  firstValue: T;
  storeKey: string;
  namespace: string;
  dataName: string;
  actions: { [actionName: string]: string; };
  reducer: ActionReducer<string[], Action>;

  constructor(init?: Partial<RxDefMember<T>>) { if (init) { Object.assign(this, init); } }

  async dispatch(actionName: string, params: RxInvokeParams, actionSource: RxAction<any> = null) {
    return new Promise<boolean>(async resolve => {
      if (!this.parent || !this.parent.store) {
        return resolve(null);
      }
      if (actionSource) {
        this.parent.store.dispatch({ value: this.currentValue, type: actionSource.actionType });
        return resolve(true);
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
  setStore(store: Store<any>) {
    if (!this.data$) {
      this.data$ =  store.select(this.storeKey);
      // tslint:disable-next-line: deprecation
      this.data$.subscribe(value => { this.currentValue = value; });
    }
  }
}

export class RxStoreEntry<T extends PartialAny<RxDataCollection>> {
  static registry: {[namespace: string]: RxStoreEntry<any>} = {};
  static dataRegistry: {[namespace: string]: PartialAny<RxDataCollection>} = {};
  static setMainStore(store: Store<any>) {
    for (const ns of Object.keys(RxStoreEntry.registry)) {
      const entry = RxStoreEntry.registry[ns];
      entry.linkStore(store);
    }
  }
  store: Store<any> = null;
  source: Class<T> = null;
  namespace: string;
  members: PartialCustom<any, RxDefMember<any>> = {};
  data: T;
  constructor(namespace: string, collectionType: Class<T>) {
    this.namespace = namespace;
    this.source = collectionType;
    this.data = new collectionType();
    // Object.defineProperty(this.data, '__proxy', {
    //   value: new Proxy({}, {
    //     get: (t, p) => {
    //       if (typeof p === 'string') {
    //         const d: RxData = this.data[p];
    //         if (!d) { return null; }
    //         if (d.data$) {
    //           return d.data$;
    //         } else {
    //           return null;
    //         }
    //       }
    //       return null;
    //     },
    // })});
    (collectionType as any).rx = this;
    RxStoreEntry.registry[namespace] = this;
    RxStoreEntry.dataRegistry[namespace] = this.data;
    const flattened = flattenUntil(this.data, RxData);
    for (const memberName of Object.keys(flattened)) {
      const memberDef = flattened[memberName] as RxData;
      const reducersOnly = {};
      const invocables: RxAction<any>[] = [];
      const setter = memberDef.actions.SET = new RxActionSync(null, (_, param) => param.value);
      for (const actionName of Object.keys(memberDef.actions)) {
        const invocable = memberDef.actions[actionName];
        invocable.actionName = actionName;
        const { type, error } = getActionType(namespace, memberName, collectionType, actionName);
        invocable.actionType = type;
        invocable.actionError = error;
        invocable.setter = setter;
        if (invocable.reducer) {
          reducersOnly[actionName] = invocable.reducer;
        } else {
          invocable.registerEffect();
        }
        invocables.push(invocable);
      }
      const member = this.addMember(memberName, memberDef.firstValue, reducersOnly);
      member.currentValue = memberDef.firstValue;
      memberDef.instance = member;
      for (const invocable of invocables) { invocable.instance = member; }
      NgrxStoreRoot.registerData(member.storeKey, member.reducer);
      NgrxStoreRoot.allDataDetils[member.storeKey] = memberDef;
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
        if (!member.data$) { member.setStore(this.store); }
      }
    }
    return this;
  }
}

export function getAction(key: string) {
  return NgrxStoreRoot.allActions[key];
}

export function getActionType(ns: string, dataName: string, source: Class<any>, action: string) {
  const storeKey = `${ns}${NgrxStoreRoot.delimiter}${dataName}`;
  const key = `${storeKey}${NgrxStoreRoot.delimiter}${action}`;
  const actionDetails = `[${source.name}] ${action} on ${storeKey}`;
  const actionError = `[${source.name}] Error during ${action} on ${storeKey}`;
  return { type: actionDetails, error: actionError };
}

export function registerAction(ns: string, dataName: string, source: Class<any>, action: string) {
  const storeKey = `${ns}${NgrxStoreRoot.delimiter}${dataName}`;
  const key = `${storeKey}${NgrxStoreRoot.delimiter}${action}`;
  if (!NgrxStoreRoot.allActions[key]) {
    const { type, error } = getActionType(ns, dataName, source, action);
    NgrxStoreRoot.allActions[key] = {
      key, ns, dataName, action, actionType: type, source,
      actionObject: createAction(type, (res: any) => res)
    };
  }
  return key;
}

export function rxDataDef<T>(ns: string, dataName: string, initialValue: T,
                             source: Class<any>, actions: { [actionaName: string]: (state: T, params: RxInvokeParams) => T; }) {
  const storeKey = `${ns}${NgrxStoreRoot.delimiter}${dataName}`;
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

export function rxSet<T = any>(obj: object, key: string, value: T) {
  const a = Object.assign({}, obj);
  a[key] = value;
  return a;
}

export function rxUnset<T = any>(obj: object, key: string) {
  const a = Object.assign({}, obj);
  if (a[key] !== undefined) {
    delete a[key];
  }
  return a;
}

export function rxPush<T = any>(arr: Array<T>, value: T) {
  return [...arr, value];
}

export function rxPushFront<T = any>(arr: Array<T>, value: T) {
  return [value, ...arr];
}

function flattenUntil(obj: object, type?: Class<any>, prefix: string = '', res: object = {}) {
  return Object.entries(obj).reduce((r, [key, val]) => {
    const k = `${prefix}${key}`;
    if (typeof val === 'object' && (type && !(val instanceof type))) {
      flattenUntil(val, type, `${k}.`, r);
    } else {
      res[k] = val;
    }
    return r;
  }, res);
}
