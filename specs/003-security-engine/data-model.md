# Data Model: Security Engine

This module uses pure TypeScript interfaces with no database entities.

## Entities

### `CommandContext`
Object passed through the chain of responsibility.
- `rawInput: string` (original command string)
- `normalizedInput: string` (after normalization)
- `segments: string[]` (array of split commands)

### `SecurityVerdict`
Object representing the outcome of validation.
- `allowed: boolean`
- `reason?: string`
- `matchedRule?: string`
- `checkName?: string`

### `SecurityCheck`
Interface for individual checks in the chain.
- `readonly name: string`
- `validate(context: CommandContext): SecurityVerdict`

### `BlocklistEntry`
Represents an individual rule in the blocklist.
- `pattern: RegExp`
- `category: string`
- `severity: 'high' | 'critical'`
