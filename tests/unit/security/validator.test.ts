import { describe, it, expect } from 'vitest'
import { validateCommand } from '../../../src/main/security/validator'
import { AppError } from '../../../src/main/errors/AppError'

describe('validateCommand', () => {
  it('should not throw for a safe command', () => {
    expect(() => validateCommand('echo hello')).not.toThrow()
  })

  it('should not throw for a safe command with arguments', () => {
    expect(() => validateCommand('ls -la /tmp')).not.toThrow()
  })

  it('should throw AppError with FORBIDDEN for a blocked command', () => {
    expect(() => validateCommand('shutdown -h now')).toThrow(AppError)
  })

  it('should throw with statusCode 403 for a blocked command', () => {
    let caught: unknown
    try {
      validateCommand('shutdown -h now')
    } catch (e) {
      caught = e
    }
    expect(caught).toBeInstanceOf(AppError)
    expect((caught as AppError).statusCode).toBe(403)
    expect((caught as AppError).code).toBe('FORBIDDEN')
  })

  it('should throw for a fork bomb attempt', () => {
    expect(() => validateCommand(':(){:|:&};:')).toThrow(AppError)
  })

  it('should include human-readable reason in the error message', () => {
    let caught: unknown
    try {
      validateCommand('shutdown now')
    } catch (e) {
      caught = e
    }
    expect((caught as AppError).message).toContain('Command blocked by security rules')
  })
})
