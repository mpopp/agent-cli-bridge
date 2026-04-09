import { BlocklistEntry } from './types';

export const BLOCKLIST: ReadonlyArray<BlocklistEntry> = Object.freeze([
  // 1. Filesystem destruction
  {
    pattern: /\b(?:rm|del|erase|rd)\s+(?:-[a-zA-Z]*\s+)?(?:\/|[A-Za-z]:[\\/])/i,
    category: 'Filesystem destruction',
    severity: 'critical'
  },
  {
    pattern: />\s*\/dev\/(?!null|stdin|stdout|stderr|fd\/)[a-z0-9]+/i,
    category: 'Filesystem destruction',
    severity: 'critical'
  },

  // 2. Fork bombs
  {
    pattern: /:\(\)\s*\{\s*:\|:&\s*\};\s*:/,
    category: 'Fork bombs',
    severity: 'critical'
  },
  
  // 3. System shutdown/reboot
  {
    pattern: /\b(?:shutdown|reboot|halt|poweroff|init\s+0|init\s+6)\b/i,
    category: 'System shutdown/reboot',
    severity: 'critical'
  },
  
  // 4. Kernel manipulation
  {
    pattern: /\b(?:rmmod|insmod|modprobe|kexec)\b/i,
    category: 'Kernel manipulation',
    severity: 'high'
  },
  
  // 5. Bootloader modification
  {
    pattern: /\b(?:grub-install|update-grub|efibootmgr|bcdedit)\b/i,
    category: 'Bootloader modification',
    severity: 'critical'
  },
  
  // 6. Firewall deactivation
  {
    pattern: /\b(?:ufw\s+disable|iptables\s+-F|systemctl\s+(?:stop|disable)\s+firewalld)\b/i,
    category: 'Firewall deactivation',
    severity: 'high'
  },
  
  // 7. Network disruption
  {
    pattern: /\b(?:ifconfig\s+.*down|ip\s+link\s+set\s+.*down|nmcli\s+n\s+off)\b/i,
    category: 'Network disruption',
    severity: 'high'
  },
  
  // 8. Disk/partition manipulation
  {
    pattern: /\b(?:mkfs|fdisk|parted|sfdisk|dd\s+if=.*of=\/dev\/)\b/i,
    category: 'Disk/partition manipulation',
    severity: 'critical'
  },
  
  // 9. Permission escalation on critical paths
  {
    pattern: /\b(?:chmod|chown|chgrp)\s+(?:-R\s+)?(?:777|a\+rwx|000)\s+(?:\/|\/etc|\/bin|\/sbin|\/usr|\/var|\/root)(?:\s|$)/i,
    category: 'Permission escalation on critical paths',
    severity: 'critical'
  },
  
  // 10. Test pattern (for testing purposes only)
  {
    pattern: /^echo this is a blocked command$/i,
    category: 'Test pattern',
    severity: 'test'
  },

  // 11. Dangerous command + critical path combinations
  {
    pattern: /\b(?:mv|cp|echo|cat|shred)\s+.*(?:\/etc\/passwd|\/etc\/shadow|\/etc\/sudoers|\/root\/\.ssh|\/dev\/(?:mem|kmem|port|sda|hda|nvme))\b/i,
    category: 'Dangerous command + critical path combinations',
    severity: 'critical'
  }
]);
