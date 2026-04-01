import { vi, beforeAll } from 'vitest'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdirSync } from 'fs'

const workerId = process.env.VITEST_WORKER_ID ?? '0'
const workerTmpDir = join(tmpdir(), `agent-cli-bridge-test-worker-${workerId}`)

vi.mock('electron', () => ({
  app: {
    getPath: (_name: string) => {
      if (_name === 'userData') return workerTmpDir
      return workerTmpDir
    },
    getVersion: () => '1.0.0',
    getName: () => 'agent-cli-bridge-test',
    quit: vi.fn(),
    on: vi.fn(),
    whenReady: vi.fn().mockResolvedValue(undefined)
  },
  ipcMain: {
    handle: vi.fn(),
    on: vi.fn(),
    removeHandler: vi.fn()
  },
  ipcRenderer: {
    invoke: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn()
  },
  contextBridge: {
    exposeInMainWorld: vi.fn()
  },
  BrowserWindow: vi.fn().mockImplementation(() => ({
    loadURL: vi.fn(),
    loadFile: vi.fn(),
    show: vi.fn(),
    on: vi.fn(),
    getAllWindows: vi.fn().mockReturnValue([])
  }))
}))

beforeAll(async () => {
  mkdirSync(workerTmpDir, { recursive: true })
  const { runMigrations } = await import('../../src/main/database/migrate')
  await runMigrations()
})
