import pino from 'pino'
import { app } from 'electron'

const isDev = !app.isPackaged

export const logger = pino({
  level: isDev ? 'debug' : 'info',
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname'
        }
      }
    : undefined
})
