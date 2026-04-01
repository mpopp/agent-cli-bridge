import { getDb } from '../database/connection'
import { ExecutionLogEntry, ExecutionFilter } from '../../types/ipc'
import { logger } from '../logger'

export async function cleanupOldLogs(days = 90): Promise<void> {
  try {
    const db = getDb()
    const result = db.prepare(`
      DELETE FROM execution_log 
      WHERE timestamp < datetime('now', '-' || ? || ' days')
    `).run(days)
    logger.info(`Cleaned up ${result.changes} execution logs older than ${days} days`)
  } catch (error) {
    logger.error({ error }, 'Failed to cleanup old execution logs')
  }
}

export function logExecution(entry: Omit<ExecutionLogEntry, 'id' | 'timestamp'>): number {
  const db = getDb()
  const stmt = db.prepare(`
    INSERT INTO execution_log (
      command, cwd, exit_code, duration, status, block_reason, stdout_preview, stderr_preview
    ) VALUES (
      @command, @cwd, @exitCode, @duration, @status, @blockReason, @stdoutPreview, @stderrPreview
    )
  `)
  
  const result = stmt.run({
    command: entry.command,
    cwd: entry.cwd,
    exitCode: entry.exitCode ?? null,
    duration: entry.duration ?? null,
    status: entry.status,
    blockReason: entry.blockReason ?? null,
    stdoutPreview: entry.stdoutPreview?.substring(0, 500) ?? null,
    stderrPreview: entry.stderrPreview?.substring(0, 500) ?? null
  })
  
  return result.lastInsertRowid as number
}

export function getLogs(filter: ExecutionFilter = {}): ExecutionLogEntry[] {
  const db = getDb()
  const { limit = 50, offset = 0, status = 'all' } = filter
  
  let query = 'SELECT * FROM execution_log'
  const params: (string | number)[] = []
  
  if (status !== 'all') {
    query += ' WHERE status = ?'
    params.push(status)
  }
  
  query += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?'
  params.push(limit, offset)
  
  const rows = db.prepare(query).all(...params)
  
  return rows.map((row: unknown) => {
    const r = row as {
      id: number;
      timestamp: string;
      command: string;
      cwd: string;
      exit_code: number | null;
      duration: number | null;
      status: 'executed' | 'blocked' | 'running';
      block_reason: string | null;
      stdout_preview: string | null;
      stderr_preview: string | null;
    };
    return {
      id: r.id,
      timestamp: r.timestamp,
      command: r.command,
      cwd: r.cwd,
      exitCode: r.exit_code,
      duration: r.duration,
      status: r.status,
      blockReason: r.block_reason,
      stdoutPreview: r.stdout_preview,
      stderrPreview: r.stderr_preview
    };
  })
}

export function clearLogs(): boolean {
  try {
    const db = getDb()
    db.prepare('DELETE FROM execution_log').run()
    return true
  } catch (error) {
    logger.error({ error }, 'Failed to clear execution logs')
    return false
  }
}
