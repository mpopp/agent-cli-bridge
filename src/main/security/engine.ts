import { SecurityCheck, CommandContext, SecurityVerdict } from './types';
import { splitAndExtractCommands } from './utils/split-commands';
import { normalizeInput } from './utils/normalize';

export class SecurityEngine {
  private checks: SecurityCheck[];

  constructor(checks: SecurityCheck[]) {
    this.checks = checks;
  }

  public validate(command: string): SecurityVerdict {
    if (command.length > 10000) {
      return {
        allowed: false,
        reason: 'Command rejected: exceeded maximum allowed length of 10,000 characters',
        checkName: 'SecurityEngine'
      };
    }

    const normalized = normalizeInput(command);
    
    const context: CommandContext = {
      rawInput: command,
      normalizedInput: normalized,
      segments: splitAndExtractCommands(normalized)
    };

    for (const check of this.checks) {
      const verdict = check.validate(context);
      if (!verdict.allowed) {
        return verdict; // Stop on first block
      }
    }

    return { allowed: true };
  }
}
