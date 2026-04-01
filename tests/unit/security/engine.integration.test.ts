import { describe, it, expect } from 'vitest';
import { SecurityEngine } from '../../../src/main/security/engine';
import { BlocklistCheck } from '../../../src/main/security/checks/blocklist.check';

describe('SecurityEngine Integration & Performance', () => {
  const engine = new SecurityEngine([new BlocklistCheck()]);

  it('rejects commands over 10000 characters', () => {
    const longCmd = 'a'.repeat(10001);
    const verdict = engine.validate(longCmd);
    expect(verdict.allowed).toBe(false);
    expect(verdict.reason).toContain('exceeded maximum allowed length');
  });

  it('processes normal commands in under 10ms', () => {
    const commands = [
      'echo "hello world"',
      'rm -rf /',
      'sudo bash -c "rm -rf /etc"',
      'ls -la; cat /etc/passwd | grep root'
    ];

    for (const cmd of commands) {
      const start = performance.now();
      engine.validate(cmd);
      const end = performance.now();
      expect(end - start).toBeLessThan(10);
    }
  });

  it('end-to-end evasion tests: homoglyphs and subshells', () => {
    // Zero-width spaces, subshells, quotes
    const evasionCmd = 'eval "r\u200Bm -r\'f\' /"';
    const verdict = engine.validate(evasionCmd);
    expect(verdict.allowed).toBe(false);
  });
});
