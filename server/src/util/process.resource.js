"use strict";
/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProcessResourceSnapshot = void 0;
function getProcessResourceSnapshot() {
    return {
        t: Date.now(),
        mem: process.memoryUsage(),
        cpu: process.cpuUsage(),
    };
}
exports.getProcessResourceSnapshot = getProcessResourceSnapshot;
