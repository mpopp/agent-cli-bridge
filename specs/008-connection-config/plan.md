# Implementation Plan: Connection Configuration

**Branch**: `008-connection-config` | **Date**: 2026-04-02 | **Spec**: `/specs/008-connection-config/spec.md`
**Input**: Feature specification from `/specs/008-connection-config/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a full-stack Connection Configuration feature. Users can view the server status, change the bind address (with warnings for LAN access), change the server port with validation, and view/regenerate their masked API key. Server settings changes will restart the server, while API key changes are applied immediately. All UI text will be localized via i18next.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22.x LTS  
**Primary Dependencies**: Electron, Express.js 5.x, React 19.x, Material UI (MUI), TanStack Router, better-sqlite3, i18next, native Node.js built-ins (`net` module)
**Storage**: SQLite (via better-sqlite3), unencrypted relying on standard OS permissions  
**Testing**: Vitest, Playwright  
**Target Platform**: Desktop (Linux/macOS/Windows via Electron)
**Project Type**: Desktop Application  
**Performance Goals**: Instant API key regeneration, fast server restart <1s.  
**Constraints**: Port range 1024-65535, immediate validation if port is available.  
**Scale/Scope**: Single connection configuration entry.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

1. **Simplicity**: Avoid unnecessary abstractions. (Yes, direct IPC and simple configuration form)
2. **Security**: Validate port before restart and warn about 0.0.0.0 bind. Regenerate API keys securely and immediately without restart. (Yes)
3. **Auditability**: NA for config, but status updates show current state. (Yes)

## Project Structure

### Documentation (this feature)

```text
specs/008-connection-config/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── ipc.ts           # IPC interface definitions
└── tasks.md             # Phase 2 output (future)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── api/             # Express server logic
│   ├── database/        # Database connection & config retrieval
│   └── services/        # Config and Server services
├── preload/             # Electron context bridge
├── renderer/
│   ├── components/      # UI components (API Key display, forms)
│   ├── pages/           # ConnectionConfig page
│   └── i18n/            # Localization
└── types/               # Shared TS interfaces
```

**Structure Decision**: Single project with main/preload/renderer split.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

(No violations identified at this stage)
