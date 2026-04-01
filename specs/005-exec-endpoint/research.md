# Research: POST /exec Endpoint

## Technical Context Unknowns
No significant unknowns. The technology stack is defined in the constitution (Node.js 22.x, Express 5.x, better-sqlite3).

## Decisions
- **Executor Module**: Node.js `child_process.spawn`.
- **Rationale**: `spawn` allows us to capture stdout/stderr incrementally and enforce max output limits by tracking the byte length in real-time, safely terminating the process (e.g. via `SIGKILL`) if exceeded. This avoids buffering arbitrarily large outputs in memory compared to `exec`.
- **Alternatives considered**: `child_process.exec` buffers everything in memory and has a built-in `maxBuffer` option, but `spawn` provides more granular control for timeouts and streaming which is crucial for safety.

- **Configuration DB**: Use `better-sqlite3` to store execution configuration.
- **Rationale**: The project constitution mandates SQLite via `better-sqlite3` for the local database, ensuring consistent data access patterns without ORM overhead.
