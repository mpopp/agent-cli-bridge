import { ipcMain, BrowserWindow } from 'electron'
import { getLogs, clearLogs } from '../services/history-service'
import { ExecutionFilter, NetworkConfig, NewTunnelConfig, UpdateTunnelConfig } from '../../types/ipc'
import { getConfig, saveNetworkConfig, regenerateApiKey } from '../services/config.service'
import { getServerStatus, stopServer, startServer } from './server'
import { getTunnelConfigs, addTunnelConfig, editTunnelConfig, removeTunnelConfig, setActiveTunnel, getActiveTunnel } from '../services/tunnel.service'
import { tunnelManager } from '../services/tunnel-process-manager'

export function setupIpcHandlers() {
  tunnelManager.on('stateChanged', (payload) => {
    BrowserWindow.getAllWindows()[0]?.webContents.send('tunnel-execution:stateChanged', payload)
  })

  ipcMain.handle('tunnel-execution:getState', () => {
    return { state: tunnelManager.getState() }
  })

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

  ipcMain.handle('tunnel-config:getAll', () => {
    return getTunnelConfigs()
  })

  ipcMain.handle('tunnel-config:add', (_, config: NewTunnelConfig) => {
    return addTunnelConfig(config.name, config.command)
  })

  ipcMain.handle('tunnel-config:update', (_, config: UpdateTunnelConfig) => {
    editTunnelConfig(config.id, config.name, config.command)
  })

  ipcMain.handle('tunnel-config:remove', async (_, id: number) => {
    const active = getActiveTunnel()
    if (active && active.id === id) {
      await tunnelManager.stop()
    }
    removeTunnelConfig(id)
  })

  ipcMain.handle('tunnel-config:setActive', async (_, id: number) => {
    await tunnelManager.stop()
    setActiveTunnel(id)
    const newConfig = getActiveTunnel()
    if (newConfig) {
      tunnelManager.start(newConfig)
    }
  })
}
