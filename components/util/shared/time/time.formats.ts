/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export function getDateString(d: Date) {
  return (d.getMonth() + 1) + '/' + d.getDate();
}

export function getDateYearString(d: Date) {
  return (d.getMonth() + 1) + '/' + d.getDate() + '/' + d.getFullYear();
}

export function getTimeString(d: Date) {
  let h: any = d.getHours(); h = h % 12;
  if (h === 0) { h = 12; }
  if (h < 10) { h = '0' + h; }
  let m: any = d.getMinutes(); if (m < 10) { m = '0' + m; }
  const ampm = (d.getHours() >= 12) ? 'PM' : 'AM';
  return h + ':' + m + ' ' + ampm;
}

export function getTimeDateString(d: Date) {
  let h: any = d.getHours(); h = h % 12;
  if (h === 0) { h = 12; }
  const ampm = (d.getHours() >= 12) ? 'PM' : 'AM';
  return h + ' ' + ampm + ', ' + d.getMonth() + '/' + d.getDate();
}
