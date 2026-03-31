import { getDb } from './connection'
import { logger } from '../logger'

export interface ServerConfig {
  id: number
  port: number
  apiKey: string
  createdAt: string
  updatedAt: string
}

export const getServerConfig = (): ServerConfig | null => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT id, port, api_key as apiKey, created_at as createdAt, updated_at as updatedAt FROM server_config WHERE id = 1').get() as ServerConfig | undefined
    return row || null
  } catch (error) {
    logger.error({ error }, 'Failed to read server_config from database')
    return null
  }
}

export const upsertServerConfig = (port: number, apiKey: string): void => {
  try {
    const db = getDb()
    const stmt = db.prepare(`
      INSERT INTO server_config (id, port, api_key) 
      VALUES (1, ?, ?)
      ON CONFLICT(id) DO UPDATE SET 
        port = excluded.port,
        api_key = excluded.api_key,
        updated_at = CURRENT_TIMESTAMP
    `)
    stmt.run(port, apiKey)
  } catch (error) {
    logger.error({ error, port, apiKey }, 'Failed to upsert server_config to database')
    throw error
  }
}
