import { getDb } from './connection'
import { logger } from '../logger'

export interface ExecConfig {
  id: number
  timeoutSeconds: number
  maxOutputMb: number
  createdAt: string
  updatedAt: string
}

export const getExecConfig = (): ExecConfig | null => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT id, timeout_seconds as timeoutSeconds, max_output_mb as maxOutputMb, created_at as createdAt, updated_at as updatedAt FROM exec_config WHERE id = 1').get() as ExecConfig | undefined
    return row || null
  } catch (error) {
    logger.error({ error }, 'Failed to read exec_config from database')
    return null
  }
}

export interface ServerConfig {
  id: number
  address: string
  port: number
  apiKey: string
  createdAt: string
  updatedAt: string
}

export const getServerConfig = (): ServerConfig | null => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT id, address, port, api_key as apiKey, created_at as createdAt, updated_at as updatedAt FROM server_config WHERE id = 1').get() as ServerConfig | undefined
    return row || null
  } catch (error) {
    logger.error({ error }, 'Failed to read server_config from database')
    return null
  }
}

export const upsertServerConfig = (address: string, port: number, apiKey: string): void => {
  try {
    const db = getDb()
    const stmt = db.prepare(`
      INSERT INTO server_config (id, address, port, api_key) 
      VALUES (1, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET 
        address = excluded.address,
        port = excluded.port,
        api_key = excluded.api_key,
        updated_at = CURRENT_TIMESTAMP
    `)
    stmt.run(address, port, apiKey)
  } catch (error) {
    logger.error({ error, address, port, apiKey }, 'Failed to upsert server_config to database')
    throw error
  }
}
