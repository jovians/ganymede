/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export function ganylog(domain: string, message: string, color: string = '#de00ff') {
  // tslint:disable-next-line: no-console
  console.log(`%c[Ganymede ${domain}]`, `color:${color};`,  message);
}
