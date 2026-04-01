import { SecurityCheck, CommandContext, SecurityVerdict } from '../types';
import { BLOCKLIST } from '../blocklist';

export class BlocklistCheck implements SecurityCheck {
  public readonly name = 'BlocklistCheck';

  public validate(context: CommandContext): SecurityVerdict {
    const inputsToTest = [context.rawInput, context.normalizedInput, ...context.segments];
    
    for (const testStr of inputsToTest) {
      if (!testStr) continue;
      
      for (const entry of BLOCKLIST) {
        if (entry.pattern.test(testStr)) {
          return {
            allowed: false,
            reason: `Command matched blocklist category: ${entry.category}`,
            matchedRule: entry.pattern.source,
            checkName: this.name
          };
        }
      }
    }

    return { allowed: true };
  }
}
