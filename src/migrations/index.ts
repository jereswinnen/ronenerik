import * as migration_20260316_091011 from './20260316_091011';
import * as migration_20260316_111459 from './20260316_111459';
import * as migration_20260316_135443 from './20260316_135443';
import * as migration_20260319_move_discord_spotify from './20260319_move_discord_spotify';
import * as migration_20260402_092820 from './20260402_092820';
import * as migration_20260408_101232 from './20260408_101232';

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
    name: '20260316_135443',
  },
  {
    up: migration_20260319_move_discord_spotify.up,
    down: migration_20260319_move_discord_spotify.down,
    name: '20260319_move_discord_spotify',
  },
  {
    up: migration_20260402_092820.up,
    down: migration_20260402_092820.down,
    name: '20260402_092820',
  },
  {
    up: migration_20260408_101232.up,
    down: migration_20260408_101232.down,
    name: '20260408_101232'
  },
];
