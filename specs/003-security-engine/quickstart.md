# Quickstart: Security Engine

The Security Engine is a pure TypeScript module within the Electron Main process and requires no external services to test.

## Running Tests
To verify the Security Engine and its blocklist validation logic:

```bash
npm run test
```

## Basic Usage Example

```typescript
import { SecurityEngine } from './src/main/security/engine';
import { BlocklistCheck } from './src/main/security/checks/blocklist.check';

// Initialize the engine with the blocklist check
const securityEngine = new SecurityEngine([new BlocklistCheck()]);

// Validate a safe command
const safeVerdict = securityEngine.validate('echo "hello world"');
console.log(safeVerdict); 
// { allowed: true }

// Validate a destructive command
const blockedVerdict = securityEngine.validate('rm -rf /');
console.log(blockedVerdict);
// { allowed: false, reason: 'Command matched blocklist category: Filesystem destruction', matchedRule: 'rm\\s+-r.*\\s+/', checkName: 'BlocklistCheck' }
```
