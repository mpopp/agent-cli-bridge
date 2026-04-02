/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { authMiddleware } from '../../../../src/main/api/middleware/auth'
import * as configDb from '../../../../src/main/database/config'

vi.mock('../../../../src/main/database/config')

describe('Auth Middleware', () => {
  it('should return 401 if x-api-key header is missing', () => {
    const req = { headers: {} } as unknown as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as any
    const next = vi.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' }, meta: {} })
    expect(next).not.toHaveBeenCalled()
  })

  it('should return 401 if x-api-key is invalid', () => {
    vi.spyOn(configDb, 'getServerConfig').mockReturnValue({ id: 1, address:'127.0.0.1', port: 3000, apiKey: 'valid-key', createdAt: '', updatedAt: '' })
    
    const req = { headers: { 'x-api-key': 'invalid-key' } } as unknown as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as any
    const next = vi.fn()

    authMiddleware(req, res, next)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.json).toHaveBeenCalledWith({ data: null, error: { code: 'UNAUTHORIZED', message: 'Invalid API key' }, meta: {} })
    expect(next).not.toHaveBeenCalled()
  })

  it('should call next if x-api-key is valid', () => {
    vi.spyOn(configDb, 'getServerConfig').mockReturnValue({ id: 1, address:'127.0.0.1', port: 3000, apiKey: 'valid-key', createdAt: '', updatedAt: '' })
    
    const req = { headers: { 'x-api-key': 'valid-key' } } as unknown as any
    const res = { status: vi.fn().mockReturnThis(), json: vi.fn() } as unknown as any
    const next = vi.fn()

    authMiddleware(req, res, next)

    expect(next).toHaveBeenCalled()
    expect(res.status).not.toHaveBeenCalled()
  })
})
