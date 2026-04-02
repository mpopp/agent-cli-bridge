import { ipcMain } from 'electron'
import { getLogs, clearLogs } from '../services/history-service'
import { ExecutionFilter, NetworkConfig } from '../../types/ipc'
import { getConfig, saveNetworkConfig, regenerateApiKey } from '../services/config.service'
import { getServerStatus, stopServer, startServer } from '../api/server'

export function setupIpcHandlers() {
  ipcMain.handle('execution-history:getLogs', (_, filter: ExecutionFilter) => {
    return getLogs(filter)
  })

  ipcMain.handle('execution-history:clearLogs', () => {
    return clearLogs()
  })

  ipcMain.handle('connection-config:getConfig', () => {
    return getConfig()
  })

  ipcMain.handle('connection-config:saveNetworkConfig', async (_, config: NetworkConfig) => {
    const success = await saveNetworkConfig(config.address, config.port)
    if (success) {
      await stopServer()
      const newConfig = getConfig()
      await startServer(newConfig)
    }
    return success
  })

  ipcMain.handle('connection-config:regenerateApiKey', () => {
    return regenerateApiKey()
  })

  ipcMain.handle('connection-config:getServerStatus', () => {
    return { status: getServerStatus() }
  })
}
