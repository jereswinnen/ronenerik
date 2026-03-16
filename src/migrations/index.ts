import * as migration_20260316_091011 from './20260316_091011';
import * as migration_20260316_111459 from './20260316_111459';
import * as migration_20260316_135443 from './20260316_135443';

export const migrations = [
  {
    up: migration_20260316_091011.up,
    down: migration_20260316_091011.down,
    name: '20260316_091011',
  },
  {
    up: migration_20260316_111459.up,
    down: migration_20260316_111459.down,
    name: '20260316_111459',
  },
  {
    up: migration_20260316_135443.up,
    down: migration_20260316_135443.down,
    name: '20260316_135443'
  },
];
