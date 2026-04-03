import { test, expect, _electron as electron } from '@playwright/test'
import { E2E_DB_PATH } from './e2e-db-path'

test('app launches and shows title', async () => {
  const electronApp = await electron.launch({
    args: ['.', '--no-sandbox'],
    env: { ...process.env, AGENT_CLI_BRIDGE_DB_PATH: E2E_DB_PATH }
  })
  const window = await electronApp.firstWindow()

  await window.waitForLoadState('domcontentloaded')
  const title = await window.title()
  expect(title).toBe('Agent CLI Bridge')

  await electronApp.close()
})
