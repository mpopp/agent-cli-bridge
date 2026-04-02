import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest'
import http from 'http'
import { app } from '../../../src/main/api/server'
import * as configDb from '../../../src/main/database/config'

vi.mock('../../../src/main/database/config')

const TEST_API_KEY = 'integration-test-key'

const mockServerConfig = { id: 1, address:'127.0.0.1', port: 0, apiKey: TEST_API_KEY, createdAt: '', updatedAt: '' }
const mockExecConfig = { id: 1, timeoutSeconds: 10, maxOutputMb: 10, createdAt: '', updatedAt: '' }

let server: http.Server
let baseUrl: string

beforeAll(async () => {
  vi.spyOn(configDb, 'getServerConfig').mockReturnValue(mockServerConfig)
  vi.spyOn(configDb, 'getExecConfig').mockReturnValue(mockExecConfig)

  await new Promise<void>((resolve) => {
    server = http.createServer(app)
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number }
      baseUrl = `http://127.0.0.1:${addr.port}`
      resolve()
    })
  })
})

afterAll(async () => {
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()))
  })
})

const post = (path: string, body: unknown, apiKey?: string) =>
  fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(apiKey !== undefined ? { 'x-api-key': apiKey } : {})
    },
    body: JSON.stringify(body)
  })

// T007: Integration test for POST /exec - valid command execution
describe('POST /exec - User Story 1: Execute Valid Shell Command', () => {
  it('should execute a valid command and return exit code, stdout, stderr', async () => {
    const res = await post('/exec', { command: 'echo integration-test' }, TEST_API_KEY)
    const body = await res.json() as { data: { exitCode: number; stdout: string; stderr: string }; error: null; meta: object }

    expect(res.status).toBe(200)
    expect(body.data.exitCode).toBe(0)
    expect(body.data.stdout).toBe('integration-test\n')
    expect(body.data.stderr).toBe('')
    expect(body.error).toBeNull()
    expect(body.meta).toEqual({})
  })

  it('should return non-zero exit code for a failing command', async () => {
    const res = await post('/exec', { command: 'exit 1' }, TEST_API_KEY)
    const body = await res.json() as { data: { exitCode: number } }

    expect(res.status).toBe(200)
    expect(body.data.exitCode).toBe(1)
  })

  it('should accept optional cwd parameter', async () => {
    const res = await post('/exec', { command: 'pwd', cwd: '/tmp' }, TEST_API_KEY)
    const body = await res.json() as { data: { exitCode: number; stdout: string } }

    expect(res.status).toBe(200)
    expect(body.data.exitCode).toBe(0)
    expect(body.data.stdout.trim()).toBe('/tmp')
  })
})

// T015: Integration test for blocked commands returning 403 (severity: test commands only)
describe('POST /exec - User Story 2: Security Validation', () => {
  it('should return 403 for a command blocked by the security engine', async () => {
    // Using shutdown which is in the blocklist (severity: critical - system shutdown/reboot)
    const res = await post('/exec', { command: 'shutdown -h now' }, TEST_API_KEY)
    const body = await res.json() as { data: null; error: { code: string; message: string }; meta: object }

    expect(res.status).toBe(403)
    expect(body.data).toBeNull()
    expect(body.error.code).toBe('FORBIDDEN')
    expect(body.error.message).toContain('Command blocked by security rules')
    expect(body.meta).toEqual({})
  })

  it('should return 403 for fork bomb attempt', async () => {
    const res = await post('/exec', { command: ':(){:|:&};:' }, TEST_API_KEY)
    const body = await res.json() as { data: null; error: { code: string } }

    expect(res.status).toBe(403)
    expect(body.error.code).toBe('FORBIDDEN')
  })
})

// T019: Integration tests for 401 and 400 error scenarios
describe('POST /exec - User Story 3: API Error Handling', () => {
  it('should return 401 when API key is missing', async () => {
    const res = await post('/exec', { command: 'echo hello' })
    const body = await res.json() as { data: null; error: { code: string; message: string }; meta: object }

    expect(res.status).toBe(401)
    expect(body.data).toBeNull()
    expect(body.error.code).toBe('UNAUTHORIZED')
    expect(body.error.message).toBe('Invalid API key')
    expect(body.meta).toEqual({})
  })

  it('should return 401 when API key is invalid', async () => {
    const res = await post('/exec', { command: 'echo hello' }, 'wrong-key')
    const body = await res.json() as { data: null; error: { code: string } }

    expect(res.status).toBe(401)
    expect(body.error.code).toBe('UNAUTHORIZED')
  })

  it('should return 400 when command field is missing', async () => {
    const res = await post('/exec', {}, TEST_API_KEY)
    const body = await res.json() as { data: null; error: { code: string; message: string }; meta: object }

    expect(res.status).toBe(400)
    expect(body.data).toBeNull()
    expect(body.error.code).toBe('BAD_REQUEST')
    expect(body.error.message).toBe('Missing required field: command')
    expect(body.meta).toEqual({})
  })

  it('should return 400 when command is an empty string', async () => {
    const res = await post('/exec', { command: '' }, TEST_API_KEY)
    const body = await res.json() as { data: null; error: { code: string } }

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('BAD_REQUEST')
  })

  it('should return 400 when cwd is not a string', async () => {
    const res = await post('/exec', { command: 'echo hi', cwd: 42 }, TEST_API_KEY)
    const body = await res.json() as { data: null; error: { code: string } }

    expect(res.status).toBe(400)
    expect(body.error.code).toBe('BAD_REQUEST')
  })
})
