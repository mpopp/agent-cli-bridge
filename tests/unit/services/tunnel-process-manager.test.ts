import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { EventEmitter } from 'events'
import { TunnelProcessManager } from '../../../src/main/services/tunnel-process-manager'

vi.mock('../../../src/main/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() }
}))

const mockConfig = { id: 1, name: 'test', command: 'sleep 999', isActive: true, createdAt: '', updatedAt: '' }

function makeMockProcess() {
  const proc = new EventEmitter() as ReturnType<typeof import('child_process').spawn>
  ;(proc as unknown as { kill: ReturnType<typeof vi.fn> }).kill = vi.fn()
  return proc
}

vi.mock('child_process', () => ({
  spawn: vi.fn()
}))

describe('TunnelProcessManager', () => {
  let manager: TunnelProcessManager
  let spawnMock: ReturnType<typeof vi.fn>

  beforeEach(async () => {
    const cp = await import('child_process')
    spawnMock = cp.spawn as unknown as ReturnType<typeof vi.fn>
    spawnMock.mockReset()
    manager = new TunnelProcessManager()
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('starts process and transitions state to running', () => {
    const proc = makeMockProcess()
    spawnMock.mockReturnValue(proc)

    const states: string[] = []
    manager.on('stateChanged', ({ state }) => states.push(state))

    manager.start(mockConfig)

    expect(spawnMock).toHaveBeenCalledWith('sleep', ['999'], expect.any(Object))
    expect(manager.getState()).toBe('running')
    expect(states).toContain('running')
  })

  it('does not start a second process if already running', () => {
    const proc = makeMockProcess()
    spawnMock.mockReturnValue(proc)

    manager.start(mockConfig)
    manager.start(mockConfig)

    expect(spawnMock).toHaveBeenCalledTimes(1)
  })

  it('transitions to idle after intentional stop', async () => {
    const proc = makeMockProcess()
    ;(proc as unknown as { kill: ReturnType<typeof vi.fn> }).kill = vi.fn().mockImplementation(() => {
      setTimeout(() => proc.emit('close', 0), 10)
    })
    spawnMock.mockReturnValue(proc)

    manager.start(mockConfig)
    await manager.stop()

    expect(manager.getState()).toBe('idle')
  })

  it('transitions to stopped on unexpected process exit', () => {
    const proc = makeMockProcess()
    spawnMock.mockReturnValue(proc)

    const states: string[] = []
    manager.on('stateChanged', ({ state }) => states.push(state))

    manager.start(mockConfig)
    proc.emit('close', 1)

    expect(manager.getState()).toBe('stopped')
    expect(states).toContain('stopped')
  })

  it('transitions to error on process error event', () => {
    const proc = makeMockProcess()
    spawnMock.mockReturnValue(proc)

    const states: string[] = []
    manager.on('stateChanged', ({ state }) => states.push(state))

    manager.start(mockConfig)
    proc.emit('error', new Error('ENOENT'))

    expect(manager.getState()).toBe('error')
    expect(states).toContain('error')
  })

  it('sends SIGKILL after 5s timeout if process does not exit', async () => {
    vi.useFakeTimers()
    const proc = makeMockProcess()
    const killMock = vi.fn()
    ;(proc as unknown as { kill: ReturnType<typeof vi.fn> }).kill = killMock
    spawnMock.mockReturnValue(proc)

    manager.start(mockConfig)
    const stopPromise = manager.stop()

    // SIGTERM sent immediately
    expect(killMock).toHaveBeenCalledWith('SIGTERM')

    // Advance 5 seconds — SIGKILL should fire
    vi.advanceTimersByTime(5000)
    expect(killMock).toHaveBeenCalledWith('SIGKILL')

    // Resolve the stop promise by emitting close
    proc.emit('close', 0)
    await stopPromise

    vi.useRealTimers()
  })
})
