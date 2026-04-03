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

  // Navigate to Connection Configuration page
  await window.getByRole('link', { name: /connection/i }).click()
  await window.waitForSelector('h6:has-text("Tunnel")')
})

test.afterEach(async () => {
  await electronApp.close()
})

test('Tunnel chip shows Not Configured when no active tunnel config exists', async () => {
  // Ensure no active config by checking chip label — fresh DB has no configs
  await expect(window.getByText('Not Configured')).toBeVisible()
})

test('Tunnel chip shows Running after activating a tunnel config with a valid command', async () => {
  // Add a tunnel config using a long-running command
  await window.getByRole('button', { name: /^add$/i }).click()
  await window.getByLabel('Name').fill('E2E Execution Tunnel')
  await window.getByLabel('Command').fill('sleep 30')
  await window.getByRole('button', { name: /^save$/i }).click()
  await expect(window.getByText(/tunnel configuration added successfully/i)).toBeVisible()

  // Select and activate it
  await window.getByRole('combobox').nth(1).click()
  await window.getByRole('option', { name: 'E2E Execution Tunnel' }).first().click()
  await window.getByRole('button', { name: /^use$/i }).click()
  await expect(window.getByText(/tunnel configuration set as active/i)).toBeVisible()

  // Chip should update to Running (use nth(1) — nth(0) is the REST server chip which may also show Running)
  await expect(window.getByText('Running').last()).toBeVisible({ timeout: 5000 })

  // Cleanup: remove the config (also stops the process)
  await window.getByRole('button', { name: /^remove$/i }).click()
  await window.getByRole('button', { name: /^remove$/i }).last().click()
  await expect(window.getByText(/tunnel configuration removed successfully/i)).toBeVisible()
})

test('Tunnel chip shows Not Configured after removing the active tunnel config', async () => {
  // Add and activate a tunnel config
  await window.getByRole('button', { name: /^add$/i }).click()
  await window.getByLabel('Name').fill('E2E Remove Tunnel')
  await window.getByLabel('Command').fill('sleep 30')
  await window.getByRole('button', { name: /^save$/i }).click()
  await expect(window.getByText(/tunnel configuration added successfully/i)).toBeVisible()

  await window.getByRole('combobox').nth(1).click()
  await window.getByRole('option', { name: 'E2E Remove Tunnel' }).first().click()
  await window.getByRole('button', { name: /^use$/i }).click()
  await expect(window.getByText('Running').last()).toBeVisible({ timeout: 5000 })

  // Remove the active config
  await window.getByRole('button', { name: /^remove$/i }).click()
  await window.getByRole('button', { name: /^remove$/i }).last().click()
  await expect(window.getByText(/tunnel configuration removed successfully/i)).toBeVisible()

  // Chip should revert to Not Configured
  await expect(window.getByText('Not Configured')).toBeVisible({ timeout: 5000 })
})
