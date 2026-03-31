# agent-cli-bridge Constitution

## Core Principles

### I. User Safety First (NON-NEGOTIABLE)

This application exposes the user's local machine to AI agents via command execution. Every design decision MUST prioritize the safety and integrity of the user's system above all other concerns.

- A **hardcoded system-level blocklist** of destructive commands MUST exist in code. These commands can NEVER be executed, regardless of user configuration. This includes but is not limited to: disk formatting (`mkfs`, `fdisk`, `parted`, `dd` targeting block devices), recursive root deletion (`rm -rf /`), partition table manipulation, and boot sector modification. The canonical blocklist MUST be defined and reviewable in the first feature spec (Security Engine) and maintained as a dedicated, auditable module.
- The hardcoded blocklist MUST NOT be editable by the user, the API, or any agent.
- The hardcoded blocklist MUST be enforced as the **first check** in the execution pipeline, before any user-configurable rules are evaluated.
- **During development and testing**, destructive commands MUST NEVER be executed against the real filesystem. Tests for the blocklist MUST use assertion-based checks (verifying the command is rejected), NEVER actual execution. Test environments MUST be sandboxed.
- Default behavior for unconfigured directories: **block**. The user can change this global default to "ask" (approval flow) but never to "allow".
- All command executions MUST be logged to an immutable audit log, including denied attempts.
- **Fail-safe behavior:** On application crash or shutdown, ALL running child processes MUST be immediately terminated (SIGKILL after a brief SIGTERM grace period). No orphaned processes may survive the parent. This is non-negotiable — a runaway agent command MUST NOT outlive the application that authorized it.

### II. Defense in Depth

Security MUST be layered. No single mechanism may be the sole protection against harmful operations.

- **Layer 1 — Hardcoded blocklist**: System-level destructive commands blocked in code (immutable).
- **Layer 2 — Directory scoping**: Agents may only operate in explicitly registered directories. Unregistered directories are blocked by default.
- **Layer 3 — Per-directory rules**: Each registered directory has its own whitelist/blacklist with pattern matching (e.g., `git *` allowed, `rm *` denied).
- **Layer 4 — Execution modes**: Per-directory mode selection:
    - `strict` — only whitelisted commands execute; everything else is blocked.
    - `supervised` — whitelisted commands execute; non-whitelisted commands trigger a user approval prompt in the UI.
    - `brave` — whitelisted commands execute; non-whitelisted commands execute with a warning logged (for advanced users who accept the risk).
- **Layer 5 — Timeout and resource limits**: Configurable per-execution timeout (default: 30s) and output buffer limit (default: 10 MB) to prevent runaway processes.
- The hardcoded blocklist (Layer 1) overrides ALL other layers. A command on the hardcoded blocklist is rejected even if it matches a user whitelist in brave mode.

#### Electron Security Hardening

Electron introduces its own attack surface. The following settings are mandatory and MUST NOT be overridden:

- **`nodeIntegration: false`** in all BrowserWindow configurations. The Renderer process MUST NEVER have direct access to Node.js APIs.
- **`contextIsolation: true`** in all BrowserWindow configurations. The Renderer and Main process contexts MUST be fully isolated.
- **`sandbox: true`** for the Renderer process.
- Communication between Renderer and Main MUST go exclusively through the **preload script** (`src/preload/index.ts`), which exposes a minimal, explicitly defined API via `contextBridge.exposeInMainWorld()`.
- A **Content Security Policy (CSP)** MUST be set on the Renderer, restricting script sources to `'self'` and prohibiting `unsafe-inline` and `unsafe-eval`. External resource loading MUST be explicitly whitelisted if needed.
- **`webSecurity: true`** (default) — MUST NOT be disabled.
- No `remote` module usage. The `@electron/remote` package is prohibited.

### III. OpenAPI First

The REST API is the primary integration surface for AI agent platforms (ChatGPT, Langdock, etc.). The OpenAPI specification is both the design contract and the deliverable artifact.

