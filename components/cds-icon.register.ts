/*
 * Copyright 2014-2021 Jovian, all rights reserved.
 */
import {
  ClarityIcons,
  userIcon,
  homeIcon,
  downloadIcon,
  vmIcon,
  hostGroupIcon,
  storageIcon,
  ellipsisVerticalIcon,
  barsIcon,
} from '@cds/core/icon';
import { otherClarityIcons } from '../../../../ganymede.app.ui';
import '@cds/core/icon/register.js';

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

ClarityIcons.addIcons(vmIcon);

export const cdsIconImportInfo = {
  added: false
};
