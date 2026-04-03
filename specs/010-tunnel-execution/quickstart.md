# Quickstart: Tunnel Execution

**Feature**: `010-tunnel-execution` | **Date**: 2026-04-03

## What This Feature Does

Automatically executes the active tunnel configuration's command as a background child process when the application starts. Displays a "Tunnel" status chip in the UI showing one of four states: Running, Stopped, Error, Not Configured. Handles process lifecycle for config switching, config removal, and application shutdown.

---

## Implementation Order

### Phase 1 — Foundation (no UI yet)

1. **Add `TunnelProcessState` and `TunnelStateChangedPayload` types** to `src/types/ipc.ts`
2. **Create `TunnelProcessManager`** in `src/main/services/tunnel-process-manager.ts`
   - `start(configId, command)` — spawns child process, sets state to `running`, emits `stateChanged`
   - `stop()` — sends SIGTERM, waits 5s, sends SIGKILL if needed, resolves when process exits
   - `getState()` / `getStatePayload()` — returns current state
   - Emits `stateChanged` event on every transition
3. **Wire manager into `ipc.ts`**
   - Instantiate `TunnelProcessManager` singleton
   - Add `tunnel-execution:getState` invoke handler
   - Subscribe to manager `stateChanged` event → push via `webContents.send`
   - Update `tunnel-config:setActive` handler: call `manager.stop()` then DB update then `manager.start()`
   - Update `tunnel-config:remove` handler: call `manager.stop()` if removing active config, then DB delete
4. **Start tunnel on app startup** in `src/main/index.ts` (or equivalent entry point)
   - After DB init, read active tunnel config and call `manager.start()` if present
   - Register `app.on('before-quit')` / `app.on('will-quit')` hook to call `manager.stop()`

### Phase 2 — Preload & Types

5. **Update `src/preload/index.ts`** — expose `tunnelExecution.onStateChanged` and `tunnelExecution.getState`
6. **Update `src/preload/index.d.ts`** — add `tunnelExecution` type declarations

### Phase 3 — UI

7. **Update `src/renderer/i18n/locales/en/common.json`** — add tunnel execution i18n keys (`tunnel_execution.status_running`, `tunnel_execution.status_stopped`, `tunnel_execution.status_error`, `tunnel_execution.status_not_configured`, `tunnel_execution.chip_label`)
8. **Rename "Rest Server" chip and add "Tunnel" chip** in the top-right status area
   - Subscribe to `window.api.tunnelExecution.onStateChanged`
   - Call `window.api.tunnelExecution.getState()` on mount for initial state
   - Map `TunnelProcessState` to chip colour: `running` → green, `stopped` → orange, `error` → red, `not_configured` → grey

### Phase 4 — Tests & DoD

9. **Unit tests** — `tests/unit/services/tunnel-process-manager.test.ts`
   - Mock `child_process.spawn`; test all state transitions
10. **E2E tests** — `tests/e2e/tunnel-execution.spec.ts`
    - Test chip renders "Not Configured" with no active config
    - Test chip renders "Running" after setting active config
    - Test chip updates after config switch
11. **Update `CHANGELOG.md`** under `[Unreleased]` — last DoD task

---

## Key Files Changed

| File | Change |
|---|---|
| `src/types/ipc.ts` | Add `TunnelProcessState`, `TunnelStateChangedPayload` |
| `src/main/services/tunnel-process-manager.ts` | **New** — process lifecycle manager |
| `src/main/api/ipc.ts` | Wire manager; update setActive/remove handlers; add getState handler |
| `src/main/index.ts` | Start tunnel on app init; register shutdown hook |
| `src/preload/index.ts` | Expose `tunnelExecution` API |
| `src/preload/index.d.ts` | Add `tunnelExecution` type declarations |
| `src/renderer/i18n/locales/en/common.json` | Add tunnel execution i18n keys |
| `src/renderer/` (status chip area) | Rename chip; add Tunnel chip with state subscription |
| `tests/unit/services/tunnel-process-manager.test.ts` | **New** — unit tests |
| `tests/e2e/tunnel-execution.spec.ts` | **New** — E2E tests |
| `CHANGELOG.md` | Add entry under `[Unreleased]` |

---

## Integration Points with Feature 009

- **`getActiveTunnelConfig()`** (from `src/main/database/config.ts`) — called on startup to determine if a tunnel should be started
- **`tunnel-config:setActive` IPC handler** — must call `manager.stop()` + `manager.start()` around the DB update
- **`tunnel-config:remove` IPC handler** — must call `manager.stop()` before DB delete if the removed config is active
- The `TunnelProcessManager` does **not** modify the DB; it only reads the config passed to it

---

## UI Behaviour Summary

- Top-right corner shows two chips side by side: **"Rest Server"** (existing, renamed) and **"Tunnel"** (new)
- Tunnel chip colours:
  - 🟢 **Running** — process is alive
  - 🟠 **Stopped** — process exited unexpectedly
  - 🔴 **Error** — process failed to start
  - ⚫ **Not Configured** — no active tunnel config
- Chip updates in real-time via IPC push (target: within 500ms of state change)
- On page load, initial state is fetched via `getState()` invoke to avoid flash

---

## Test Commands

```bash
# Unit tests
npm run test:unit

# E2E tests
npx playwright test tests/e2e/tunnel-execution.spec.ts

# Lint
npm run lint
```
