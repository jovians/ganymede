/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */

import { AsyncActionHandlers } from '../../components/util/server/async.worker.proc';
export const workerExtension: AsyncActionHandlers = {
  sampleAction: (payload, worker) => {
    return 'Hello World!';
  },
};

