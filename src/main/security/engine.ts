import { SecurityCheck, CommandContext, SecurityVerdict } from './types';
import { splitAndExtractCommands } from './utils/split-commands';
import { normalizeInput } from './utils/normalize';
import { logExecution } from '../services/history-service';

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
        logExecution({
          command,
          cwd: process.cwd(), // We don't have the exact cwd here unless passed, fallback to process.cwd()
          exitCode: null,
          duration: null,
          status: 'blocked',
          blockReason: verdict.reason ?? 'Blocked by security policy',
          stdoutPreview: null,
          stderrPreview: null
        });
        return verdict; // Stop on first block
      }
    }

    return { allowed: true };
  }
}
