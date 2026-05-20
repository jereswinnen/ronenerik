import * as migration_20260316_091011 from './20260316_091011';
import * as migration_20260316_111459 from './20260316_111459';
import * as migration_20260316_135443 from './20260316_135443';
import * as migration_20260319_move_discord_spotify from './20260319_move_discord_spotify';
import * as migration_20260402_092820 from './20260402_092820';
import * as migration_20260408_101232 from './20260408_101232';
import * as migration_20260426_090449_users_open_registration from './20260426_090449_users_open_registration';
import * as migration_20260426_090638_posts_comments_enabled from './20260426_090638_posts_comments_enabled';
import * as migration_20260426_091057_comments_collection from './20260426_091057_comments_collection';
import * as migration_20260520_100000_backfill_user_verified from './20260520_100000_backfill_user_verified';

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
    name: '20260408_101232',
  },
  {
    up: migration_20260426_090449_users_open_registration.up,
    down: migration_20260426_090449_users_open_registration.down,
    name: '20260426_090449_users_open_registration',
  },
  {
    up: migration_20260426_090638_posts_comments_enabled.up,
    down: migration_20260426_090638_posts_comments_enabled.down,
    name: '20260426_090638_posts_comments_enabled',
  },
  {
    up: migration_20260426_091057_comments_collection.up,
    down: migration_20260426_091057_comments_collection.down,
    name: '20260426_091057_comments_collection'
  },
  {
    up: migration_20260520_100000_backfill_user_verified.up,
    down: migration_20260520_100000_backfill_user_verified.down,
    name: '20260520_100000_backfill_user_verified'
  },
];
