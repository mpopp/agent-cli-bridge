'use strict';

var dbm;
var type;
var seed;
var Promise;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
  Promise = options.Promise;
};

exports.up = function(db) {
  return db.runSql("ALTER TABLE server_config ADD COLUMN address TEXT NOT NULL DEFAULT '127.0.0.1';");
};

exports.down = function(db) {
  // SQLite has limited support for dropping columns.
  // A common workaround is to recreate the table or just leave the column.
  // For simplicity, we won't drop the column in down migration in SQLite unless necessary.
  return Promise.resolve();
};

exports._meta = {
  "version": 1
};
