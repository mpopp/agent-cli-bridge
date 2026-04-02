import { vi } from 'vitest'

export function createElectronMock(getPathImpl: (name: string) => string = () => '/tmp') {
  return {
    app: {
      getPath: vi.fn().mockImplementation(getPathImpl),
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
  }
}
