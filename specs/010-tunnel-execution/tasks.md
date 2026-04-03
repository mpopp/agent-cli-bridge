# Tasks: Tunnel Execution

**Input**: Design documents from `/specs/010-tunnel-execution/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

---

## Phase 1: Setup

**Goal**: Verify project structure and ignore files are correct before implementation.

- [ ] T001 Verify `.gitignore` contains `node_modules/`, `dist/`, `out/`, `*.log`, `.env*` — add any missing patterns

---

## Phase 2: Foundational

**Goal**: Establish the `TunnelProcessManager` class and TypeScript types that all user stories depend on.

- [ ] T002 Add `TunnelProcessState` union type and `TunnelStateChangedPayload` interface to `src/types/ipc.ts`
- [ ] T003 Create `src/main/services/tunnel-process-manager.ts` implementing `TunnelProcessManager` class with `start(config)`, `stop()`, `getState()` methods and internal state machine (idle → running → stopped/error) using `child_process.spawn`; emit state changes via EventEmitter
- [ ] T004 Add graceful shutdown logic to `TunnelProcessManager`: send SIGTERM on `stop()`, wait up to 5 seconds, then SIGKILL if process has not exited; handle `close` and `error` events to transition state
- [ ] T005 Wire `TunnelProcessManager` singleton into `src/main/index.ts`: on app `ready`, read active tunnel config via `getActiveTunnelConfig()` and call `tunnelManager.start(config)` if one exists; on `before-quit`, call `tunnelManager.stop()` and await completion before allowing quit

---

## Phase 3: User Story 1 — Automatic Tunnel Execution on Startup (P1)

**Story Goal**: When the application starts with an active tunnel configuration, the tunnel command is executed automatically in the background.

**Independent Test Criteria**: Set an active tunnel config, launch the app, observe Tunnel chip shows "Running"; with no active config, chip shows "Not Configured".

- [ ] T006 [US1] Add IPC push from `TunnelProcessManager` to renderer: in `src/main/api/ipc.ts`, subscribe to manager's state-change events and call `BrowserWindow.getAllWindows()[0]?.webContents.send('tunnel-execution:stateChanged', payload)` with `TunnelStateChangedPayload`
- [ ] T007 [US1] Add `tunnel-execution:getState` invoke handler in `src/main/api/ipc.ts` returning `{ state: tunnelManager.getState() }`
- [ ] T008 [P] [US1] Expose `tunnelExecution` namespace in `src/preload/index.ts`: `getState(): Promise<{ state: TunnelProcessState }>` and `onStateChanged(cb): () => void` (returns cleanup function using `ipcRenderer.on` / `ipcRenderer.removeListener`)
- [ ] T009 [P] [US1] Add `tunnelExecution` type declarations to `src/preload/index.d.ts`
- [ ] T010 [US1] Add `tunnel.chip_not_configured`, `tunnel.chip_running`, `tunnel.chip_stopped`, `tunnel.chip_error`, and rename key `connection.status_chip_rest_server` to `src/renderer/i18n/locales/en/common.json`
- [ ] T011 [US1] Update `src/renderer/pages/ConnectionConfig.tsx` (or the layout component that renders the status chips): rename existing "Server Status" chip label to "Rest Server"; add a second "Tunnel" chip that subscribes to `window.api.tunnelExecution.onStateChanged` and initialises state via `window.api.tunnelExecution.getState()` on mount; display correct colour and label per state (Running=success, Stopped=warning, Error=error, Not Configured=default)

---

## Phase 4: User Story 2 — Real-time Tunnel Status Monitoring (P1)

**Story Goal**: The Tunnel chip updates in real time as the process state changes (unexpected stop, error on start).

**Independent Test Criteria**: Simulate process crash (kill PID externally); chip transitions from Running → Stopped without page reload.

- [ ] T012 [US2] Handle `close` event in `TunnelProcessManager` (in `src/main/services/tunnel-process-manager.ts`): if exit code is non-zero or process was not intentionally stopped, transition state to `stopped` and emit state-change event so the renderer chip updates automatically
- [ ] T013 [US2] Handle `error` event in `TunnelProcessManager` (in `src/main/services/tunnel-process-manager.ts`): transition state to `error` and emit state-change event; log error via `logger.error`

---

## Phase 5: User Story 3 — Dynamic Tunnel Configuration Switching (P2)

**Story Goal**: When the user activates a different tunnel config while the app is running, the old process stops and the new one starts immediately.

**Independent Test Criteria**: With tunnel running, click "Use" on a different config; old process stops, new one starts, chip updates to Running.

- [ ] T014 [US3] Update `tunnel-config:setActive` IPC handler in `src/main/api/ipc.ts`: after calling `setActiveTunnel(id)`, call `tunnelManager.stop()` then `tunnelManager.start(newConfig)` so the switch is atomic from the renderer's perspective
- [ ] T015 [US3] Update `tunnel-config:remove` IPC handler in `src/main/api/ipc.ts`: if the removed config is the currently active one (check `getActiveTunnelConfig()` before deletion), call `tunnelManager.stop()` before calling `removeTunnelConfig(id)`, ensuring no orphaned process remains

---

## Phase 6: User Story 4 — Clean Tunnel Teardown on Removal or Shutdown (P1)

**Story Goal**: Removing the active config or shutting down the app always terminates the tunnel process cleanly with no orphaned processes.

**Independent Test Criteria**: Remove active config → chip shows Not Configured, process gone from OS. Quit app → no tunnel process in `ps` output.

- [ ] T016 [US4] Verify `before-quit` handler in `src/main/index.ts` (added in T005) correctly awaits `tunnelManager.stop()` before `app.quit()` proceeds; add `app.on('before-quit', ...)` with `event.preventDefault()` + async stop + `app.quit()` pattern if not already present
- [ ] T017 [US4] Add `tunnelManager.stop()` call in `tunnel-config:remove` handler (in `src/main/api/ipc.ts`, coordinated with T015) and set chip to `not-configured` state by emitting a state-change event after stop completes

---

## Phase 7: Polish & Cross-Cutting Concerns

**Goal**: Tests, i18n completeness, lint, and CHANGELOG.

- [ ] T018 [P] Write unit tests for `TunnelProcessManager` in `tests/unit/services/tunnel-process-manager.test.ts`: cover start (spawns process, state → running), stop (sends SIGTERM, state → idle), unexpected exit (state → stopped), error event (state → error), SIGKILL fallback after 5s timeout
- [ ] T019 [P] Write E2E tests in `tests/e2e/tunnel-execution.spec.ts`: cover (1) app starts with active config → Tunnel chip shows Running, (2) no active config → chip shows Not Configured, (3) remove active config → chip shows Not Configured
- [ ] T020 Verify all i18n keys added in T010 are used in the UI and no keys are missing; run `npm run lint` and fix any issues
- [ ] T021 Update `CHANGELOG.md` under `[Unreleased]` → `### Added` with entry: "Tunnel Execution (auto-start tunnel process on launch, real-time status chip, clean shutdown)"

