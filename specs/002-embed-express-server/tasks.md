# Tasks: Embed Express Server

**Input**: Design documents from `/specs/002-embed-express-server/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

## Overview

- **Feature**: Embed Express Server
- **Primary Goal**: Integrate an embedded HTTP Express server in the Electron main process listening on 127.0.0.1.
- **Implementation Strategy**: Build configuration storage and service first, then integrate the Express server and health endpoint.

## Execution Rules

1.  **Strict File Paths**: Every task MUST include an exact, absolute or project-relative file path.
2.  **Sequential IDs**: Tasks must use sequential IDs (T001, T002, etc.) in expected execution order.
3.  **No Implied Steps**: If a file needs exporting from an `index.ts`, that must be a distinct task or explicitly stated in the module creation task.
4.  **Test First**: If testing is requested, test creation tasks must precede implementation tasks.

## Dependencies

- **US1** (Background Server Initialization) depends on **Foundational tasks** (Config DB/Service).
- **US2** (Health Check & Security) depends on **US1**.

## Phase 1: Setup

*Goal: Initialize foundational structures and add necessary dependencies.*

- [ ] T001 Install express and better-sqlite3 dependencies (if not already present) in `package.json`
- [ ] T002 Update `openapi.yaml` with the `/health` endpoint specification

## Phase 2: Foundational

*Goal: Blocking prerequisites that multiple user stories rely on.*

- [ ] T003 Create database migration for the configuration table using db-migrate in `src/main/database/migrations/`
- [ ] T004 [P] Create Config repository for database access in `src/main/database/config.ts`
- [ ] T005 [P] Create unit tests for Config service in `tests/unit/services/config.service.test.ts`
- [ ] T006 Implement Config service (port allocation, UUID generation, DB integration) in `src/main/services/config.service.ts`

## Phase 3: [US1] Background Server Initialization

*Goal: Start the server on an available port and persist the configuration.*

- [ ] T007 [P] [US1] Create Express server initialization logic in `src/main/api/server.ts`
- [ ] T008 [US1] Update application entry point to start the server via Config service in `src/main/index.ts`
- [ ] T008a [US2] Implement global 500 internal server error handling middleware in `src/main/api/middleware/errorHandler.ts`        
- [ ] T008b [US2] Implement a global 404 fallback route handler in `src/main/api/middleware/notFoundHandler.ts`                      
- [ ] T008c [US2] Register error handling and 404 middleware to the Express app in `src/main/api/server.ts`

## Phase 4: [US2] Health Check & Security

*Goal: Provide a secure endpoint to verify server status and enforce API key authentication.*

- [ ] T009 [P] [US2] Create unit tests for auth middleware in `tests/unit/api/middleware/auth.test.ts`
- [ ] T010 [US2] Implement API key authentication middleware in `src/main/api/middleware/auth.ts`
- [ ] T011 [P] [US2] Create unit tests for health route in `tests/unit/api/routes/health.test.ts`
- [ ] T012 [US2] Implement health check endpoint in `src/main/api/routes/health.ts`
- [ ] T013 [US2] Register middleware and routes in the Express app in `src/main/api/server.ts`

## Phase 5: Polish & Cross-Cutting Concerns

*Goal: Final verification, linting, and integration testing.*

- [ ] T014 Run full test suite and verify no regressions
- [ ] T015 Run linter and formatter on all modified files
