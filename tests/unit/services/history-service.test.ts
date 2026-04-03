import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.unmock('../../../src/main/services/history-service')

import { logExecution, historyEventEmitter } from '../../../src/main/services/history-service'
import * as repository from '../../../src/main/database/history-repository'

vi.mock('../../../src/main/database/history-repository')

describe('history-service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('logExecution', () => {
    it('should insert log and emit newEntry event', () => {
      const mockEntry = {
        command: 'echo test',
        cwd: '/tmp',
        exitCode: 0,
        duration: 10,
        status: 'executed' as const,
        blockReason: null,
        stdoutPreview: 'test\n',
        stderrPreview: ''
      }
      
      const mockCreatedLog = { ...mockEntry, id: 1, timestamp: '2023-01-01T00:00:00Z' }

      vi.spyOn(repository, 'insertLog').mockReturnValue(1)
      vi.spyOn(repository, 'fetchLogs').mockReturnValue([mockCreatedLog])
      
      const emitSpy = vi.spyOn(historyEventEmitter, 'emit')

      const id = logExecution(mockEntry)

      expect(id).toBe(1)
      expect(repository.insertLog).toHaveBeenCalledWith(mockEntry)
      expect(repository.fetchLogs).toHaveBeenCalledWith({ limit: 1 })
      expect(emitSpy).toHaveBeenCalledWith('newEntry', mockCreatedLog)
    })

    it('should insert log but not emit event if fetch fails to return the newly created log', () => {
      const mockEntry = {
        command: 'echo test',
        cwd: '/tmp',
        exitCode: 0,
        duration: 10,
        status: 'executed' as const,
        blockReason: null,
        stdoutPreview: 'test\n',
        stderrPreview: ''
      }

      vi.spyOn(repository, 'insertLog').mockReturnValue(2)
      vi.spyOn(repository, 'fetchLogs').mockReturnValue([]) // return empty array or mismatching ID
      
      const emitSpy = vi.spyOn(historyEventEmitter, 'emit')

      const id = logExecution(mockEntry)

      expect(id).toBe(2)
      expect(emitSpy).not.toHaveBeenCalled()
    })
  })
})
