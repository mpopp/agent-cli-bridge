import { join } from 'path'
import { homedir } from 'os'

export const E2E_DB_PATH = join(
  homedir(),
  '.config',
  'agent-cli-bridge',
  'e2e-test-agent-cli-bridge.db'
)
