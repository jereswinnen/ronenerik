import * as migration_20260226_183510 from './20260226_183510';
import * as migration_20260315_105608 from './20260315_105608';
import * as migration_20260315_130000 from './20260315_130000';
import * as migration_20260315_131228 from './20260315_131228';

export const migrations = [
  {
    up: migration_20260226_183510.up,
    down: migration_20260226_183510.down,
    name: '20260226_183510',
  },
  {
    up: migration_20260315_105608.up,
    down: migration_20260315_105608.down,
    name: '20260315_105608',
  },
  {
    up: migration_20260315_130000.up,
    down: migration_20260315_130000.down,
    name: '20260315_130000',
  },
  {
    up: migration_20260315_131228.up,
    down: migration_20260315_131228.down,
    name: '20260315_131228'
  },
];
