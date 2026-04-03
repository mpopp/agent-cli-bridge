import { unlinkSync } from 'fs'
import { E2E_DB_PATH } from './e2e-db-path'

export default function globalSetup() {
  try {
    unlinkSync(E2E_DB_PATH)
  } catch {
    // File doesn't exist yet — nothing to clean up
  }
}
