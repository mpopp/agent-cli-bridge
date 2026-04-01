import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { logger } from './logger'
import { getDb, closeDb } from './database/connection'
import { runMigrations } from './database/migrate'
import { initServerConfig } from './services/config.service'
import { startServer, stopServer } from './api/server'
import { cleanupOldLogs } from './services/history-service'
import { setupIpcHandlers } from './api/ipc'

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env.NODE_ENV === 'development' && process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  logger.info('Application starting...')

  try {
    getDb()
    await runMigrations()
    const config = await initServerConfig()
    await startServer(config)
    await cleanupOldLogs()
    setupIpcHandlers()
  } catch (error) {
    logger.error({ error }, 'Failed to initialize database')
    app.quit()
    return
  }

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('quit', async () => {
  await stopServer()
  closeDb()
  logger.info('Application exiting')
})
