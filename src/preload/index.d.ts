import type { ExecutionFilter, ExecutionLogEntry, ServerConfig, NetworkConfig, ServerStatus } from '../types/ipc'

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
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
