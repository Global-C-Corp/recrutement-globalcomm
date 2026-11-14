import * as migration_20261114_221714_initial from './20261114_221714_initial';
import * as migration_20261114_223850_client_logos from './20261114_223850_client_logos';
import * as migration_20261114_234554_blob_fields from './20261114_234554_blob_fields';

export const migrations = [
  {
    up: migration_20261114_221714_initial.up,
    down: migration_20261114_221714_initial.down,
    name: '20261114_221714_initial',
  },
  {
    up: migration_20261114_223850_client_logos.up,
    down: migration_20261114_223850_client_logos.down,
    name: '20261114_223850_client_logos',
  },
  {
    up: migration_20261114_234554_blob_fields.up,
    down: migration_20261114_234554_blob_fields.down,
    name: '20261114_234554_blob_fields'
  },
];
