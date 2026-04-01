import { describe, it, expect } from 'vitest'
import { executeCommand } from '../../../src/main/executor/executor'
import { AppError } from '../../../src/main/errors/AppError'

describe('executeCommand', () => {
  it('should return stdout, stderr, and exit code for a successful command', async () => {
    const result = await executeCommand('echo hello', {
      timeoutSeconds: 5,
      maxOutputBytes: 1024 * 1024
    })

    expect(result.exitCode).toBe(0)
    expect(result.stdout).toBe('hello\n')
    expect(result.stderr).toBe('')
  })

  it('should return non-zero exit code for a failing command', async () => {
    const result = await executeCommand('exit 42', {
      timeoutSeconds: 5,
      maxOutputBytes: 1024 * 1024
    })

    expect(result.exitCode).toBe(42)
  })

  it('should capture stderr output', async () => {
    const result = await executeCommand('echo error-output >&2', {
      timeoutSeconds: 5,
      maxOutputBytes: 1024 * 1024
    })

    expect(result.stderr).toBe('error-output\n')
  })

  it('should reject with EXECUTION_TIMEOUT when command exceeds timeout', async () => {
    await expect(
      executeCommand('sleep 60', {
        timeoutSeconds: 0.1,
        maxOutputBytes: 1024 * 1024
      })
    ).rejects.toMatchObject({
      code: 'EXECUTION_TIMEOUT',
      statusCode: 500
    })
  }, 10000)

  it('should reject with OUTPUT_SIZE_EXCEEDED when output exceeds limit', async () => {
    await expect(
      executeCommand('yes', {
        timeoutSeconds: 10,
        maxOutputBytes: 10
      })
    ).rejects.toMatchObject({
      code: 'OUTPUT_SIZE_EXCEEDED',
      statusCode: 500
    })
  }, 10000)

  it('should use provided cwd', async () => {
    const result = await executeCommand('pwd', {
      cwd: '/tmp',
      timeoutSeconds: 5,
      maxOutputBytes: 1024 * 1024
    })

    expect(result.stdout.trim()).toBe('/tmp')
  })

  it('should reject with AppError on invalid command', async () => {
    await expect(
      executeCommand('nonexistent_command_xyz_abc', {
        timeoutSeconds: 5,
        maxOutputBytes: 1024 * 1024
      })
    ).resolves.toMatchObject({ exitCode: 127 })
  })

  it('should be an instance of AppError on timeout', async () => {
    let caught: unknown
    try {
      await executeCommand('sleep 60', { timeoutSeconds: 0.1, maxOutputBytes: 1024 * 1024 })
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(AppError)
  }, 10000)
})
