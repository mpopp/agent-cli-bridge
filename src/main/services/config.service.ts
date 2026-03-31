import crypto from 'crypto'
import net from 'net'
import { getServerConfig, upsertServerConfig } from '../database/config'
import { logger } from '../logger'

export interface AppServerConfig {
  port: number
  apiKey: string
}

const checkPortFree = (port: number): Promise<boolean> => {
  return new Promise((resolve) => {
    const server = net.createServer()
    server.once('error', () => {
      resolve(false)
    })
    server.listen(port, '127.0.0.1', () => {
      server.close(() => {
        resolve(true)
      })
    })
  })
}

const findFreePort = async (): Promise<number> => {
  for (let port = 3000; port <= 5000; port++) {
    if (await checkPortFree(port)) {
      return port
    }
  }
  // Fallback to random OS port
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.listen(8098, '127.0.0.1', () => {
      const address = server.address()
      if (address && typeof address === 'object') {
        const port = address.port
        server.close(() => resolve(port))
      } else {
        server.close(() => reject(new Error('Failed to get address')))
      }
    })
    server.once('error', reject)
  })
}

export const initServerConfig = async (): Promise<AppServerConfig> => {
  const existingConfig = getServerConfig()
  
  let port: number
  let apiKey: string
  let needsUpdate = false

  if (existingConfig) {
    apiKey = existingConfig.apiKey
    const isFree = await checkPortFree(existingConfig.port)
    if (isFree) {
      port = existingConfig.port
    } else {
      logger.warn({ port: existingConfig.port }, 'Saved port is occupied. Finding a new port.')
      port = await findFreePort()
      needsUpdate = true
    }
  } else {
    logger.info('No server config found. Initializing new config.')
    port = await findFreePort()
    apiKey = crypto.randomUUID()
    needsUpdate = true
  }

  if (needsUpdate) {
    upsertServerConfig(port, apiKey)
  }

  return { port, apiKey }
}
