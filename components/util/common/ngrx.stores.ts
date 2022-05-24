/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import { Store, createAction, createReducer, ActionCreator, on } from '@ngrx/store';
import { Action as NgrxAction, ActionReducer, TypedAction } from '@ngrx/store/src/models';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Class, PartialCustom } from '@jovian/type-tools';
import { BehaviorSubject, from, Observable, of, Subscription } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';
import { sleepms } from '@jovian/type-tools';

export namespace rx {

  export const behavior = {
    dataType: {
      byid: {}
    }
  };

  export class NgrxStoreRoot {
    static delimiter = '.';
    static recordAllActions = false;
    static showActions = true;
    static showActionErrors = true;
    static traceActionSource = true;
    static mainStateProxy = null;
    static actions$: Actions;
    static actionsQueue: Action<any>[] = [];
    static allActions: {
      [key: string]: {
        key: string;
        ns: string;
        dataName: string;
        action: string;
        actionType: string;
        actionObject: ActionCreator<any, (params: InvokeParams) => TypedAction<any>>;
        source?: Class<any>;
        sourceTrace?: Error;
      }
    } = {};
    static comm: {[key: string]: any} = {};
    static allData: {[dataPath: string]: any} = {};
    static allDataDetils: {[dataPath: string]: Data<any> } = {};
    static allEffectsList: Observable<any>[] = [];
    static allEffectsClassList: Class<any>[] = [];
    static actionsHistory: {action: NgrxAction, t: number}[] = [];
    static actionErrorsHistory: {action: Action<any>, error: Error, t: number}[] = [];
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
    static initialize(store: Store<any>, actions$: Actions, comm?: any) {
      StoreEntry.setMainStore(store);
      NgrxStoreRoot.actions$ = actions$;
      // tslint:disable-next-line: deprecation
      NgrxStoreRoot.actions$.subscribe(action => {
        // tslint:disable-next-line: no-console
        // if (NgrxStoreRoot.showActions) { console.log(action); }
        NgrxStoreRoot.actionsHistory.push({action, t: Date.now()});
      });
      if (comm) {
        Object.assign(NgrxStoreRoot.comm, comm);
      }
      for (const action of NgrxStoreRoot.actionsQueue) {
        if (!action.effect$) { action.registerEffect(); }
      }
      return NgrxStoreRoot.getCentralStore();
    }
    static getCentralStore() {
      return StoreEntry.dataRegistry;
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
  export interface InvokeParams {
    [key: string]: any;
  }

  export interface DataOptions<T> {
    firstValue?: T;
    type?: 'default' | 'byid' | 'list' | 'view';
    locktype?: 'default' | 'keybased';
    locks?: {[key: string]: boolean};
    sync?: { interval?: number; };
    synclast?: number;
  }

  export interface DataMetaInfo {
    lastFetched?: number;
    lastUpdated?: number;
  }

  export interface MapOf<T> {
    [key: string]: T;
  };

  export function defaultMap<T>(defaultValue: T): MapOf<T> {
    return new Proxy({}, {
      get: (target, p, receiver) => {
        if(!target[p]) { target[p] = JSON.parse(JSON.stringify(defaultValue)); }
        return target[p];
      }
    }) as MapOf<T>;
  }

  export type GetterOf<T> = () => (Promise<T> | T)

  export class Data<T> {
    firstValue: T = null;
    currentValue: T = null;
    actions: {
      [actionName: string]: Action<T>;
      SET?: Action<T>;
      FETCH?: Action<T>;
    };
    fetchLast?: number = 0;
    fetchLasts?: {[key: string]: number} = {};
    lock?: Promise<void> = null;
    locks?: MapOf<Promise<void>> = {};
    meta?: MapOf<DataMetaInfo> = {};
    info?: any;
    options?: DataOptions<T>;
    instance?: RxDefMember<T>;
    constructor(init?: Partial<Data<T>>) {
      Object.assign(this, init);
      if (!init.options) { this.options = {}; }
      const opt = this.options;
      if (!opt.type) { opt.type = 'default'; }
      if (!this.firstValue && opt.firstValue) {
        this.firstValue = this.currentValue = opt.firstValue;
      }
      opt.synclast = 0;
      switch (opt.type) {
        case 'default': // singleton data
          opt.locktype = 'default';
          break;
        case 'byid': // data map (access by key)
          opt.locktype = 'keybased';
          opt.sync = opt.sync ? opt.sync : {};
          break;
      }
    }
    get v() { return this.currentValue; }
    get value() { return this.currentValue; }
    get data$() { return this.instance.data$; }
    setValue(v: T) { this.currentValue = v; }
    getLink() { return this.instance.data$; }
    sub(component: any, callback: (data: T, meta?: MapOf<DataMetaInfo>) => any) {
      return this.instance.sub(component, (data) => { callback(data, this.meta); });
    }
    keySub(component: any, keyGetter: string | GetterOf<string>, callback: (member: T[keyof T], memberMeta?: DataMetaInfo, memberKey?: string) => any) {
      return this.instance.sub(component, async (data: T) => {
        let key;
        if (typeof keyGetter === 'string') {
          key = keyGetter;
        } else {
          key = await Promise.resolve(keyGetter());
        }
        if (!data[key] || !this.meta[key]) { return; }
        callback(data[key], this.meta[key], key);
      });
    }
    unsub(component: any) { autoUnsub(component); }
    bump() { this.instance.bump(); }
  }

  export class ActionSync<T> {
    subtype = 'ActionSync';
    logic: any;
    reducer: ((state: T, params?: InvokeParams, comm?: any) => (T | Promise<T>));
    setter?: ActionSync<T>;
    actionName: string;
    actionType: string;
    actionError?: string;
    instance?: RxDefMember<T>;
    options?: ActionOptions;
    trace?: Error;
    constructor(options: ActionOptions, logic: (state: T, params?: InvokeParams, comm?: any) => T) {
      if (!options) { options = {}; }
      this.options = options;
      this.reducer = logic;
    }
    dispatch(params?: InvokeParams) {
      if (NgrxStoreRoot.traceActionSource) { this.trace = new Error(''); }
      if (!this.actionName || !this.instance) { return null; }
      return this.instance.dispatch(this.actionName, params);
    }
    registerEffect() {}
  }

  export interface DispatchArgs<T> {
    value: T;
    type: string;
    params: InvokeParams;
    trace: Error;
  }

  const actionDefaultLockMaxWait = 10000;
  const actionDefaultLockForceKill = 30000;
  const actionDefaultcacheTtl = 3000;

  export interface ActionOptions<T = any> {
    http?: { baseUrl: string };
    timeout?: number;
    lockMaxWait?: number;
    lockForceKill?: number;
    cacheTtl?: number;
    onInvoke?: (e: ActionArgs<T>) =>  any;
    onRawResponse?: (response: any, oldState: T) => any;
    onError?: (data: any, oldState: T) => any;
    onResult?: (result: T, oldState: T) => any;
  }

  export interface ActionArgs<T> {
    state: T;
    params: InvokeParams;
    comm: any;
    source: Class<any>;
    store: any;
    storeEntry: StoreEntry<any>;
    data: Data<T>;
  }

  async function resolveLocks<T = any>(data: Data<T>, keys: string | string[], options: ActionOptions<T>) {
    // if (typeof keys === 'string') { keys = [keys]; }
    // for (const key of keys) {
    //   while (data.locks[key]) { await data.locks[key]; await sleepms(100); }
    //   let resolver = { resolve: null as () => any };
    //   const lock = data.locks[key] = new Promise(resolve => resolver = () => { data.locks[key] = null; resolve(); });
    //   setTimeout(() => { if (data.locks[key] === lock) { resolver(); } }, options.lockMaxWait ? options.lockMaxWait : actionDefaultLockMaxWait);
    //   if (!data.fetchLasts[key]) { data.fetchLasts[key] = 0; }
    //   if (Date.now() - data.fetchLasts[key] < (options.cacheTtl ? options.cacheTtl : actionDefaultcacheTtl)) {
    //     options?.onResult?.(data.v, data.v); resolver();
    //     data.bump();
    //     return data.v;
    //   }
    // }
  }

  export class Action<T> {
    static common = {
      static<T = any>(staticData: T, options?: ActionOptions<T>) {
        if (!options) { options = {}; }
        return new Action<T>(options, async (e: ActionArgs<T>) => {
          options?.onInvoke?.(e);
          options?.onResult?.(staticData, staticData);
          return staticData;
        });
      },
      default<T = any>(urlTemplate: string, options?: ActionOptions<T>) {
        if (!options) { options = {}; }
        return new Action<T>(options, async (e: ActionArgs<T>) => {
          options?.onInvoke?.(e);
          const data = e.data;
          while (data.lock) { await data.lock; await sleepms(100); }
          let resolver;
          const lock = data.lock = new Promise(resolve => resolver = () => { data.lock = null; resolve(); });
          setTimeout(() => { if (data.lock === lock) { resolver(); } }, 10000);
          if (Date.now() - data.fetchLast < 3000) {
            options?.onResult?.(data.v, data.v);
            resolver();
            data.bump();
            return data.v;
          }
          let url = urlTemplate;
          const srcConf = (e.source as any).conf;
          if (url.startsWith('$BASE_URL') && srcConf && srcConf.baseUrl) { url = url.replace('$BASE_URL', srcConf.baseUrl); }
          const res = await e.comm.http.get(url).toPromise();
          const oldVal = data.v;
          e.data.fetchLast = Date.now();
          options?.onRawResponse?.(res, oldVal);
          if (!res || res.status !== 'ok') {
            options?.onError?.(res, oldVal);
            resolver();
            data.bump();
            return oldVal;
          }
          data.setValue(res.result);
          options?.onResult?.(data.v, oldVal);
          resolver();
          return res.result;
        });
      },
      propertyByKey<T = any>(urlTemplate: string, options?: ActionOptions<T>) {
        if (!options) { options = {}; }
        return new Action<T>(options, async (e: ActionArgs<T>) => {
          options?.onInvoke?.(e);
          const data = e.data;
          const key = e.params.key;
          const resolver = { resolve: null as () => any };
          // await resolveLocks(data, key, options);
          while (data.locks[key]) { await data.locks[key]; await sleepms(100); }
          const lock = data.locks[key] = new Promise(resolve => resolver.resolve = () => { data.locks[key] = null; resolve(); });
          setTimeout(() => { if (data.locks[key] === lock) { resolver.resolve(); } }, options.lockMaxWait ? options.lockMaxWait : actionDefaultLockMaxWait);
          if (!data.fetchLasts[key]) { data.fetchLasts[key] = 0; }
          if (Date.now() - data.fetchLasts[key] < (options.cacheTtl ? options.cacheTtl : actionDefaultcacheTtl)) {
            options?.onResult?.(data.v, data.v); resolver.resolve();
            data.bump();
            return data.v;
          }
          let url = urlTemplate;
          const srcConf = (e.source as any).conf;
          if (url.startsWith('$BASE_URL') && srcConf && srcConf.baseUrl) { url = url.replace('$BASE_URL', srcConf.baseUrl); }
          for (const pathParam of Object.keys(e.params)) {
            const value = e.params[pathParam];
            if (typeof value === 'string') { url = url.replace(`/:${pathParam}/`, `/${value}/`); }
          }
          const res = await e.comm.http.get(url).toPromise();
          const now = Date.now();
          data.fetchLast = now;
          data.fetchLasts[key] = now;
          if (!data.meta[key]) { data.meta[key] = {}; }
          data.meta[key].lastFetched = now;
          const oldVal = data.v;
          options?.onRawResponse?.(res, oldVal);
          if (!res || res.status !== 'ok') {
            options?.onError?.(res, oldVal);
            resolver.resolve();
            data.bump();
            return oldVal;
          }
          const newVal = setkv(data.v, key, res.result);
          data.setValue(newVal);
          options?.onResult?.(newVal, oldVal);
          resolver.resolve();
          return newVal;
        });
      }
    };
    reducer: any;
    logic: (e: {
      state: T,
      params: InvokeParams,
      comm: any,
      source: Class<any>,
      store: any,
      storeEntry: StoreEntry<any>,
      data: Data<T>;
    }) => Promise<T>;
    subtype = 'Action';
    actionName?: string;
    actionType?: string;
    actionError?: string;
    setter?: ActionSync<T>;
    params?: InvokeParams = {};
    effect$?: Observable<any>;
    options?: ActionOptions;
    trace?: Error;
    instance?: RxDefMember<T>;
    constructor(options: ActionOptions,
                logic: (e: {
                  state: T,
                  params: InvokeParams,
                  comm: any,
                  store: any,
                }) => Promise<T>) {
      if (!options) { options = {}; }
      this.options = options;
      this.logic = logic;
    }
    dispatch(params?: InvokeParams) {
      if (NgrxStoreRoot.traceActionSource) { this.trace = new Error(''); }
      if (!this.actionName || !this.instance) { return null; }
      this.params = params ? params : {};
      return this.instance.dispatch(this.actionName, params, this);
    }
    registerEffect() {
      if (this.effect$) { return; }
      if (NgrxStoreRoot.actions$) {
        const effectsPipe = NgrxStoreRoot.actions$.pipe(
          ofType(this.actionType),
          mergeMap(ngrxPayload => {
            const ns = (ngrxPayload as any).namespace;
            const store = NgrxStoreRoot.getCentralStore() as any;
            const storeKey = (ngrxPayload as any).storeKey;
            const storeEntry = StoreEntry.registry[ns];
            const dataDefinition = dotTravel(store, storeKey) as Data<T>;
            const source = storeEntry.source;
            const logicPromise = new Promise<T>((resolve, reject) => {
              try {
                this.logic({
                  state: this.instance.currentValue,
                  params: this.params,
                  comm: NgrxStoreRoot.comm,
                  source, store, storeEntry,
                  data: dataDefinition,
                }).then(res => { resolve(res); }).catch(e => { reject(e); });
              } catch (e) { return reject(e); }
            });
            return from(logicPromise).pipe(
              map(result => {
                this.setter.dispatch({ value: result });
                return { type: this.actionType, payload: result };
              }),
              catchError((e) => {
                // tslint:disable-next-line: no-console
                if (NgrxStoreRoot.showActionErrors) {
                  // tslint:disable-next-line: no-console
                  console.error(e,
                    '\nAction dispatched from: ', this.trace,
                    '\nAction object: ', this);
                }
                const now = Date.now();
                NgrxStoreRoot.actionErrorsHistory.push({ action: this, error: e, t: now });
                return of({ type: this.actionError, e, trace: this.trace, action: this, t: now });
              })
            );
          })
        );
        this.effect$ = createEffect(() => effectsPipe);
        // tslint:disable-next-line: deprecation
        this.effect$.subscribe(_ => {
          // console.log(_)
        });
      } else {
        NgrxStoreRoot.actionsQueue.push(this);
      }
    }
  }

  export type AnyStore = any;

  export class RxDefMember<T> {
    data$: Observable<T>;
    dataRubric: Data<T>;
    subject$: BehaviorSubject<T>;
    parent: StoreEntry<any>;
    currentValue: T;
    firstValue: T;
    storeKey: string;
    namespace: string;
    dataName: string;
    actions: { [actionName: string]: string; };
    reducer: ActionReducer<string[], NgrxAction>;

    constructor(init?: Partial<RxDefMember<T>>) { if (init) { Object.assign(this, init); } }

    dispatch(actionName: string, params: InvokeParams, actionSource: Action<any> = null) {
      return new Promise<boolean>(async resolve => {
        if (!this.parent || !this.parent.store) {
          return resolve(false);
        }
        if (actionSource && actionSource.subtype !== 'ActionAsync') {
          this.parent.store.dispatch({
            value: this.currentValue,
            type: actionSource.actionType,
            params,
            trace: actionSource.trace,
            namespace: this.parent.namespace,
            storeKey: this.storeKey,
          } as DispatchArgs<T>);
          return resolve(true);
        }
        const actionKey = this.actions[actionName];
        if (!actionKey) { return resolve(false); }
        const actionObj = getAction(actionKey);
        if (!actionObj) { return resolve(false); }
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
        this.subject$ = new BehaviorSubject<T>(this.currentValue);
        this.data$ = this.subject$.asObservable();
        // tslint:disable-next-line: deprecation
        store.select(this.storeKey).subscribe(value => {
          this.currentValue = value;
          this.subject$.next(this.currentValue);
        });
      }
    }
    bump() {
      if (this.subject$) { this.subject$.next(this.currentValue); }
    }
  }

  export class StoreEntry<T> {
    static registry: {[namespace: string]: StoreEntry<any>} = {};
    static dataRegistry: {[namespace: string]: any } = {};
    static setMainStore(store: Store<any>) {
      for (const ns of Object.keys(StoreEntry.registry)) {
        const entry = StoreEntry.registry[ns];
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
      (collectionType as any).rx = this;
      StoreEntry.registry[namespace] = this;
      StoreEntry.dataRegistry[namespace] = this.data;
      const flattened = flattenUntil(this.data, Data);
      for (const memberName of Object.keys(flattened)) {
        const memberDef = flattened[memberName] as Data<any>;
        const reducersOnly = {};
        const invocables: Action<any>[] = [];
        const setter = memberDef.actions.SET = new ActionSync(null, (_, param) => {
          // setter called
          return param.value;
        });
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
        member.dataRubric = memberDef;
        for (const invocable of invocables) { invocable.instance = member; }
        NgrxStoreRoot.registerData(member.storeKey, member.reducer);
        NgrxStoreRoot.allDataDetils[member.storeKey] = memberDef;
        memberDef.instance = member;
      }
    }
    member<S = any>(name: string) { return this.members[name] as RxDefMember<S>; }
    addMember<S>(name: string, initValue: S, actions: { [actionaName: string]: (state: S, params: any) => S; }) {
      const member = this.members[name] = dataDef(this.namespace, name, initValue, this.source, actions);
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

  export function dataDef<T>(ns: string, dataName: string, initialValue: T,
                             source: Class<any>, actions: { [actionaName: string]: (state: T, params: InvokeParams) => T; }) {
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

  export function invoke<T = any>(action: Action<T>, params: InvokeParams = {}) {
    return action.dispatch(params);
  }

  export function setkv<T = any>(obj: any, key: string, value: T) {
    const a = Object.assign({}, obj);
    a[key] = value;
    return a;
  }

  export function unsetkv(obj: any, key: string) {
    const a = Object.assign({}, obj);
    if (a[key] !== undefined) {
      delete a[key];
    }
    return a;
  }

  export function push<T = any>(arr: Array<T>, value: T) {
    return [...arr, value];
  }

  export function pushFront<T = any>(arr: Array<T>, value: T) {
    return [value, ...arr];
  }

  function flattenUntil(obj: any, type?: Class<any>, prefix: string = '', res: object = {}) {
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

  function dotTravel(obj: any, dotKeys: string) {
    let node = obj;
    const keys = dotKeys.split('.');
    while (node && keys.length > 0) {
      node = node[keys.shift()];
    }
    return node;
  }
}
function autoUnsub(component: any) {
  throw new Error('Function not implemented.');
}

