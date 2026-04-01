import { describe, it, expect } from 'vitest';
import { SecurityEngine } from '../../../src/main/security/engine';
import { BlocklistCheck } from '../../../src/main/security/checks/blocklist.check';

describe('Security Engine - Blocklist', () => {
  const engine = new SecurityEngine([new BlocklistCheck()]);

  it('allows safe commands', () => {
    expect(engine.validate('echo "hello world"').allowed).toBe(true);
    expect(engine.validate('ls -la').allowed).toBe(true);
    expect(engine.validate('rm myfile.txt').allowed).toBe(true); // not destructive
  });

  describe('blocks destructive commands', () => {
    const destructiveCommands = [
      'rm -rf /',
      'rm -rf /etc',
      'rm -rf C:\\',
      'echo "data" > /dev/sda1',
      ':(){ :|:& };:',
      'shutdown -h now',
      'reboot',
      'init 0',
      'modprobe malicious',
      'rmmod some_module',
      'update-grub',
      'ufw disable',
      'iptables -F',
      'ifconfig eth0 down',
      'mkfs.ext4 /dev/sda1',
      'dd if=/dev/zero of=/dev/sda',
      'chmod -R 777 /',
      'chmod 000 /etc',
      'cat /etc/passwd > /tmp/pass'
    ];

    for (const cmd of destructiveCommands) {
      it(`blocks "${cmd}"`, () => {
        const verdict = engine.validate(cmd);
        expect(verdict.allowed).toBe(false);
        expect(verdict.reason).toContain('Command matched blocklist category:');
      });
    }
  });
});
