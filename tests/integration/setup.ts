import { vi, beforeAll } from 'vitest'
import { tmpdir } from 'os'
import { join } from 'path'
import { mkdirSync } from 'fs'

const workerId = process.env.VITEST_WORKER_ID ?? '0'
const workerTmpDir = join(tmpdir(), `agent-cli-bridge-test-worker-${workerId}`)

vi.mock('electron', async () => {
  const { createElectronMock } = await import('../helpers/electron-mock')
  return createElectronMock(() => workerTmpDir)
})

beforeAll(async () => {
  mkdirSync(workerTmpDir, { recursive: true })
  const { runMigrations } = await import('../../src/main/database/migrate')
  await runMigrations()
})
