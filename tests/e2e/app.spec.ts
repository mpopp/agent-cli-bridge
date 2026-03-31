import { test, expect, _electron as electron } from '@playwright/test'

test('app launches and shows title', async () => {
  const electronApp = await electron.launch({ args: ['.', '--no-sandbox'] })
  const window = await electronApp.firstWindow()

  await window.waitForLoadState('domcontentloaded')
  const title = await window.title()
  expect(title).toBe('Agent CLI Bridge')

  await electronApp.close()
})
