'use strict'

exports.up = function (db) {
  return db.runSql(`
    CREATE TABLE IF NOT EXISTS execution_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
      command TEXT NOT NULL,
      cwd TEXT NOT NULL,
      exit_code INTEGER,
      duration INTEGER,
      status TEXT CHECK(status IN ('executed', 'blocked', 'running')) NOT NULL,
      block_reason TEXT,
      stdout_preview TEXT,
      stderr_preview TEXT
    )
  `)
}

exports.down = function (db) {
  return db.runSql('DROP TABLE IF EXISTS execution_log')
}

exports._meta = {
  version: 1
}
