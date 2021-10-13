/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { Subject } from 'rxjs';

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

export function completeConfig(targetConfig, defaultConfig, directAssign = false, depth = 0) {
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
    return defaultConfig;
  }
  if (defaultConfig) {
    if (Array.isArray(defaultConfig)) {
      return targetConfig;
    } else if (typeof defaultConfig === 'object') {
      for (const key of Object.keys(defaultConfig)) {
        targetConfig[key] = completeConfig(targetConfig[key], defaultConfig[key], false, depth + 1);
      }
    }
  }
  return targetConfig;
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

export function bindSub<T = any>(component, subj: Subject<T>, getter: (data: T) => any) {
  const subs = subj.subscribe(getter);
  if (!component.__rx_subs) { component.__rx_subs = []; }
  component.__rx_subs.push(subs);
}
