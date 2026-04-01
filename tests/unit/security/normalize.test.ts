import { describe, it, expect } from 'vitest';
import { normalizeInput } from '../../../src/main/security/utils/normalize';

describe('normalizeInput', () => {
  it('collapses whitespace', () => {
    expect(normalizeInput('rm   -rf    /')).toBe('rm -rf /');
    expect(normalizeInput('  echo  hello   ')).toBe('echo hello');
  });

  it('removes zero-width characters', () => {
    expect(normalizeInput('r\u200Bm -r\u200Bf /')).toBe('rm -rf /');
  });

  it('strips quotes', () => {
    expect(normalizeInput('r"m" -r\'f\' /')).toBe('rm -rf /');
  });

  it('removes shell comments', () => {
    expect(normalizeInput('rm -rf / # destructive command')).toBe('rm -rf /');
  });
});