---

## Dependency Graph

```
T001 (setup)
  └─ T002 (types)
       └─ T003 (TunnelProcessManager core)
            └─ T004 (shutdown logic)
                 └─ T005 (wire into main/index.ts)
                      ├─ T006 (IPC push)        ← US1
                      ├─ T007 (IPC getState)    ← US1
                      ├─ T008 (preload expose)  ← US1 [P with T009]
                      ├─ T009 (preload types)   ← US1 [P with T008]
                      ├─ T010 (i18n keys)       ← US1
                      └─ T011 (UI chips)        ← US1
                           ├─ T012 (crash → Stopped)  ← US2
                           ├─ T013 (error → Error)    ← US2
                           ├─ T014 (setActive switch) ← US3
                           └─ T015 (remove stop)      ← US3
                                ├─ T016 (shutdown verify) ← US4
                                └─ T017 (remove chip reset) ← US4
                                     ├─ T018 [P] unit tests
                                     ├─ T019 [P] E2E tests
                                     ├─ T020 lint + i18n check
                                     └─ T021 CHANGELOG (LAST)
```

---

## Parallel Execution Examples

**US1 phase** (after T007 done):
- T008 (preload expose) and T009 (preload types) can run in parallel — different files

**Polish phase** (after T017 done):
- T018 (unit tests) and T019 (E2E tests) can run in parallel — different files

---

## Implementation Strategy

**MVP scope**: US1 + US4 (P1 stories) — auto-start on launch, Tunnel chip, clean shutdown. This delivers the core value: tunnel runs automatically and terminates cleanly.

**Incremental delivery**:
1. Phase 2 (foundation) → validates `TunnelProcessManager` works in isolation
2. Phase 3 (US1) → first visible feature: chip appears in UI
3. Phase 4 (US2) → real-time updates on unexpected stops
4. Phase 5 (US3) → config switching
5. Phase 6 (US4) → teardown guarantees
6. Phase 7 (polish) → tests + CHANGELOG

---

## Notes

- [P] tasks = different files, no dependencies on each other
- [Story] label maps task to specific user story for traceability
- T021 (CHANGELOG) MUST be the absolute last task — constitution DoD requirement
- `TunnelProcessManager` singleton must be created once in main process; avoid multiple instances
- On Windows, SIGTERM is not supported — use `process.kill(pid)` or `taskkill`; research.md decision: use `child.kill('SIGTERM')` which Electron/Node handles cross-platform
- Verify `src/preload/index.d.ts` exists before T009 (it was created in feature 009)
