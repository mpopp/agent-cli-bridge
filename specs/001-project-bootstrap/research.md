# Research: Project Bootstrap & Application Shell

## Technical Context Resolution

### Language & Frameworks

- **Decision**: TypeScript 5.x (strict mode) with Node.js 22.x LTS and Electron.
- **Rationale**: Mandated by the project constitution for the tech stack.
- **Alternatives considered**: None (constitution constraint).

### Build Tooling

- **Decision**: electron-vite.
- **Rationale**: Recommended and mandated by constitution for Electron React apps. Fast HMR and sensible defaults for main/renderer/preload separation.
- **Alternatives considered**: Webpack, plain Vite. electron-vite provides out-of-the-box support for Electron's multi-process architecture.

### UI Stack

- **Decision**: React 19.x with Material UI (MUI), TanStack Router.
- **Rationale**: Mandated by constitution. Provides a robust component library and type-safe routing.

### Testing

- **Decision**: Vitest for unit/integration, Playwright for E2E.
- **Rationale**: Mandated by constitution. Playwright supports Electron out of the box.

### Database & Logging

- **Decision**: better-sqlite3 for DB, db-migrate for migrations, pino for logging.
- **Rationale**: As per constitution, better-sqlite3 is fast and synchronous. db-migrate is the explicitly enforced migration mechanism. pino provides fast JSON logging.

### Security Setup

- **Decision**: Hardened Electron shell with `nodeIntegration: false`, `contextIsolation: true`, `sandbox: true`. Communication via `contextBridge`.
- **Rationale**: Non-negotiable security requirement defined in the constitution.
