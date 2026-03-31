/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest'
import { healthHandler } from '../../../../src/main/api/routes/health'
import os from 'os'

describe('Health Route', () => {
  it('should return 200 with status ok and hostname', () => {
    vi.spyOn(os, 'hostname').mockReturnValue('test-hostname')
    
    const req = {} as unknown as any
    const res = { json: vi.fn(), status: vi.fn().mockReturnThis() } as unknown as any

    healthHandler(req, res)

    expect(res.json).toHaveBeenCalledWith({ status: 'ok', hostname: 'test-hostname' })
  })
})
