# Implementation Plan: Tunnel Execution

**Branch**: `010-tunnel-execution` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-tunnel-execution/spec.md`

## Summary

When the application starts and an active tunnel configuration exists, the configured command is spawned as a background child process. A new "Tunnel" status chip is added to the UI (next to the renamed "Rest Server" chip) reflecting one of four states: Running, Stopped, Error, Not Configured. State changes are pushed from the Electron main process to the renderer via `webContents.send`. When the user switches or removes the active tunnel config, the running process is stopped first. On application shutdown, the process is gracefully terminated (SIGTERM) with a 5-second timeout before SIGKILL.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js (Electron 35+), React 19
**Primary Dependencies**: Electron (child_process via Node.js), React 19, MUI v7, i18next
**Storage**: No new DB schema; reads active tunnel config from existing `tunnel_configs` table
**Testing**: Vitest (unit), Playwright (E2E)
**Target Platform**: Desktop (Electron, macOS/Windows/Linux)
**Performance Goals**: State change reflected in UI within 500ms; config switch completes in under 2 seconds
**Constraints**: Electron security hardening (contextIsolation, no nodeIntegration); all IPC via preload/contextBridge; child process must never outlive the application (constitution Principle I fail-safe)
**Scale/Scope**: Single tunnel process at a time; single-user local app

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|---|---|---|
| I. User Safety First | ✅ PASS | Constitution explicitly mandates fail-safe child process termination (SIGTERM + SIGKILL). This feature implements exactly that pattern for the tunnel process. |
| II. Defense in Depth | ✅ PASS | No new security layers affected. Tunnel command is user-configured and executed as-is (same trust model as the existing exec feature). |
| III. OpenAPI First | ✅ PASS | No new REST API endpoints. Feature is entirely Electron IPC + UI. |
| IV. TDD | ✅ PASS | Unit tests for TunnelProcessManager; E2E tests for UI state chip behaviour. CHANGELOG entry required as last DoD task. |
| V. Simplicity | ✅ PASS | Single process manager class, one IPC push channel, one state enum. No over-engineering. |
| VI. Transparency | ✅ PASS | Tunnel state is visible in the UI chip at all times. No hidden background activity. |
| Electron Security | ✅ PASS | New IPC push channel exposed via preload/contextBridge only. `ipcRenderer.on` wrapped in preload; renderer never touches ipcRenderer directly. |

No gate violations. No NEEDS CLARIFICATION items.

## Project Structure

### Documentation (this feature)

```text
specs/010-tunnel-execution/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── services/
│   │   ├── tunnel.service.ts              # existing — add stopActiveTunnel(), integrate process manager
│   │   └── tunnel-process-manager.ts     # new — child process lifecycle, state machine, push notifications
│   └── api/
│       └── ipc.ts                         # existing — add tunnel-execution:getState handler; wire manager lifecycle
├── preload/
│   ├── index.ts                           # existing — expose tunnelExecution.onStateChanged + getState
│   └── index.d.ts                         # existing — add TunnelProcessState type + tunnelExecution API
├── renderer/
│   ├── pages/
│   │   └── ConnectionConfig.tsx           # existing — integrate setActive/remove with process manager via IPC
│   └── components/
│       └── StatusChips.tsx                # new — rename chip + add Tunnel chip, subscribe to state push
│   └── i18n/locales/en/
│       └── common.json                    # existing — add tunnel execution i18n keys
└── types/
    └── ipc.ts                             # existing — add TunnelProcessState type

tests/
├── unit/
│   └── services/
│       └── tunnel-process-manager.test.ts # new
└── e2e/
    └── tunnel-execution.spec.ts           # new
```

**Structure Decision**: Single project. New `TunnelProcessManager` class in `src/main/services/` follows the existing service layer pattern. IPC push uses `BrowserWindow.getAllWindows()[0].webContents.send(...)` consistent with Electron best practices for single-window apps.

## Complexity Tracking

> No constitution violations to justify.
