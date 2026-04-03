import { EventEmitter } from 'events'
import { ExecutionLogEntry, ExecutionFilter } from '../../types/ipc'
import { logger } from '../logger'
import { deleteOldLogs, insertLog, fetchLogs, deleteAllLogs } from '../database/history-repository'

export interface HistoryManagerEvents {
  newEntry: (entry: ExecutionLogEntry) => void
}

class HistoryEventEmitter extends EventEmitter {
  emit<K extends keyof HistoryManagerEvents>(event: K, ...args: Parameters<HistoryManagerEvents[K]>): boolean {
    return super.emit(event, ...args)
  }

  on<K extends keyof HistoryManagerEvents>(event: K, listener: HistoryManagerEvents[K]): this {
    return super.on(event, listener)
  }
}

export const historyEventEmitter = new HistoryEventEmitter()

export async function cleanupOldLogs(days = 90): Promise<void> {
  try {
    const changes = deleteOldLogs(days)
    logger.info(`Cleaned up ${changes} execution logs older than ${days} days`)
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old execution logs')
  }
}

export function logExecution(entry: Omit<ExecutionLogEntry, 'id' | 'timestamp'>): number {
  const id = insertLog(entry)
  
  // Fetch the created log entry to emit it with the generated ID and timestamp
  const logs = fetchLogs({ limit: 1 })
  const createdLog = logs.find((log) => log.id === id)
  if (createdLog) {
    historyEventEmitter.emit('newEntry', createdLog)
  }
  
  return id
}

export function getLogs(filter: ExecutionFilter = {}): ExecutionLogEntry[] {
  return fetchLogs(filter)
}

export function clearLogs(): boolean {
  try {
    deleteAllLogs()
    return true
  } catch (error) {
    logger.error({ error }, 'Failed to clear execution logs')
    return false
  }
}
