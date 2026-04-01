import { ipcMain } from 'electron'
import { getLogs, clearLogs } from '../services/history-service'
import { ExecutionFilter } from '../../types/ipc'

export function setupIpcHandlers() {
  ipcMain.handle('execution-history:getLogs', (_, filter: ExecutionFilter) => {
    return getLogs(filter)
  })

  ipcMain.handle('execution-history:clearLogs', () => {
    return clearLogs()
  })
}
