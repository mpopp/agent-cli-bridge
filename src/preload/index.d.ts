import type { ExecutionFilter, ExecutionLogEntry } from '../types/ipc'

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
}

declare global {
  interface Window {
    api: IElectronAPI
  }
}
