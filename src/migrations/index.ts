import * as migration_20261114_221714_initial from './20261114_221714_initial';

export const migrations = [
  {
    up: migration_20261114_221714_initial.up,
    down: migration_20261114_221714_initial.down,
    name: '20261114_221714_initial'
  },
];
