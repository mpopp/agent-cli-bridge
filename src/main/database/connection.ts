import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'
import { logger } from '../logger'

let dbInstance: ReturnType<typeof Database> | null = null

export const getDbPath = () => join(app.getPath('userData'), 'agent-cli-bridge.db')

export const getDb = (): Database.Database => {
  if (!dbInstance) {
    const dbPath = getDbPath()
    logger.info({ dbPath }, 'Connecting to database')
    dbInstance = new Database(dbPath)
    dbInstance.pragma('journal_mode = WAL')
  }
  return dbInstance
}

export const closeDb = () => {
  if (dbInstance) {
    dbInstance.close()
    dbInstance = null
  }
}
