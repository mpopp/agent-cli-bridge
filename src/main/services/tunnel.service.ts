import {
  getAllTunnelConfigs,
  insertTunnelConfig,
  updateTunnelConfig,
  deleteTunnelConfig,
  setActiveTunnelConfig,
  getActiveTunnelConfig,
  TunnelConfigRow
} from '../database/config'
import { logger } from '../logger'

export type { TunnelConfigRow }

export const getTunnelConfigs = (): TunnelConfigRow[] => {
  return getAllTunnelConfigs()
}

export const addTunnelConfig = (name: string, command: string): TunnelConfigRow => {
  logger.info({ name }, 'Adding tunnel config')
  return insertTunnelConfig(name, command)
}

export const editTunnelConfig = (id: number, name: string, command: string): void => {
  logger.info({ id, name }, 'Updating tunnel config')
  updateTunnelConfig(id, name, command)
}

export const removeTunnelConfig = (id: number): void => {
  logger.info({ id }, 'Removing tunnel config')
  const active = getActiveTunnelConfig()
  if (active && active.id === id) {
    setActiveTunnelConfig(null)
  }
  deleteTunnelConfig(id)
}

export const setActiveTunnel = (id: number): void => {
  logger.info({ id }, 'Setting active tunnel config')
  setActiveTunnelConfig(id)
}

export const getActiveTunnel = (): TunnelConfigRow | null => {
  return getActiveTunnelConfig()
}