- **No endpoint without an OpenAPI description.** Every endpoint MUST be fully described in the OpenAPI spec before implementation begins.
- The development sequence for any API change is: (1) update `openapi.yaml`, (2) review/approve the spec change, (3) implement the endpoint, (4) validate the implementation against the spec.
- The OpenAPI spec (`openapi.yaml`) lives at the repository root and is the single source of truth for the API contract.
- The spec MUST be served by the running application at a well-known endpoint (e.g., `GET /openapi.yaml`) so users can retrieve it from their dashboard and provide it directly to AI agent platforms.
- The spec MUST include: operation descriptions written for AI agent consumption (clear, unambiguous, action-oriented), request/response schemas with examples, error response schemas, and authentication requirements.
- Spec validation MUST run in CI (when CI is established) and during local development to catch drift between spec and implementation.
- The OpenAPI spec version MUST match the application version (SemVer). When a release changes the API, the spec version is bumped accordingly.

### IV. Test-Driven Development

All features MUST be developed test-first. The testing strategy reflects the risk profile of the application.

- **Backend (Main Process, API, Security):** Rigorous testing required. Unit test coverage target: ≥90% for security-critical modules (command validation, blocklist, directory scoping, permission engine). Integration tests for the full execution pipeline (request → validation → execution → response → audit log).
- **Frontend (Renderer):** Test critical user paths. Coverage target: critical paths only (security settings UI, approval flow, command history display).
- **E2E:** Playwright tests against the packaged Electron application to verify the full flow from UI interaction to command execution result.
- **Test pyramid:** Unit > Integration > E2E (many unit tests, fewer integration tests, minimal E2E tests).
- **Testing tools:**
    - Unit & Integration: **Vitest**
    - Component testing: **Vitest + React Testing Library**
    - E2E: **Playwright** (with Electron support)
- Security-related tests MUST assert rejection without executing the actual command. No test may invoke a destructive operation against any real or emulated system resource.

### V. Simplicity and Incrementalism

Start simple, ship working increments, add complexity only when justified by a concrete user need.

- No feature is added "for later" unless it is behind a clear interface boundary and costs near-zero to maintain.
- YAGNI applies. Speculative abstractions are not permitted.
- Each feature MUST be deliverable as a self-contained increment that leaves the application in a working state.
- Deferred features documented in this constitution (auto-updates, OIDC, WebSocket streaming) are explicitly out of scope until a future constitution amendment promotes them.

### VI. Transparency and Auditability

The user MUST always understand what is happening on their machine and what has happened in the past.

- Every command execution attempt (successful, denied, or approval-pending) MUST be recorded in the audit log with: timestamp, command, working directory, initiator (API key identifier), result (exit code or denial reason), and execution duration.
- The UI MUST provide a clear, searchable command history and audit log view.
- Security configuration (registered directories, whitelist/blacklist rules, execution modes) MUST be visible and editable in the UI with clear explanations of what each setting does.
- The approval flow MUST show the full command, the working directory, and which rule triggered the approval request before the user decides.
- The OpenAPI spec MUST be downloadable from the UI dashboard, so the user can hand it to any AI agent platform without searching the filesystem.

### VII. Pragmatic Layered Architecture

The application follows a pragmatic layered architecture. This is NOT Clean Architecture, DDD, or CQRS — those patterns are explicitly rejected as overengineered for this project's domain complexity.

- **Layer separation:**
    - **Route/IPC handlers** — thin; responsible only for request parsing, input validation, and response formatting.
    - **Service layer** — orchestrates business logic; calls into Security Engine, Executor, and Database repositories.
    - **Security Engine** (`src/main/security/`) — pure business logic, MUST NOT import Express, Electron, SQLite, or any framework. Receives plain data, returns plain decisions. This isolation is non-negotiable for testability.
    - **Executor** (`src/main/executor/`) — child process management, isolated from API concerns.
    - **Database repositories** (`src/main/database/`) — thin data access layer over SQLite. No repository interfaces or abstract factories — direct better-sqlite3 usage is permitted.
