import express from 'express'
import { AppServerConfig } from '../services/config.service'
import { logger } from '../logger'
import { errorHandler } from './middleware/errorHandler'
import { notFoundHandler } from './middleware/notFoundHandler'
import { authMiddleware } from './middleware/auth'
import { healthHandler } from './routes/health'
import { execHandler } from './routes/exec'
import { join } from 'path'

export const app = express()

// Middleware to parse JSON
app.use(express.json())

// Serve OpenAPI Spec
app.get('/openapi.yaml', (req, res) => {
  // In development it's at project root, in production it might be different, 
  // but for now we serve it statically if we can.
  // Actually, we can just sendFile using an absolute path.
  // We'll use __dirname going up to find it.
  res.sendFile(join(__dirname, '../../../../openapi.yaml'))
})

// Protected Routes
app.get('/health', authMiddleware, healthHandler)
app.post('/exec', authMiddleware, execHandler)

app.use(notFoundHandler)
app.use(errorHandler)

let serverInstance: ReturnType<typeof app.listen> | null = null

export const startServer = (config: AppServerConfig): Promise<void> => {
  return new Promise((resolve, reject) => {
    try {
      serverInstance = app.listen(config.port, '127.0.0.1', () => {
        logger.info({ port: config.port }, 'Express server listening on 127.0.0.1')
        resolve()
      })
      serverInstance.on('error', (err) => {
        logger.error({ err }, 'Express server error')
        reject(err)
      })
    } catch (err) {
      reject(err)
    }
  })
}

export const stopServer = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (serverInstance) {
      serverInstance.close((err) => {
        if (err) {
          reject(err)
        } else {
          serverInstance = null
          resolve()
        }
      })
    } else {
      resolve()
    }
  })
}
