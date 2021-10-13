/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

export interface ProcessResourceSnapshot {
  t: number;
  mem: NodeJS.MemoryUsage;
  cpu: NodeJS.CpuUsage;
}

export function getProcessResourceSnapshot(): ProcessResourceSnapshot {
  return {
    t: Date.now(),
    mem: process.memoryUsage(),
    cpu: process.cpuUsage(),
  };
}
