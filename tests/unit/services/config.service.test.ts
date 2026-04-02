/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { initServerConfig } from '../../../src/main/services/config.service'
import * as dbConfig from '../../../src/main/database/config'
import net from 'net'
import crypto from 'crypto'

vi.mock('../../../src/main/database/config')
vi.mock('../../../src/main/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
}))

describe('Config Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it('should return existing config if available and port is free', async () => {
    const mockConfig = { id: 1, address: '127.0.0.1', port: 4000, apiKey: 'test-key', createdAt: '', updatedAt: '' }
    vi.spyOn(dbConfig, 'getServerConfig').mockReturnValue(mockConfig)
    
    // Mock net.createServer to succeed (port is free)
    const serverMock = {
      listen: vi.fn().mockImplementation((_port, _host, cb) => { if (typeof _host === 'function') _host(); else if (cb) cb(); }),
      once: vi.fn().mockImplementation((_event, cb) => serverMock),
      close: vi.fn().mockImplementation((cb) => cb())
    }
    vi.spyOn(net, 'createServer').mockReturnValue(serverMock as unknown as any)

    const result = await initServerConfig()
    expect(result).toEqual({ address: '127.0.0.1', port: 4000, apiKey: 'test-key' })
    expect(dbConfig.getServerConfig).toHaveBeenCalled()
    expect(dbConfig.upsertServerConfig).not.toHaveBeenCalled()
  })

  it('should generate new config if none exists', async () => {
    vi.spyOn(dbConfig, 'getServerConfig').mockReturnValue(null)
    
    // Mock net.createServer to succeed on first port (3000)
    const serverMock = {
      listen: vi.fn().mockImplementation((_port, _host, cb) => { if (typeof _host === 'function') _host(); else if (cb) cb(); }),
      once: vi.fn().mockImplementation((_event, cb) => serverMock),
      close: vi.fn().mockImplementation((cb) => cb()),
      address: vi.fn().mockReturnValue({ port: 3000 })
    }
    vi.spyOn(net, 'createServer').mockReturnValue(serverMock as unknown as any)
    vi.spyOn(crypto, 'randomUUID').mockReturnValue('new-and-valid-uuid-v4')

    const result = await initServerConfig()
    expect(result).toEqual({ address: '127.0.0.1', port: 3000, apiKey: 'new-and-valid-uuid-v4' })
    expect(dbConfig.upsertServerConfig).toHaveBeenCalledWith('127.0.0.1', 3000, 'new-and-valid-uuid-v4')
  })
})
