import type { ExecutionFilter, ExecutionLogEntry, ServerConfig, NetworkConfig, ServerStatus, TunnelConfig, NewTunnelConfig, UpdateTunnelConfig, TunnelProcessState, TunnelStateChangedPayload } from '../types/ipc'

export interface IElectronAPI {
  versions: {
    node: string
    chrome: string
    electron: string
    app: string
  }
  executionHistory: {
    getLogs: (filter: ExecutionFilter) => Promise<ExecutionLogEntry[]>
    clearLogs: () => Promise<boolean>
  }
  connectionConfig: {
    getConfig: () => Promise<ServerConfig>
    saveNetworkConfig: (config: NetworkConfig) => Promise<boolean>
    regenerateApiKey: () => Promise<string>
    getServerStatus: () => Promise<ServerStatus>
  }
  tunnelConfig: {
    getAll: () => Promise<TunnelConfig[]>
    add: (config: NewTunnelConfig) => Promise<TunnelConfig>
    update: (config: UpdateTunnelConfig) => Promise<void>
    remove: (id: number) => Promise<void>
    setActive: (id: number) => Promise<void>
  }
  tunnelExecution: {
    getState: () => Promise<{ state: TunnelProcessState }>
    onStateChanged: (cb: (payload: TunnelStateChangedPayload) => void) => () => void
  }
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
