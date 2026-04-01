import { describe, it, expect, vi, beforeEach } from 'vitest'
import { runCommand } from '../../../src/main/services/exec-service'
import * as validator from '../../../src/main/security/validator'
import * as executor from '../../../src/main/executor/executor'
import * as configDb from '../../../src/main/database/config'
import { AppError } from '../../../src/main/errors/AppError'

vi.mock('../../../src/main/security/validator')
vi.mock('../../../src/main/executor/executor')
vi.mock('../../../src/main/database/config')

const mockConfig = { id: 1, timeoutSeconds: 30, maxOutputMb: 10, createdAt: '', updatedAt: '' }

describe('runCommand', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(configDb, 'getExecConfig').mockReturnValue(mockConfig)
    vi.spyOn(validator, 'validateCommand').mockReturnValue(undefined)
    vi.spyOn(executor, 'executeCommand').mockResolvedValue({ exitCode: 0, stdout: 'hello\n', stderr: '' })
  })

  it('should validate command and execute it', async () => {
    const result = await runCommand({ command: 'echo hello' })

    expect(validator.validateCommand).toHaveBeenCalledWith('echo hello')
    expect(executor.executeCommand).toHaveBeenCalledWith('echo hello', {
      cwd: undefined,
      timeoutSeconds: 30,
      maxOutputBytes: 10 * 1024 * 1024
    })
    expect(result).toEqual({ exitCode: 0, stdout: 'hello\n', stderr: '' })
  })

  it('should pass cwd to executor', async () => {
    await runCommand({ command: 'pwd', cwd: '/tmp' })

    expect(executor.executeCommand).toHaveBeenCalledWith('pwd', expect.objectContaining({ cwd: '/tmp' }))
  })

  it('should throw AppError with FORBIDDEN if validateCommand throws', async () => {
    vi.spyOn(validator, 'validateCommand').mockImplementation(() => {
      throw new AppError(403, 'FORBIDDEN', 'Command blocked by security rules: Destructive operation detected.')
    })

    await expect(runCommand({ command: 'rm -rf /' })).rejects.toMatchObject({
      code: 'FORBIDDEN',
      statusCode: 403
    })

    expect(executor.executeCommand).not.toHaveBeenCalled()
  })

  it('should throw AppError with INTERNAL_ERROR if exec config is unavailable', async () => {
    vi.spyOn(configDb, 'getExecConfig').mockReturnValue(null)

    await expect(runCommand({ command: 'echo hello' })).rejects.toMatchObject({
      code: 'INTERNAL_ERROR',
      statusCode: 500
    })
  })

  it('should propagate AppError from executor', async () => {
    vi.spyOn(executor, 'executeCommand').mockRejectedValue(
      new AppError(500, 'EXECUTION_TIMEOUT', 'Command execution exceeded the timeout limit.')
    )

    await expect(runCommand({ command: 'sleep 100' })).rejects.toMatchObject({
      code: 'EXECUTION_TIMEOUT',
      statusCode: 500
    })
  })
})
