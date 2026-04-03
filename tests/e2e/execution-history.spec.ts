import { test, expect, _electron as electron } from '@playwright/test'
import type { ElectronApplication, Page } from '@playwright/test'
import { E2E_DB_PATH } from './e2e-db-path'

let electronApp: ElectronApplication
let window: Page

test.beforeEach(async () => {
  electronApp = await electron.launch({
    args: ['.', '--no-sandbox'],
    env: { ...process.env, AGENT_CLI_BRIDGE_DB_PATH: E2E_DB_PATH }
  })
  window = await electronApp.waitForEvent('window', { timeout: 15000 })
  await window.waitForLoadState('domcontentloaded')

  // Navigate to Execution History page
  await window.getByRole('link', { name: /history/i }).click()
  await window.waitForSelector('h1')
})

test.afterEach(async () => {
  await electronApp.close()
})

test('real-time log update prepends new entry based on active filter', async ({ request }) => {
  // Clear existing logs
  const clearBtn = window.getByRole('button', { name: /clear/i })
  if (await clearBtn.isEnabled()) {
    await clearBtn.click()
    const confirmBtn = window.getByRole('button', { name: /yes/i })
    await confirmBtn.click()
  }

  // Get server config to find the correct port and API key
  const config = await window.evaluate(() => window.api.connectionConfig.getConfig())

  // Trigger a command execution via the REST API using Playwright's request fixture
  const response = await request.post(`http://127.0.0.1:${config.port}/exec`, {
    headers: {
      'x-api-key': config.apiKey
    },
    data: {
      command: 'echo "real-time-test"'
    }
  })
  
  if (!response.ok()) {
    console.error(await response.text())
  }
  expect(response.ok()).toBeTruthy()

  // The new entry should appear without manual refresh
  await expect(window.locator('td', { hasText: 'echo "real-time-test"' }).first()).toBeVisible()
})
