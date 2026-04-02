import { vi } from 'vitest'

vi.mock('../src/main/services/history-service', () => ({
  logExecution: vi.fn(),
  getLogs: vi.fn().mockResolvedValue([]),
  clearLogs: vi.fn().mockResolvedValue(true),
  cleanupOldLogs: vi.fn().mockResolvedValue(undefined)
}))

vi.mock('electron', async () => {
  const { createElectronMock } = await import('./helpers/electron-mock')
  return createElectronMock()
})
