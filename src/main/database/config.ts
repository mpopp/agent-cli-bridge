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

export interface TunnelConfigRow {
  id: number
  name: string
  command: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export const getAllTunnelConfigs = (): TunnelConfigRow[] => {
  try {
    const db = getDb()
    const rows = db.prepare('SELECT id, name, command, is_active as isActive, created_at as createdAt, updated_at as updatedAt FROM tunnel_configs ORDER BY created_at ASC').all() as (Omit<TunnelConfigRow, 'isActive'> & { isActive: number })[]
    return rows.map(r => ({ ...r, isActive: r.isActive === 1 }))
  } catch (error) {
    logger.error({ error }, 'Failed to read tunnel_configs from database')
    return []
  }
}

export const insertTunnelConfig = (name: string, command: string): TunnelConfigRow => {
  const db = getDb()
  const stmt = db.prepare('INSERT INTO tunnel_configs (name, command) VALUES (?, ?)')
  const result = stmt.run(name, command)
  const row = db.prepare('SELECT id, name, command, is_active as isActive, created_at as createdAt, updated_at as updatedAt FROM tunnel_configs WHERE id = ?').get(result.lastInsertRowid) as (Omit<TunnelConfigRow, 'isActive'> & { isActive: number })
  return { ...row, isActive: row.isActive === 1 }
}

export const updateTunnelConfig = (id: number, name: string, command: string): void => {
  const db = getDb()
  db.prepare('UPDATE tunnel_configs SET name = ?, command = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(name, command, id)
}

export const deleteTunnelConfig = (id: number): void => {
  const db = getDb()
  db.prepare('DELETE FROM tunnel_configs WHERE id = ?').run(id)
}

export const setActiveTunnelConfig = (id: number | null): void => {
  const db = getDb()
  //Intended "update all" statement here to set the currently active tunnel config to inactive
  db.prepare('UPDATE tunnel_configs SET is_active = 0, updated_at = CURRENT_TIMESTAMP').run()
  if (id !== null) {
    db.prepare('UPDATE tunnel_configs SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?').run(id)
  }
}

export const getActiveTunnelConfig = (): TunnelConfigRow | null => {
  try {
    const db = getDb()
    const row = db.prepare('SELECT id, name, command, is_active as isActive, created_at as createdAt, updated_at as updatedAt FROM tunnel_configs WHERE is_active = 1 LIMIT 1').get() as (Omit<TunnelConfigRow, 'isActive'> & { isActive: number }) | undefined
    if (!row) return null
    return { ...row, isActive: true }
  } catch (error) {
    logger.error({ error }, 'Failed to read active tunnel_config from database')
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
