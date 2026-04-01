import { contextBridge, ipcRenderer } from 'electron'
import type { ExecutionFilter, ExecutionLogEntry } from '../types/ipc'

if (!process.contextIsolated) {
  throw new Error('contextIsolation must be enabled in the BrowserWindow')
}

try {
  contextBridge.exposeInMainWorld('api', {
    versions: {
      node: process.versions.node,
      chrome: process.versions.chrome,
      electron: process.versions.electron,
      app: '1.0.0' // Could read from package.json if injected
    },
    executionHistory: {
      getLogs: (filter: ExecutionFilter): Promise<ExecutionLogEntry[]> => ipcRenderer.invoke('execution-history:getLogs', filter),
      clearLogs: (): Promise<boolean> => ipcRenderer.invoke('execution-history:clearLogs')
    }
  })
} catch (error) {
  console.error(error)
}
