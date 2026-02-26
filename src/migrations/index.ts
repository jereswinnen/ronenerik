import * as migration_20260226_143519 from './20260226_143519';
import * as migration_20260226_182651 from './20260226_182651';

export const migrations = [
  {
    up: migration_20260226_143519.up,
    down: migration_20260226_143519.down,
    name: '20260226_143519',
  },
  {
    up: migration_20260226_182651.up,
    down: migration_20260226_182651.down,
    name: '20260226_182651'
  },
];
