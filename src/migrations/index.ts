import * as migration_20261114_221714_initial from './20261114_221714_initial';
import * as migration_20261114_223850_client_logos from './20261114_223850_client_logos';

export const migrations = [
  {
    up: migration_20261114_221714_initial.up,
    down: migration_20261114_221714_initial.down,
    name: '20261114_221714_initial',
  },
  {
    up: migration_20261114_223850_client_logos.up,
    down: migration_20261114_223850_client_logos.down,
    name: '20261114_223850_client_logos'
  },
];
