/**
 * @param {import('better-sqlite3').Database} db
 */
exports.up = (db) => {
  db.exec(`
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

/**
 * @param {import('better-sqlite3').Database} db
 */
exports.down = (db) => {
  db.exec('DROP TABLE IF NOT EXISTS execution_log')
}
