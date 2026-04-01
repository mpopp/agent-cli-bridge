import { describe, it, expect } from 'vitest';
import { splitAndExtractCommands } from '../../../src/main/security/utils/split-commands';

describe('splitAndExtractCommands', () => {
  it('splits by semicolons and operators', () => {
    const segments = splitAndExtractCommands('echo 1; echo 2 && echo 3 || echo 4 | grep 1');
    expect(segments).toContain('echo 1');
    expect(segments).toContain('echo 2');
    expect(segments).toContain('echo 3');
    expect(segments).toContain('echo 4');
    expect(segments).toContain('grep 1');
  });

  it('strips sudo', () => {
    const segments = splitAndExtractCommands('sudo rm -rf /');
    expect(segments).toContain('rm -rf /');
    expect(segments).not.toContain('sudo rm -rf /');
  });

  it('extracts eval, bash -c, and sh -c', () => {
    const segments = splitAndExtractCommands('eval "rm -rf /"');
    expect(segments).toContain('rm -rf /');
    
    const segments2 = splitAndExtractCommands('bash -c \'rm -rf /etc\'');
    expect(segments2).toContain('rm -rf /etc');
  });

  it('extracts backticks and $()', () => {
    const segments = splitAndExtractCommands('echo $(rm -rf /)');
    expect(segments).toContain('rm -rf /');

    const segments2 = splitAndExtractCommands('echo `rm -rf /`');
    expect(segments2).toContain('rm -rf /');
  });
});
