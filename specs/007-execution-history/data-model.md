# Data Model: Execution History

## Entity: `execution_log`
Represents a single command execution request.

| Field | Type | Description |
|---|---|---|
| `id` | INTEGER (PK) | Unique identifier |
| `timestamp` | DATETIME | Time of the execution request |
| `command` | TEXT | The full command string |
| `cwd` | TEXT | Working directory |
| `exit_code` | INTEGER | Exit status (NULL if blocked or not yet finished) |
| `duration` | INTEGER | Execution duration in ms |
| `status` | TEXT | 'executed', 'blocked', 'running' |
| `block_reason` | TEXT | Reason for blocking (NULL if executed) |
| `stdout_preview` | TEXT (500) | First 500 chars of stdout |
| `stderr_preview` | TEXT (500) | First 500 chars of stderr |

## Validation Rules
- `timestamp`: Defaults to current UTC time.
- `status`: Must be one of `['executed', 'blocked', 'running']`.
- `stdout_preview`/`stderr_preview`: Truncated to 500 characters.

## Relationships
- None. This is a flat audit table.

## Retention Policy
- Records older than 90 days are deleted on application startup.

## Security & Encryption
- The database is unencrypted and relies on standard OS-level file permissions (NFR-001).
