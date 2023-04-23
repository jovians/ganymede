/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { Subject, Observable, of } from 'rxjs';
import { Class, ClassLineage } from 'ts-comply';
import { Result, errorResult, ok, promise, Promise2 } from 'ts-comply';

export const isNodeJs = (typeof process !== 'undefined') && (process.release.name === 'node');

export enum EnvContext {
  local = 'local',
  dev = 'dev',      // dev
  stg = 'stg',      // staging
  prd = 'prd',      // production
}

export let currentEnv: EnvContext = EnvContext.local;

export function keyNav(obj: any, keys: string[]) {
  let at = obj;
  for (const key of keys) {
    if (!at) { return { resolved: false, value: null }; }
    if (at[key] === undefined) { return { resolved: false, value: null }; }
    at = at[key];
  }
  return { resolved: true, value: at };
}

export function completeConfigDirectly(targetConfig, defaultConfig) {
  return completeConfig(targetConfig, defaultConfig, true);
}

export function completeConfig<T>(targetConfig: Partial<T>, defaultConfig: Partial<T>, directAssign = false, depth = 0): T {
  // clone both configs for base depth
  if (depth === 0) {
    if (targetConfig && typeof targetConfig === 'object' || Array.isArray(targetConfig)) {
      if (!directAssign) {
        targetConfig = JSON.parse(JSON.stringify(targetConfig));
      }
    }
    if (defaultConfig && typeof defaultConfig === 'object' || Array.isArray(defaultConfig)) {
      defaultConfig = JSON.parse(JSON.stringify(defaultConfig));
    }
  }
  if (targetConfig === null || targetConfig === undefined) {
    return defaultConfig as T;
  }
  if (defaultConfig) {
    if (Array.isArray(defaultConfig)) {
      return targetConfig as T;
    } else if (typeof defaultConfig === 'object') {
      for (const key of Object.keys(defaultConfig)) {
        targetConfig[key] = completeConfig(targetConfig[key], defaultConfig[key], false, depth + 1);
      }
    }
  }
  return targetConfig as T;
}

export function topMomentOut(srcComponent: any, lockname: string, momentMs: number,
                             logic: (...args: any[]) => any, onOutdated?: (...args: any[]) => any) {
  if (!srcComponent) { throw new Error(`Cannot invoke topMomentOut without invocation target.`); }
  if (srcComponent.__locker) { srcComponent.__locker = {}; }
  const locker = srcComponent.__locker[lockname] = {};
  setTimeout(() => {
    if (locker !== srcComponent.__locker[lockname]) {
      return onOutdated();
    }
    logic();
  }, momentMs);
}

export function bindSub<T = any>(component, subj: Subject<T> | Observable<T>, getter: (data: T) => any) {
  const subs = subj.subscribe(getter);
  if (!component.__rx_subs) { component.__rx_subs = []; }
  component.__rx_subs.push(subs);
}

export function moduleTypeMap(module: any, typeHintProperty: string) {
  const classByName: {[name: string]: Class<any> } = {};
  const classLineageByName: {[name: string]: Class<any>[] } = {};
  const classLineageStringByName: {[name: string]: string[] } = {};
  for (const propName of Object.keys(module)) {
    const member = module[propName]; if (!member) { continue; }
    const targetIsClass = member && !!member.prototype && !!member.constructor.name;
    if (targetIsClass) {
      classByName[propName] = member;
      classLineageByName[propName] = ClassLineage.of(member);
      classLineageStringByName[propName] = classLineageByName[propName].map(cls => {
        classByName[cls.name] = cls;
        return cls.name;
      });
    }
  }
  return { 
    classByName,
    classLineageByName,
    classLineageStringByName,
    checkInstanceOf: <T=any,P=any>(target: T, ancestor: Class<P>) => {
      if (!target || !ancestor || !target[typeHintProperty]) { return false; }
      const typeName = target[typeHintProperty];
      const targetClass = classByName[target[typeHintProperty]];
      if (!targetClass) { return false; }
      const lca = ClassLineage.lastCommonAncestor(targetClass, ancestor);
      return lca === ancestor;
    },
  };
}

export function resultify<T>(obs: Observable<T>): Promise2<Result<T>> {
  return promise(async (resolve) => {
    try {
      const subs = obs.pipe(
        // catchError(e => {
        //   resolve(errorResult(e));
        //   return of(null); 
        // })
      ).subscribe(async (data) => {
        subs.unsubscribe();
        if (data !== null) {
          resolve(ok(data as  any));
        }
      });
    } catch(e) {
      resolve(errorResult(e));
    }
  });
}

