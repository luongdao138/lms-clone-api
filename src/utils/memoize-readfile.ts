import { readFileSync } from 'node:fs';

import * as memoize from 'memoizee';

export const memoizeReadFile = memoize(readFileSync);
