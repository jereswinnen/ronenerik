import * as migration_20260316_091011 from './20260316_091011';

export const migrations = [
  {
    up: migration_20260316_091011.up,
    down: migration_20260316_091011.down,
    name: '20260316_091011'
  },
];
