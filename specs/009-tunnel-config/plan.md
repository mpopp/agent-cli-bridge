# Implementation Plan: Tunnel Configuration

**Branch**: `009-tunnel-config` | **Date**: 2026-04-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-tunnel-config/spec.md`

## Summary

Add a "Tunnel" section to the Connection Configuration page that allows users to manage named tunnel configurations (Name + Command). Users can add, edit, remove, and activate tunnel configurations. The active tunnel is persisted in SQLite and pre-selected on page load. Implementation follows the existing Electron IPC + SQLite + React/MUI pattern.

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js (Electron 35+), React 19  
**Primary Dependencies**: Electron, React 19, MUI v7, better-sqlite3, db-migrate, i18next  
**Storage**: SQLite via better-sqlite3; new `tunnel_configs` table via db-migrate migration  
**Testing**: Vitest (unit + integration via `ELECTRON_RUN_AS_NODE=1`), Playwright (E2E)  
**Target Platform**: Desktop (Electron, macOS/Windows/Linux)  
**Project Type**: Desktop app (Electron + React renderer)  
**Performance Goals**: Instant UI response for CRUD operations (SQLite synchronous reads)  
**Constraints**: Electron security hardening (contextIsolation, no nodeIntegration); all IPC via preload/contextBridge  
**Scale/Scope**: Single-user local app; small number of tunnel configs expected

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle | Status | Notes |
|---|---|---|
| I. User Safety First | ✅ PASS | No command execution; tunnel config is stored metadata only. The tunnel command string is stored but never executed by this feature. |
| II. Defense in Depth | ✅ PASS | No security layers affected by this feature. |
| III. OpenAPI First | ✅ PASS | No new REST API endpoints. This is a UI-only feature using Electron IPC. |
| IV. TDD | ✅ PASS | Tests must be written; unit tests for repository/service, E2E for UI flows. |
| V. Simplicity | ✅ PASS | Straightforward CRUD with SQLite following existing patterns. |
| VI. Transparency | ✅ PASS | No audit log impact; tunnel config is not command execution. |
| Electron Security | ✅ PASS | All new IPC channels exposed via preload/contextBridge only. |

No gate violations. No NEEDS CLARIFICATION items.

## Project Structure

### Documentation (this feature)

```text
specs/009-tunnel-config/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── database/
│   │   ├── config.ts                          # existing — add tunnel CRUD functions
│   │   └── migrations/
│   │       ├── 20260403000000-tunnel-config.js          # new migration JS
│   │       └── sqls/
│   │           ├── 20260403000000-tunnel-config-up.sql  # new table + active state
│   │           └── 20260403000000-tunnel-config-down.sql
│   ├── services/
│   │   └── tunnel.service.ts                  # new — CRUD + active state logic
│   └── api/
│       └── ipc.ts                             # existing — add tunnel IPC handlers
├── preload/
│   ├── index.ts                               # existing — expose tunnel API
│   └── index.d.ts                             # existing — add tunnel types
├── renderer/
│   ├── pages/
│   │   └── ConnectionConfig.tsx               # existing — add Tunnel section
│   └── i18n/locales/en/
│       └── common.json                        # existing — add tunnel i18n keys
└── types/
    └── ipc.ts                                 # existing — add TunnelConfig types

tests/
├── unit/
│   └── tunnel.service.test.ts                 # new
└── e2e/
    └── tunnel-config.spec.ts                  # new
```

**Structure Decision**: Single project (Option 1). All new code follows the existing `src/main/database`, `src/main/services`, `src/main/api/ipc.ts`, `src/preload`, `src/renderer` layout.

## Complexity Tracking

> No constitution violations to justify.
