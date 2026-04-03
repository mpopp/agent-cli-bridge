# agent-cli-bridge Constitution

## Core Principles

### I. User Safety First (NON-NEGOTIABLE)

This application exposes the user's machine to AI agents via command execution. Safety MUST be prioritized above all other concerns.

- A **hardcoded blocklist** of destructive commands MUST exist as an immutable, auditable module (`src/main/security/blocklist.ts`). Includes: disk formatting (`mkfs`, `fdisk`, `parted`, `dd` on block devices), recursive root deletion (`rm -rf /`), partition table and boot sector manipulation.
- The blocklist is NOT editable by user, API, or agent. It is the **first check** in the execution pipeline, before any user-configurable rules.
- Tests MUST assert rejection without executing destructive commands. No real filesystem operations in tests.
- Default for unconfigured directories: **block**. User may change to "ask" but never "allow".
- All command executions MUST be logged to an immutable audit log, including denied attempts.
- **Fail-safe:** On crash or shutdown, ALL child processes MUST be terminated (SIGTERM then SIGKILL). No orphaned processes may survive the parent.

### II. Defense in Depth

Security MUST be layered. No single mechanism may be the sole protection.

| Layer | Mechanism | Rule |
|-------|-----------|------|
| 1 | Hardcoded blocklist | Immutable, in code. Overrides ALL other layers. |
| 2 | Directory scoping | Agents operate only in registered directories. Unregistered = blocked. |
| 3 | Per-directory rules | Whitelist/blacklist with pattern matching per registered directory. |
| 4 | Execution modes | `strict` (whitelist only), `supervised` (non-whitelisted → approval prompt), `brave` (non-whitelisted → warning logged). |
| 5 | Resource limits | Per-execution timeout (default 30s) and output buffer limit (default 10 MB). |

#### Electron Security Hardening

Mandatory BrowserWindow settings (MUST NOT be overridden):
- `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`, `webSecurity: true`
- Renderer ↔ Main communication exclusively via preload script (`src/preload/index.ts`) using `contextBridge.exposeInMainWorld()`
- CSP on Renderer: `'self'` only, no `unsafe-inline`/`unsafe-eval`
- `@electron/remote` is prohibited

### III. OpenAPI First

The REST API is the primary integration surface for AI agent platforms. The OpenAPI spec is both design contract and deliverable.

- **No endpoint without an OpenAPI description.** Spec first → implement second → validate against spec.
- `openapi.yaml` at repo root is the single source of truth. Served at `GET /openapi.yaml` by the running application.
- Spec MUST include: operation descriptions for AI agent consumption, request/response schemas with examples, error schemas, auth requirements.
- Spec version MUST match the application version (SemVer).

### IV. Test-Driven Development

All features MUST be developed test-first.

- **Definition of Done (NON-NEGOTIABLE):** A feature is ONLY complete when:
  1. **All tests green** — `npm test` (runs `test:unit` + `test:e2e`) passes with zero failures.
  2. **CHANGELOG updated** — entry under `[Unreleased]` (Added / Changed / Fixed / etc.).
  3. **Version bumped** — `package.json` incremented per SemVer (PATCH/MINOR/MAJOR).
  These MUST be explicit tasks in every feature's `tasks.md`.
- **Coverage targets:** ≥90% for security-critical modules (blocklist, validation, permissions). Critical paths only for frontend.
- **Test pyramid:** Unit > Integration > E2E.
- **Test commands:** `npm run test:unit` (Vitest), `npm run test:e2e` (Playwright), `npm test` (both).
- Security tests MUST assert rejection without executing destructive commands.

### V. Simplicity and Incrementalism

Start simple, ship working increments, add complexity only when justified by a concrete user need.

- No feature is added "for later" unless it is behind a clear interface boundary and costs near-zero to maintain.
- YAGNI applies. Speculative abstractions are not permitted.
- Each feature MUST be deliverable as a self-contained increment that leaves the application in a working state.
- Deferred features (see below) are out of scope until a constitution amendment promotes them.

### VI. Transparency and Auditability

The user MUST always understand what is happening on their machine and what has happened in the past.

- Every command execution attempt (successful, denied, or approval-pending) MUST be recorded in the audit log with: timestamp, command, working directory, initiator (API key identifier), result (exit code or denial reason), and execution duration.
- The UI MUST provide a clear, searchable command history and audit log view.
- Security configuration (registered directories, whitelist/blacklist rules, execution modes) MUST be visible and editable in the UI with clear explanations of what each setting does.
- The approval flow MUST show the full command, the working directory, and which rule triggered the approval request before the user decides.
- The OpenAPI spec MUST be downloadable from the UI dashboard, so the user can hand it to any AI agent platform without searching the filesystem.

### VII. Pragmatic Layered Architecture

