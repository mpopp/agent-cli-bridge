import validator from 'validator';

export function normalizeInput(input: string): string {
  if (!input) return '';

  // 1. Strip zero-width characters and common invisible unicode formatting chars
  let normalized = input.replace(/[\u200B-\u200D\uFEFF]/g, '');

  // 2. Normalize unicode (e.g., combining characters)
  // We use NFKC to normalize compatibility characters (homoglyphs) to their standard forms where possible
  if (typeof normalized.normalize === 'function') {
    normalized = normalized.normalize('NFKC');
  }

  // 3. Strip shell comments (anything after unescaped #)
  // A naive implementation: if there's a # not preceded by a \, ignore the rest.
  // Note: This is naive and might strip # inside quotes, but for a blocklist, it's acceptable
  // if it errs on the side of caution (though here we might miss a payload if it's after a #,
  // but # genuinely starts a comment in bash). We'll do a simple replace.
  normalized = normalized.replace(/(^|\s)#.*/g, '');

  // 4. Collapse whitespace
  normalized = normalized.replace(/\s+/g, ' ');

  // 5. Remove quotes (single and double) to prevent quote-injection evasion
  // e.g. r""m -r""f /
  // We remove quotes from the normalized form so the blocklist regexes can match the bare commands easily.
  // However, removing quotes might mangle some genuine arguments. We'll strip them to ensure blocklist matching.
  normalized = normalized.replace(/['"]/g, '');

  // 6. Basic sanitization using validator (optional/lightweight here, mostly relying on our regexes)
  // Validator's stripLow removes ASCII control characters (like \x00-\x1F).
  normalized = validator.stripLow(normalized, true); // true keeps \n, but we already collapsed whitespace

  return normalized.trim();
}
