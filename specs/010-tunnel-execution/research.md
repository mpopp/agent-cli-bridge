# Research: Tunnel Execution

**Feature**: `010-tunnel-execution` | **Date**: 2026-04-03

## Resolved Decisions

### 1. Child Process Management in Electron Main Process

**Decision**: Use Node.js `child_process.spawn()` (not `exec` or `execFile`) to launch the tunnel command.

**Rationale**: `spawn` streams stdout/stderr without buffering, supports long-running processes, and returns a `ChildProcess` handle with `.pid`, `.kill()`, and event listeners (`close`, `error`). `exec` buffers output and is designed for short-lived commands. `execFile` requires a direct binary path. `spawn` with `shell: true` allows the full command string (including arguments) to be passed as-is, matching user expectations.

**Alternatives considered**:
- `execFile`: Rejected — requires splitting command into binary + args array; user-entered commands are arbitrary strings.
- `exec`: Rejected — buffers output, not suitable for long-running processes.
- External library (e.g., `execa`): Rejected — adds a dependency; Node.js built-in `spawn` is sufficient.

---

### 2. Graceful Shutdown Pattern (SIGTERM → SIGKILL)

**Decision**: On shutdown (or config removal/switch), send `SIGTERM` to the child process and wait up to 5 seconds. If the process has not exited, send `SIGKILL`.

**Rationale**: Constitution Principle I explicitly mandates "SIGKILL after a brief SIGTERM grace period." The spec assumption sets the timeout at 5 seconds. This is implemented via `setTimeout` + `process.kill(pid, 'SIGKILL')` if the `close` event has not fired. On Windows, `SIGTERM` is not supported natively; `child.kill()` maps to `TerminateProcess` which is equivalent to SIGKILL — acceptable for this use case.

**Alternatives considered**:
- SIGKILL immediately: Rejected — does not allow the tunnel process to clean up its own connections.
- Longer timeout (30s): Rejected — spec says "reasonable timeout"; 5 seconds is the stated assumption and sufficient for CLI tunnel tools.

---

### 3. IPC Push: webContents.send vs BrowserWindow reference

**Decision**: Use `BrowserWindow.getAllWindows()[0]?.webContents.send(channel, payload)` to push state changes from main to renderer.

**Rationale**: The app is single-window. `BrowserWindow.getAllWindows()` is the idiomatic Electron approach when the window reference is not directly available in the service layer. The alternative of passing the `BrowserWindow` reference into the manager creates tight coupling. A callback/event emitter pattern in the manager (emitting to ipc.ts which holds the window ref) is cleaner but adds indirection without benefit at this scale.

**Alternatives considered**:
- Pass `BrowserWindow` reference to `TunnelProcessManager`: Rejected — couples the process manager to Electron's window lifecycle.
- Node.js `EventEmitter` in manager + listener in ipc.ts that calls `webContents.send`: Valid pattern, chosen as the actual implementation to keep the manager testable without Electron imports.

---

### 4. State Machine Design

**Decision**: Four states represented as a TypeScript string union type (not a class-based state machine):
- `'running'` — process is alive
- `'stopped'` — process exited unexpectedly (exit code received after normal operation)
- `'error'` — process failed to start (spawn `error` event fired)
- `'not_configured'` — no active tunnel configuration exists

**Rationale**: Four states with simple linear transitions do not warrant a full state machine library. A plain enum/union + switch statement is sufficient, readable, and testable. The `TunnelProcessManager` holds the current state and emits it on every transition.

**Alternatives considered**:
- XState or similar library: Rejected — overkill for 4 states with simple transitions.
- Boolean flags (`isRunning`, `hasError`): Rejected — ambiguous combinations; a single discriminated state is clearer.

---

### 5. Integration with Existing tunnel.service.ts (setActive / remove)

**Decision**: The `TunnelProcessManager` is a singleton instantiated in `ipc.ts` (or `index.ts`). The existing `setActiveTunnel` and `removeTunnelConfig` IPC handlers are updated to call `manager.stop()` before the DB operation, then `manager.start(newConfig)` after (for setActive).

**Rationale**: The process manager must be called synchronously before DB mutations to satisfy FR-010 (stop before delete) and FR-008 (stop before switching). Placing this logic in the IPC handler layer keeps `tunnel.service.ts` focused on DB operations and the process manager focused on process lifecycle.

**Alternatives considered**:
- Integrate stop/start into `tunnel.service.ts`: Rejected — mixes DB concerns with process lifecycle; harder to test independently.

---

### 6. Renderer Subscription Pattern

**Decision**: The renderer subscribes to `tunnel-execution:stateChanged` via `window.api.tunnelExecution.onStateChanged(callback)` exposed through the preload. On component mount, it also calls `window.api.tunnelExecution.getState()` to get the current state synchronously (avoids a flash of "Not Configured" before the first push arrives).

**Rationale**: Push-only would cause a brief incorrect state on page load. A `getState` invoke + push subscription pattern is the standard Electron approach for stateful background services.

**Alternatives considered**:
- Poll via `setInterval`: Rejected — wasteful; push is more responsive and efficient.
- Push only (no initial getState): Rejected — causes incorrect initial UI state until first push.
