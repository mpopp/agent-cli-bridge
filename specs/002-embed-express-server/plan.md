# Implementation Plan: Embed Express Server

**Branch**: `002-embed-express-server` | **Date**: 2026-03-31 | **Spec**: [specs/002-embed-express-server/spec.md](specs/002-embed-express-server/spec.md)
**Input**: Feature specification from `specs/002-embed-express-server/spec.md`

## Summary

Integrate an embedded HTTP Express server in the Electron main process listening on `127.0.0.1`. The server configuration (port and API key) will be generated if not present, persisted using SQLite, and loaded on subsequent startups. Expose a secure `GET /health` endpoint authenticated via `x-api-key` header.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22.x LTS
**Primary Dependencies**: Electron, Express.js 5.x, better-sqlite3, get-port (or native net module)
**Storage**: SQLite (via better-sqlite3)
**Testing**: Vitest (Unit/Integration), Playwright (E2E)
**Target Platform**: Electron Desktop App (Main Process)
**Project Type**: Desktop-App
**Performance Goals**: `GET /health` requests processed in under 100ms
**Constraints**: Bind only to `127.0.0.1`. Must start within 3 seconds. Hardcoded security blocklist precedence.
**Scale/Scope**: Local instance, single-tenant, lightweight embedded API.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **User Safety First**: The feature does not execute commands yet, only sets up the server and health endpoint. No destructive operations.
- [x] **Defense in Depth**: The server is bound to `127.0.0.1` exclusively (never 0.0.0.0). API key authentication is required for all endpoints.
- [x] **OpenAPI First**: The `GET /health` endpoint will be specified in `openapi.yaml` before implementation.
- [x] **Test-Driven Development**: Tests will verify the server binding, port selection logic, authentication failure (401), and success (200).
- [x] **Simplicity and Incrementalism**: Adding only the required server structure and a single `/health` endpoint.
- [x] **Pragmatic Layered Architecture**: Routes, services, and database layers will be kept separate. 

## Project Structure

### Documentation (this feature)

```text
specs/002-embed-express-server/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (OpenAPI snippets)
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── index.ts               # Will be updated to start the Express server
│   ├── api/
│   │   ├── server.ts          # Express server setup and binding
│   │   ├── middleware/
│   │   │   └── auth.ts        # x-api-key validation middleware
│   │   └── routes/
│   │       └── health.ts      # GET /health handler
│   ├── services/
│   │   └── config.service.ts  # Logic to get/set port and API key, find free port
│   └── database/
│       ├── config.ts          # Repository for configuration table
│       └── migrations/        # New migration for config table
```

**Structure Decision**: Integrated within the existing single-project Electron Main process structure, adhering to the pragmatic layered architecture specified in the constitution.

## Complexity Tracking

No violations of the Constitution. Layering is standard and required by architectural guidelines.
