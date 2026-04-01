/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { execHandler } from '../../../../src/main/api/routes/exec'
import * as execService from '../../../../src/main/services/exec-service'
import { AppError } from '../../../../src/main/errors/AppError'

vi.mock('../../../../src/main/services/exec-service')

const makeRes = () => ({
  status: vi.fn().mockReturnThis(),
  json: vi.fn()
}) as unknown as any

const makeReq = (body: any) => ({ body }) as unknown as any

describe('execHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should return 400 if command is missing', async () => {
    const req = makeReq({})
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { code: 'BAD_REQUEST', message: 'Missing required field: command' },
      meta: {}
    })
  })

  it('should return 400 if command is empty string', async () => {
    const req = makeReq({ command: '   ' })
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
  })

  it('should return 400 if cwd is not a string', async () => {
    const req = makeReq({ command: 'echo hi', cwd: 123 })
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { code: 'BAD_REQUEST', message: 'Invalid field: cwd must be a string' },
      meta: {}
    })
  })

  it('should return 200 with execution result on success', async () => {
    vi.spyOn(execService, 'runCommand').mockResolvedValue({ exitCode: 0, stdout: 'hello\n', stderr: '' })

    const req = makeReq({ command: 'echo hello' })
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({
      data: { exitCode: 0, stdout: 'hello\n', stderr: '' },
      error: null,
      meta: {}
    })
  })

  it('should return 403 if command is blocked by security engine', async () => {
    vi.spyOn(execService, 'runCommand').mockRejectedValue(
      new AppError(403, 'FORBIDDEN', 'Command blocked by security rules: Destructive operation detected.')
    )

    const req = makeReq({ command: 'rm -rf /' })
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(403)
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { code: 'FORBIDDEN', message: 'Command blocked by security rules: Destructive operation detected.' },
      meta: {}
    })
  })

  it('should return 500 on execution timeout', async () => {
    vi.spyOn(execService, 'runCommand').mockRejectedValue(
      new AppError(500, 'EXECUTION_TIMEOUT', 'Command execution exceeded the timeout limit.')
    )

    const req = makeReq({ command: 'sleep 100' })
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({
      data: null,
      error: { code: 'EXECUTION_TIMEOUT', message: 'Command execution exceeded the timeout limit.' },
      meta: {}
    })
  })

  it('should call next for unexpected errors', async () => {
    const unexpectedError = new Error('Unexpected failure')
    vi.spyOn(execService, 'runCommand').mockRejectedValue(unexpectedError)

    const req = makeReq({ command: 'echo hi' })
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(next).toHaveBeenCalledWith(unexpectedError)
  })

  it('should pass cwd to runCommand', async () => {
    const spy = vi.spyOn(execService, 'runCommand').mockResolvedValue({ exitCode: 0, stdout: '', stderr: '' })

    const req = makeReq({ command: 'pwd', cwd: '/tmp' })
    const res = makeRes()
    const next = vi.fn()

    await execHandler(req, res, next)

    expect(spy).toHaveBeenCalledWith({ command: 'pwd', cwd: '/tmp' })
  })
})
