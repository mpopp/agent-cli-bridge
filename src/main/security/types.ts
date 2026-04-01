export interface CommandContext {
  rawInput: string;
  normalizedInput: string;
  segments: string[];
}

export interface SecurityVerdict {
  allowed: boolean;
  reason?: string;
  matchedRule?: string;
  checkName?: string;
}

export interface SecurityCheck {
  readonly name: string;
  validate(context: CommandContext): SecurityVerdict;
}

export interface BlocklistEntry {
  pattern: RegExp;
  category: string;
  severity: 'high' | 'critical';
}
