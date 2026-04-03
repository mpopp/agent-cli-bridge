import { contextBridge, ipcRenderer } from 'electron'
import type { ExecutionFilter, ExecutionLogEntry, ServerConfig, NetworkConfig, ServerStatus, TunnelConfig, NewTunnelConfig, UpdateTunnelConfig, TunnelProcessState, TunnelStateChangedPayload } from '../types/ipc'

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
    },
    connectionConfig: {
      getConfig: (): Promise<ServerConfig> => ipcRenderer.invoke('connection-config:getConfig'),
      saveNetworkConfig: (config: NetworkConfig): Promise<boolean> => ipcRenderer.invoke('connection-config:saveNetworkConfig', config),
      regenerateApiKey: (): Promise<string> => ipcRenderer.invoke('connection-config:regenerateApiKey'),
      getServerStatus: (): Promise<ServerStatus> => ipcRenderer.invoke('connection-config:getServerStatus')
    },
    tunnelConfig: {
      getAll: (): Promise<TunnelConfig[]> => ipcRenderer.invoke('tunnel-config:getAll'),
      add: (config: NewTunnelConfig): Promise<TunnelConfig> => ipcRenderer.invoke('tunnel-config:add', config),
      update: (config: UpdateTunnelConfig): Promise<void> => ipcRenderer.invoke('tunnel-config:update', config),
      remove: (id: number): Promise<void> => ipcRenderer.invoke('tunnel-config:remove', id),
      setActive: (id: number): Promise<void> => ipcRenderer.invoke('tunnel-config:setActive', id)
    },
    tunnelExecution: {
      getState: (): Promise<{ state: TunnelProcessState }> => ipcRenderer.invoke('tunnel-execution:getState'),
      onStateChanged: (cb: (payload: TunnelStateChangedPayload) => void): (() => void) => {
        const listener = (_event: Electron.IpcRendererEvent, payload: TunnelStateChangedPayload) => cb(payload)
        ipcRenderer.on('tunnel-execution:stateChanged', listener)
        return () => ipcRenderer.removeListener('tunnel-execution:stateChanged', listener)
      }
    }
  })
} catch (error) {
  console.error(error)
}