- **Route/IPC handlers** — thin; request parsing, validation, response formatting only.
- **Service layer** — orchestrates business logic; calls Security Engine, Executor, and DB repositories.
- **Security Engine** (`src/main/security/`) — pure logic, MUST NOT import Express, Electron, or SQLite. Zero external dependencies.
- **Executor** (`src/main/executor/`) — child process management, isolated from API concerns.
- **Database repositories** (`src/main/database/`) — thin data access over SQLite. Direct better-sqlite3 usage. SQL is only allowed here.
- **No speculative abstractions.** Extract interfaces only when a second implementation exists.
- **No Use-Case classes.** Business operations are functions in service modules.

## Technology Stack

| Layer                | Technology              | Note                                               |
| -------------------- | ----------------------- | -------------------------------------------------- |
| Runtime              | Node.js                 | 22.x LTS                                           |
| Language             | TypeScript              | 5.x, strict mode                                   |
| Desktop framework    | Electron                | Latest stable                                      |
| Build tooling        | electron-vite           | Vite-based build for Electron                      |
| UI                   | React 19 + MUI          | @mui/material                                      |
| Routing (Frontend)   | TanStack Router         | Latest stable                                      |
| Internationalization | i18next + react-i18next | Latest stable                                      |
| REST API             | Express.js 5.x          | Runs inside Electron Main Process                  |
| API specification    | OpenAPI 3.1             | `openapi.yaml` at repo root                        |
| Database             | SQLite (better-sqlite3) | Stored in `app.getPath('userData')`                |
| Logging              | pino                    | JSON structured logging                            |
| Testing              | Vitest + Playwright     | Unit/integration + E2E                             |
| Linting/Formatting   | ESLint + Prettier       | Flat config                                        |

## Project Structure

New files within existing directories do not require a constitution amendment. New top-level directories or architectural layers DO require one.

```
agent-cli-bridge/
├── openapi.yaml              # Single source of truth for API contract
├── CHANGELOG.md              # Keep a Changelog format
├── src/
│   ├── main/                 # Electron Main Process
│   │   ├── api/              # Express REST API (routes/, middleware/)
│   │   ├── services/         # Business logic orchestration
│   │   ├── security/         # Security engine (PURE — no framework imports)
│   │   ├── executor/         # Child process management
│   │   ├── database/         # SQLite data access (migrations via db-migrate)
│   │   └── ipc/              # IPC handlers for Renderer
│   ├── renderer/             # Electron Renderer (React + MUI)
│   │   ├── components/       # Shared components
│   │   ├── pages/            # Page-level views
│   │   ├── routes/           # TanStack Router definitions
│   │   └── i18n/             # i18next config + locales/
│   ├── preload/              # contextBridge IPC API
│   └── types/                # Shared TypeScript types
├── tests/                    # unit/ + integration/ + e2e/
└── .specify/                 # Spec-Driven Development artifacts
```

## Conventions

- **File naming:** kebab-case for all files and directories
- **Exports:** Named exports only, no default exports
- **Error handling:** Custom `AppError` class with error codes and severity levels
- **API responses:** Envelope format `{ data, error, meta }` on all endpoints
- **API authentication:** API key via `X-API-Key` header; key generated on first launch, stored in config DB
- **API binding:** `127.0.0.1` only — never exposed to the network
- **Logging:** pino with JSON output; file transport to `app.getPath('userData')/logs/` in production, pretty-print in development
- **Database location:** `app.getPath('userData')/agent-cli-bridge.db` — never in the project directory
- **Database migrations:** db-migrate (https://db-migrate.readthedocs.io) MUST be used. Sequential numbered files, run on startup. No other migration mechanism allowed.
- **Internationalization:** All user-facing strings MUST use i18next translation keys. No hardcoded UI strings.
- **Versioning:** SemVer. Per-feature bumps are part of the DoD (see Principle IV). At release, `[Unreleased]` in CHANGELOG is promoted to a version label.
- **Changelog:** Keep a Changelog format. Categories: Added, Changed, Deprecated, Removed, Fixed, Security.
- **Commit messages:** Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`)
- **Branching:** Feature branches off `main`, squash merge via PR

## Platform Support

Primary: Linux (x64, arm64). Planned: macOS, Windows. Platform-specific code MUST be isolated behind a platform abstraction. Shell defaults: `/bin/bash` (Linux/macOS), `cmd.exe` (Windows).

## Governance

- This constitution is the single source of truth for architectural decisions and project principles.
- All specs and plans MUST be validated against these principles. A spec that violates a principle MUST either be revised or the constitution MUST be amended first.
- **Amendments** require: (1) a documented rationale, (2) impact analysis on existing features, (3) update to this file with version bump.
- **Version policy:**
  - MAJOR: Principle removed or fundamentally redefined
  - MINOR: New principle or section added, material expansion
  - PATCH: Clarifications, wording fixes, non-semantic refinements
- Security principles (I, II) may only be amended to become **more restrictive**, never less.

**Version**: 2.3.0 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-04-03