- **No speculative abstractions:** Do not create interfaces "in case we swap SQLite" or "in case we replace Express." Extract an interface only when a second implementation actually exists.
- **No Use-Case classes:** Business operations are functions in service modules, not single-method classes.
- **Dependency rule:** The Security Engine is the innermost layer and MUST have zero external dependencies. Everything else may pragmatically import its dependencies directly.

## Technology Stack

| Layer                    | Technology                     | Version/Note                                            |
| ------------------------ | ------------------------------ | ------------------------------------------------------- |
| Runtime                  | Node.js                        | 22.x LTS                                                |
| Language                 | TypeScript                     | 5.x, strict mode                                        |
| Desktop framework        | Electron                       | Latest stable                                           |
| Build tooling            | electron-vite                  | Vite-based build for Electron                           |
| UI framework             | React                          | 19.x                                                    |
| UI component library     | MUI (Material UI)              | Latest stable (@mui/material)                           |
| Routing (Frontend)       | TanStack Router                | Latest stable                                           |
| Data fetching (Frontend) | TanStack Query                 | Latest stable                                           |
| Forms (Frontend)         | TanStack Form                  | Latest stable                                           |
| Internationalization     | i18next + react-i18next        | Latest stable                                           |
| IPC                      | Electron IPC                   | Main ↔ Renderer communication                           |
| REST API                 | Express.js                     | 5.x, runs inside Electron Main Process                  |
| API specification        | OpenAPI                        | 3.1, spec file: `openapi.yaml` at repo root             |
| Database                 | SQLite                         | Via better-sqlite3, stored in `app.getPath('userData')` |
| Logging                  | pino                           | JSON-native structured logging                          |
| Package manager          | npm                            | Lockfile committed                                      |
| Unit/Integration testing | Vitest                         | —                                                       |
| Component testing        | Vitest + React Testing Library | —                                                       |
| E2E testing              | Playwright                     | With Electron support                                   |
| Linting                  | ESLint                         | Flat config                                             |
| Formatting               | Prettier                       | —                                                       |

## Project Structure

This structure defines the architectural boundaries and module responsibilities. New files within existing directories do not require a constitution amendment. New top-level directories or architectural layers DO require an amendment.

```
agent-cli-bridge/
├── openapi.yaml                 # OpenAPI 3.1 spec (single source of truth for API)
├── CHANGELOG.md                 # Keep a Changelog format
├── electron.vite.config.ts
├── package.json
├── tsconfig.json
├── src/
│   ├── main/                    # Electron Main Process
│   │   ├── index.ts             # App entry, window creation, child process cleanup
│   │   ├── api/                 # Express REST API
│   │   │   ├── server.ts        # Express app setup, middleware, serves openapi.yaml
│   │   │   ├── routes/          # Route handlers (thin)
│   │   │   └── middleware/      # Auth, logging, error handling
│   │   ├── services/            # Service layer (business logic orchestration)
│   │   ├── security/            # Security engine (PURE — no framework imports)
│   │   │   ├── blocklist.ts     # Hardcoded system blocklist (immutable)
│   │   │   ├── permissions.ts   # Directory scoping, whitelist/blacklist
│   │   │   ├── validator.ts     # Command validation pipeline
│   │   │   └── modes.ts         # Execution mode logic
│   │   ├── executor/            # Command execution
│   │   │   └── executor.ts      # Child process management, cleanup on exit
│   │   ├── database/            # SQLite data access (DB in app.getPath('userData'))
│   │   │   ├── connection.ts    # DB setup, migrations
│   │   │   ├── audit-log.ts     # Audit log repository
│   │   │   └── config.ts        # Configuration repository
│   │   └── ipc/                 # IPC handlers for Renderer
│   ├── renderer/                # Electron Renderer Process (React)
│   │   ├── index.html
│   │   ├── main.tsx             # React entry
│   │   ├── App.tsx
│   │   ├── components/          # React components (MUI-based)
│   │   ├── pages/               # Page-level views
│   │   │   ├── Dashboard.tsx
│   │   │   ├── SecuritySettings.tsx
│   │   │   ├── AuditLog.tsx
│   │   │   └── CommandHistory.tsx
│   │   ├── hooks/               # Custom React hooks
│   │   ├── routes/              # TanStack Router route definitions
│   │   ├── i18n/                # i18next configuration and translation files
│   │   │   ├── config.ts        # i18next init
│   │   │   └── locales/         # Translation JSON files per language
│   │   │       └── en/          # English translations (default)
│   │   └── types/               # Frontend-specific types
│   ├── shared/                  # Shared between Main & Renderer
│   │   └── types/               # Shared TypeScript types & interfaces
│   └── preload/                 # Electron preload scripts
│       └── index.ts             # Exposes safe IPC API via contextBridge
├── tests/
│   ├── unit/                    # Vitest unit tests
│   ├── integration/             # Vitest integration tests
│   └── e2e/                     # Playwright E2E tests
├── resources/                   # Electron app resources (icons, etc.)
└── .specify/                    # Spec-Driven Development artifacts
    ├── memory/
    │   └── constitution.md      # This file
    ├── templates/
    └── features/
```

