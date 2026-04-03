import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getTunnelConfigs,
  addTunnelConfig,
  editTunnelConfig,
  removeTunnelConfig,
  setActiveTunnel,
  getActiveTunnel
} from '../../../src/main/services/tunnel.service'
import * as dbConfig from '../../../src/main/database/config'

vi.mock('../../../src/main/database/config')
vi.mock('../../../src/main/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
}))

const mockRow = (overrides: Partial<dbConfig.TunnelConfigRow> = {}): dbConfig.TunnelConfigRow => ({
  id: 1,
  name: 'My Tunnel',
  command: 'ssh -L 8080:localhost:80 user@host',
  isActive: false,
  createdAt: '2026-04-03T00:00:00.000Z',
  updatedAt: '2026-04-03T00:00:00.000Z',
  ...overrides
})

describe('Tunnel Service', () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  describe('getTunnelConfigs', () => {
    it('should return all tunnel configs from the repository', () => {
      const rows = [mockRow(), mockRow({ id: 2, name: 'Second' })]
      vi.spyOn(dbConfig, 'getAllTunnelConfigs').mockReturnValue(rows)

      const result = getTunnelConfigs()

      expect(result).toEqual(rows)
      expect(dbConfig.getAllTunnelConfigs).toHaveBeenCalledOnce()
    })

    it('should return empty array when no configs exist', () => {
      vi.spyOn(dbConfig, 'getAllTunnelConfigs').mockReturnValue([])

      const result = getTunnelConfigs()

      expect(result).toEqual([])
    })
  })

  describe('addTunnelConfig', () => {
    it('should insert and return the new tunnel config', () => {
      const row = mockRow()
      vi.spyOn(dbConfig, 'insertTunnelConfig').mockReturnValue(row)

      const result = addTunnelConfig('My Tunnel', 'ssh -L 8080:localhost:80 user@host')

      expect(result).toEqual(row)
      expect(dbConfig.insertTunnelConfig).toHaveBeenCalledWith('My Tunnel', 'ssh -L 8080:localhost:80 user@host')
    })
  })

  describe('editTunnelConfig', () => {
    it('should call updateTunnelConfig with correct args', () => {
      vi.spyOn(dbConfig, 'updateTunnelConfig').mockReturnValue(undefined)

      editTunnelConfig(1, 'Updated Name', 'new-command')

      expect(dbConfig.updateTunnelConfig).toHaveBeenCalledWith(1, 'Updated Name', 'new-command')
    })
  })

  describe('removeTunnelConfig', () => {
    it('should delete the config without clearing active state when it is not active', () => {
      vi.spyOn(dbConfig, 'getActiveTunnelConfig').mockReturnValue(mockRow({ id: 2, isActive: true }))
      vi.spyOn(dbConfig, 'setActiveTunnelConfig').mockReturnValue(undefined)
      vi.spyOn(dbConfig, 'deleteTunnelConfig').mockReturnValue(undefined)

      removeTunnelConfig(1)

      expect(dbConfig.setActiveTunnelConfig).not.toHaveBeenCalled()
      expect(dbConfig.deleteTunnelConfig).toHaveBeenCalledWith(1)
    })

    it('should clear active state when the active config is removed', () => {
      vi.spyOn(dbConfig, 'getActiveTunnelConfig').mockReturnValue(mockRow({ id: 1, isActive: true }))
      vi.spyOn(dbConfig, 'setActiveTunnelConfig').mockReturnValue(undefined)
      vi.spyOn(dbConfig, 'deleteTunnelConfig').mockReturnValue(undefined)

      removeTunnelConfig(1)

      expect(dbConfig.setActiveTunnelConfig).toHaveBeenCalledWith(null)
      expect(dbConfig.deleteTunnelConfig).toHaveBeenCalledWith(1)
    })

    it('should delete config when no active config exists', () => {
      vi.spyOn(dbConfig, 'getActiveTunnelConfig').mockReturnValue(null)
      vi.spyOn(dbConfig, 'setActiveTunnelConfig').mockReturnValue(undefined)
      vi.spyOn(dbConfig, 'deleteTunnelConfig').mockReturnValue(undefined)

      removeTunnelConfig(1)

      expect(dbConfig.setActiveTunnelConfig).not.toHaveBeenCalled()
      expect(dbConfig.deleteTunnelConfig).toHaveBeenCalledWith(1)
    })
  })

  describe('setActiveTunnel', () => {
    it('should call setActiveTunnelConfig with the given id', () => {
      vi.spyOn(dbConfig, 'setActiveTunnelConfig').mockReturnValue(undefined)

      setActiveTunnel(3)

      expect(dbConfig.setActiveTunnelConfig).toHaveBeenCalledWith(3)
    })
  })

  describe('getActiveTunnel', () => {
    it('should return the active tunnel config', () => {
      const row = mockRow({ isActive: true })
      vi.spyOn(dbConfig, 'getActiveTunnelConfig').mockReturnValue(row)

      const result = getActiveTunnel()

      expect(result).toEqual(row)
    })

    it('should return null when no active tunnel exists', () => {
      vi.spyOn(dbConfig, 'getActiveTunnelConfig').mockReturnValue(null)

      const result = getActiveTunnel()

      expect(result).toBeNull()
    })
  })
})
