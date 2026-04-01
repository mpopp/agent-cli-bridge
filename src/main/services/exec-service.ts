import { validateCommand } from '../security/validator'
import { executeCommand, ExecuteResult } from '../executor/executor'
import { getExecConfig } from '../database/config'
import { AppError } from '../errors/AppError'

export interface ExecRequest {
  command: string
  cwd?: string
}

export const runCommand = async (request: ExecRequest): Promise<ExecuteResult> => {
  const { command, cwd } = request

  validateCommand(command)

  const config = getExecConfig()
  if (!config) {
    throw new AppError(500, 'INTERNAL_ERROR', 'Execution configuration is unavailable.')
  }

  return executeCommand(command, {
    cwd,
    timeoutSeconds: config.timeoutSeconds,
    maxOutputBytes: config.maxOutputMb * 1024 * 1024
  })
}
