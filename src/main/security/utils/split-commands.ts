export function splitAndExtractCommands(input: string): string[] {
  const segments = new Set<string>();

  // Helper to add segments after trimming and removing sudo
  const addSegment = (cmd: string) => {
    let clean = cmd.trim();
    if (!clean) return;
    
    // Strip leading sudo or su -c
    clean = clean.replace(/^(?:sudo|su(?:\s+-c)?)\s+/i, '').trim();
    if (clean) {
      segments.add(clean);
    }
  };

  // 1. First, extract subshells and nested commands to analyze them independently
  
  // Extract $(...)
  const parenSubshells = [...input.matchAll(/\$\(([^)]+)\)/g)];
  for (const match of parenSubshells) {
    if (match[1]) addSegment(match[1]);
  }

  // Extract `...`
  const backtickSubshells = [...input.matchAll(/`([^`]+)`/g)];
  for (const match of backtickSubshells) {
    if (match[1]) addSegment(match[1]);
  }

  // Extract sh -c "...", bash -c "...", eval "..."
  const evalSubshells = [...input.matchAll(/(?:bash|sh|eval)\s+(?:-c\s+)?(?:'([^']+)'|"([^"]+)"|([^;"\s]+))/ig)];
  for (const match of evalSubshells) {
    const inner = match[1] || match[2] || match[3];
    if (inner) addSegment(inner);
  }

  // 2. Split the main input by shell operators (;, &&, ||, |)
  // This is a naive split that doesn't respect quotes, but for a blocklist 
  // it's safer to over-split than under-split.
  const basicSegments = input.split(/;|&&|\|\||\|/);
  for (const seg of basicSegments) {
    addSegment(seg);
  }

  return Array.from(segments);
}
