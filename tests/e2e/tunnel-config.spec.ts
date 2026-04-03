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
  window = await electronApp.firstWindow()
  await window.waitForLoadState('domcontentloaded')

  // Navigate to Connection Configuration page
  await window.getByRole('link', { name: /connection/i }).click()
  await window.waitForSelector('h6:has-text("Tunnel")')
})

test.afterEach(async () => {
  await electronApp.close()
})

test('tunnel section is visible on Connection Configuration page', async () => {
  await expect(window.locator('h6:has-text("Tunnel")')).toBeVisible()
  await expect(window.getByRole('button', { name: /^add$/i })).toBeVisible()
})

test('Add button is always enabled; Edit, Remove, Use are disabled when nothing selected', async () => {
  await expect(window.getByRole('button', { name: /^add$/i })).toBeEnabled()
  await expect(window.getByRole('button', { name: /^edit$/i })).toBeDisabled()
  await expect(window.getByRole('button', { name: /^remove$/i })).toBeDisabled()
  await expect(window.getByRole('button', { name: /^use$/i })).toBeDisabled()
})

test('can add a new tunnel configuration', async () => {
  await window.getByRole('button', { name: /^add$/i }).click()
  await expect(window.getByText('Add Tunnel Configuration')).toBeVisible()

  await window.getByLabel('Name').fill('Test Tunnel')
  await window.getByLabel('Command').fill('ssh -L 8080:localhost:80 user@host')
  await window.getByRole('button', { name: /^save$/i }).click()

  await expect(window.getByText(/tunnel configuration added successfully/i)).toBeVisible()
  // Verify the new entry appears in the dropdown options
  await window.getByRole('combobox').nth(1).click()
  await expect(window.getByRole('option', { name: 'Test Tunnel' }).first()).toBeVisible()
  await window.keyboard.press('Escape')
})

test('shows validation errors when saving empty fields', async () => {
  await window.getByRole('button', { name: /^add$/i }).click()
  await window.getByRole('button', { name: /^save$/i }).click()

  await expect(window.getByText('Name is required')).toBeVisible()
  await expect(window.getByText('Command is required')).toBeVisible()
  // Dialog stays open
  await expect(window.getByText('Add Tunnel Configuration')).toBeVisible()
})

test('full tunnel config lifecycle: add → edit → use → remove → empty state', async () => {
  // Add
  await window.getByRole('button', { name: /^add$/i }).click()
  await window.getByLabel('Name').fill('Lifecycle Tunnel')
  await window.getByLabel('Command').fill('ssh -L 9090:localhost:90 user@host')
  await window.getByRole('button', { name: /^save$/i }).click()
  await expect(window.getByText(/tunnel configuration added successfully/i)).toBeVisible()

  // Select the new entry
  await window.getByRole('combobox').nth(1).click()
  await window.getByRole('option', { name: 'Lifecycle Tunnel' }).first().click()

  // Edit
  await window.getByRole('button', { name: /^edit$/i }).click()
  await expect(window.getByText('Edit Tunnel Configuration')).toBeVisible()
  await expect(window.getByLabel('Name')).toHaveValue('Lifecycle Tunnel')
  await window.getByLabel('Name').fill('Lifecycle Tunnel Updated')
  await window.getByRole('button', { name: /^save$/i }).click()
  await expect(window.getByText(/tunnel configuration updated successfully/i)).toBeVisible()

  // Select updated entry
  await window.getByRole('combobox').nth(1).click()
  await window.getByRole('option', { name: 'Lifecycle Tunnel Updated' }).first().click()

  // Use
  await window.getByRole('button', { name: /^use$/i }).click()
  await expect(window.getByText(/tunnel configuration set as active/i)).toBeVisible()

  // Remove
  await window.getByRole('button', { name: /^remove$/i }).click()
  await expect(window.getByText('Remove Tunnel Configuration?')).toBeVisible()
  await window.getByRole('button', { name: /^remove$/i }).last().click()
  await expect(window.getByText(/tunnel configuration removed successfully/i)).toBeVisible()

  // Buttons should be disabled after removal (no selection)
  await expect(window.getByRole('button', { name: /^edit$/i })).toBeDisabled()
  await expect(window.getByRole('button', { name: /^remove$/i })).toBeDisabled()
  await expect(window.getByRole('button', { name: /^use$/i })).toBeDisabled()
})

test('active tunnel is pre-selected on page reload', async () => {
  // Add and activate a tunnel
  await window.getByRole('button', { name: /^add$/i }).click()
  await window.getByLabel('Name').fill('Active Tunnel')
  await window.getByLabel('Command').fill('ssh -L 7070:localhost:70 user@host')
  await window.getByRole('button', { name: /^save$/i }).click()
  await window.getByRole('combobox').nth(1).click()
  await window.getByRole('option', { name: 'Active Tunnel' }).first().click()
  await window.getByRole('button', { name: /^use$/i }).click()
  await expect(window.getByText(/tunnel configuration set as active/i)).toBeVisible()

  // Navigate away and back
  await window.getByRole('link', { name: /history/i }).click()
  await window.getByRole('link', { name: /connection/i }).click()
  await window.waitForSelector('h6:has-text("Tunnel")')

  // Active tunnel should be pre-selected
  const combobox = window.getByRole('combobox').nth(1)
  await expect(combobox).toContainText('Active Tunnel')

  // Cleanup
  await window.getByRole('button', { name: /^remove$/i }).click()
  await window.getByRole('button', { name: /^remove$/i }).last().click()
})
