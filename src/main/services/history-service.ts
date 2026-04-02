import { ExecutionLogEntry, ExecutionFilter } from '../../types/ipc'
import { logger } from '../logger'
import { deleteOldLogs, insertLog, fetchLogs, deleteAllLogs } from '../database/history-repository'

export async function cleanupOldLogs(days = 90): Promise<void> {
  try {
    const changes = deleteOldLogs(days)
    logger.info(`Cleaned up ${changes} execution logs older than ${days} days`)
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old execution logs')
  }
}

export function logExecution(entry: Omit<ExecutionLogEntry, 'id' | 'timestamp'>): number {
  return insertLog(entry)
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