## Conventions

- **File naming:** kebab-case for all files and directories
- **Exports:** Named exports only, no default exports
- **Error handling:** Custom `AppError` class with error codes and severity levels
- **API responses:** Envelope format `{ data, error, meta }` on all endpoints
- **API authentication:** API key via `X-API-Key` header; key generated on first launch, stored in config DB
- **API binding:** `127.0.0.1` only — never exposed to the network
- **API development workflow:** OpenAPI spec first → implementation second → validation against spec
- **Logging:** pino with JSON output; file transport to `app.getPath('userData')/logs/` in production, pretty-print to stdout in development
- **Database location:** `app.getPath('userData')/agent-cli-bridge.db` — never in the project directory or temp folders
- **Database migrations:** Sequential numbered migration files, run automatically on app startup
- **Internationalization:** All user-facing strings MUST use i18next translation keys. No hardcoded UI strings. English is the default and only language at launch; additional languages can be added by providing translation files without code changes.
- **Versioning:** SemVer for the application. OpenAPI spec version MUST match the app version.
- **Changelog:** `CHANGELOG.md` in Keep a Changelog format (https://keepachangelog.com/). Categories: Added, Changed, Deprecated, Removed, Fixed, Security. Every PR that changes user-facing behavior MUST include a changelog entry under `[Unreleased]`. The `[Unreleased]` section is promoted to a versioned section at release time.
- **Commit messages:** Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`)
- **Branching:** Feature branches off `main`, squash merge via PR

## Platform Support

| Platform           | Priority  | Status             |
| ------------------ | --------- | ------------------ |
| Linux (x64, arm64) | Primary   | Active development |
| macOS (x64, arm64) | Secondary | Planned            |
| Windows (x64)      | Secondary | Planned            |

Platform-specific code (e.g., shell selection, path conventions) MUST be isolated behind a platform abstraction layer from the start, even if only Linux is implemented initially. Shell defaults: `/bin/bash` on Linux/macOS, `cmd.exe` on Windows.

## Deferred Features (Explicitly Out of Scope)

The following features are acknowledged but intentionally deferred. They MUST NOT be implemented until this constitution is amended to include them:

- **Auto-updates** (Electron autoUpdater)
- **OIDC / advanced authentication** (API key is sufficient for now)
- **WebSocket streaming** for long-running command output
- **Multi-user / multi-tenant** support
- **Remote network exposure** (the API MUST remain localhost-only until a security review is conducted)

## Governance

- This constitution is the single source of truth for architectural decisions and project principles.
- All specs and plans MUST be validated against these principles. A spec that violates a principle MUST either be revised or the constitution MUST be amended first.
- **Amendments** require: (1) a documented rationale, (2) impact analysis on existing features, (3) update to this file with version bump.
- **Version policy:**
    - MAJOR: Principle removed or fundamentally redefined
    - MINOR: New principle or section added, material expansion
    - PATCH: Clarifications, wording fixes, non-semantic refinements
- Security principles (I, II) may only be amended to become **more restrictive**, never less.

**Version**: 2.0.1 | **Ratified**: 2026-03-31 | **Last Amended**: 2026-03-31