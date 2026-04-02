import { SecurityEngine } from './engine'
import { BlocklistCheck } from './checks/blocklist-check'
import { AppError } from '../errors/AppError'

const engine = new SecurityEngine([new BlocklistCheck()])

export const validateCommand = (command: string): void => {
  const verdict = engine.validate(command)
  if (!verdict.allowed) {
    throw new AppError(403, 'FORBIDDEN', `Command blocked by security rules: ${verdict.reason ?? 'Policy violation.'}`)
  }
}
