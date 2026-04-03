# Data Model: Tunnel Execution

**Feature**: `010-tunnel-execution` | **Date**: 2026-04-03

## Overview

This feature introduces no new database tables. It operates entirely on the existing `tunnel_configs` table (from feature `009-tunnel-config`) and manages an in-memory process state. The data model consists of TypeScript types and the internal state tracker.

---

## TypeScript Types

### TunnelProcessState (new — `src/types/ipc.ts`)

```typescript
export type TunnelProcessState =
  | 'running'
  | 'stopped'
  | 'error'
  | 'not_configured'
```

**Values**:
| Value | Meaning |
|---|---|
| `'running'` | Tunnel process is alive and executing |
| `'stopped'` | Process exited unexpectedly after having started |
| `'error'` | Process failed to start (spawn error event) |
| `'not_configured'` | No active tunnel configuration exists |

---

### TunnelStateChangedPayload (new — `src/types/ipc.ts`)

```typescript
export interface TunnelStateChangedPayload {
  state: TunnelProcessState
  pid?: number        // present when state === 'running'
  exitCode?: number   // present when state === 'stopped'
  error?: string      // present when state === 'error'
}
```

---

## Internal State Tracker (`src/main/services/tunnel-process-manager.ts`)

The `TunnelProcessManager` class maintains the following internal state:

| Field | Type | Description |
|---|---|---|
| `_state` | `TunnelProcessState` | Current state of the tunnel process |
| `_process` | `ChildProcess \| null` | Reference to the spawned child process |
| `_configId` | `number \| null` | ID of the active tunnel config being executed |
| `_killTimer` | `NodeJS.Timeout \| null` | Timer for SIGKILL fallback during shutdown |

### Public Interface

```typescript
class TunnelProcessManager extends EventEmitter {
  // Start the tunnel process for the given command
  start(configId: number, command: string): void

  // Stop the running tunnel process (SIGTERM → SIGKILL after 5s)
  stop(): Promise<void>

  // Get the current state
  getState(): TunnelProcessState

  // Get the current state payload (for IPC getState invoke)
  getStatePayload(): TunnelStateChangedPayload

  // Event: 'stateChanged' emitted with TunnelStateChangedPayload on every transition
}
```

### State Transitions

```
not_configured ──start()──► running
running        ──close event (unexpected)──► stopped
running        ──error event──► error
running        ──stop()──► not_configured  (or 'stopped' transiently during switch)
stopped        ──start()──► running
error          ──start()──► running
```

---

## No Migration Required

The `tunnel_configs` table schema is unchanged. The `is_active` column (set by feature 009) is the sole source of truth for which config to execute on startup.
