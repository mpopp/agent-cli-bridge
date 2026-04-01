# Interface Contracts: Execution History (IPC)

## IPC: `execution-history`

Exposes the audit logs to the renderer process.

### Commands

#### `getLogs(filter: ExecutionFilter): ExecutionLogEntry[]`
- **Arguments**:
  - `limit`: Number of records to return (default 50).
  - `offset`: Records to skip (default 0).
  - `status`: One of `['all', 'executed', 'blocked']`.
- **Returns**: Array of `ExecutionLogEntry`.

#### `clearLogs(): boolean`
- **Arguments**: None.
- **Returns**: `true` on success.

### Types

```typescript
export interface ExecutionLogEntry {
  id: number;
  timestamp: string; // ISO-8601
  command: string;
  cwd: string;
  exitCode: number | null;
  duration: number | null;
  status: 'executed' | 'blocked' | 'running';
  blockReason: string | null;
  stdoutPreview: string | null;
  stderrPreview: string | null;
}

export interface ExecutionFilter {
  limit?: number;
  offset?: number;
  status?: 'all' | 'executed' | 'blocked';
}
```

## UI/Component Contract

- **Sidebar Navigation**: Permanent left-aligned drawer.
  - Link: `Execution History` (Active by default, route: `/`)
  - Link: `About` (Route: `/about`)

- **History Table**:
  - Truncated `command` with `Tooltip` for full string.
  - `StatusChip` based on `status`.
  - On click, expand row to show `stdoutPreview`, `stderrPreview`, and `blockReason`.
