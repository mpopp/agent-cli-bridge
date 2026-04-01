import DBMigrate from 'db-migrate'
import { join } from 'path'
import { getDbPath } from './connection'
import { logger } from '../logger'

export const runMigrations = async () => {
  logger.info('Running database migrations...')

  const migrationsDir = join(__dirname, 'migrations')

  const dbmigrate = DBMigrate.getInstance(true, {
    config: {
      dev: {
        driver: 'sqlite3',
        filename: getDbPath()
      }
    },
    cmdOptions: {
      'migrations-dir': migrationsDir
    }
  })

  dbmigrate.silence(true)

  try {
    await dbmigrate.up()
    logger.info('Database migrations completed successfully')
  } catch (error) {
    logger.error({ error }, 'Database migrations failed')
    throw error
  }
}
