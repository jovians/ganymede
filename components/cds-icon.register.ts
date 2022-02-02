/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import '@cds/core/icon/register.js';
import { ClarityIcons } from '@clr/core/icon';
import {
  userIcon,
  homeIcon,
  downloadIcon,
  vmIcon,
  hostGroupIcon,
  storageIcon,
  ellipsisVerticalIcon,
  barsIcon,
} from '@clr/core/icon';
import { otherClarityIcons } from '../../../../ganymede.app.ui';

ClarityIcons.addIcons(
  ...[
    userIcon,
    homeIcon,
    downloadIcon,
    vmIcon,
    hostGroupIcon,
    storageIcon,
    ...otherClarityIcons
    // ellipsisVerticalIcon,
    // barsIcon,
  ].filter((value, index, self) => self.indexOf(value) === index)
);

export const cdsIconImportInfo = {
  added: true
};
