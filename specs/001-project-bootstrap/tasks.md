---
description: 'Task list for Project Bootstrap & Application Shell'
---

# Tasks: Project Bootstrap & Application Shell

**Input**: Design documents from `/specs/001-project-bootstrap/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are requested in User Story 2.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Desktop App**: `src/main/`, `src/preload/`, `src/renderer/`
- **Tests**: `tests/unit/`, `tests/integration/`, `tests/e2e/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

+ [x] T001 Initialize npm project with `package.json` at repository root
+ [x] T002 Configure electron-vite for Main, Renderer, and Preload environments
+ [x] T003 [P] Configure TypeScript 5.x strict mode with separate configs for main/renderer/preload
+ [x] T004 [P] Configure ESLint (flat config) and Prettier
+ [x] T005 Setup project hygiene (`.gitignore`, `README.md`, `CHANGELOG.md` with Unreleased section)
+ [x] T006 [P] Create `openapi.yaml` stub at repository root

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

+ [x] T007 Configure pino logging in `src/main/logger.ts` (console for dev, JSON for prod)
+ [x] T008 [P] Setup better-sqlite3 connection in `src/main/database/connection.ts`
+ [x] T009 [P] Configure db-migrate and create first migration `001_initial.sql` for `schema_migrations`
+ [x] T010 Initialize React 19 + MUI + TanStack Router in `src/renderer/`
+ [x] T011 [P] Setup i18next with English locale in `src/renderer/i18n/locales/en/common.json` and `src/renderer/i18n/config.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - System Initialization and Launch (Priority: P1) 🎯 MVP

**Goal**: The application launches successfully and displays a minimal window with the application name and version.

**Independent Test**: Running the app manually displays the window with correct info and respects window controls.

### Implementation for User Story 1

+ [x] T012 [P] [US1] Create Preload script exposing `getVersions` via contextBridge in `src/preload/index.ts`
+ [x] T013 [P] [US1] Create minimal React Dashboard page in `src/renderer/pages/Dashboard.tsx` displaying app name and versions
+ [x] T014 [US1] Wire up React entry and Router in `src/renderer/main.tsx` and `src/renderer/App.tsx`
+ [x] T015 [US1] Implement Electron Main entry in `src/main/index.ts` with hardened security settings (nodeIntegration: false, contextIsolation: true, sandbox: true)
+ [x] T016 [US1] Integrate database initialization and logging startup into `src/main/index.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (app launches).

---

## Phase 4: User Story 2 - Automated Quality Assurance (Priority: P2)

**Goal**: Automated testing and quality checks are in place to ensure stability.

**Independent Test**: Running `npm test` executes all test suites without manual intervention.

### Implementation for User Story 2

+ [x] T017 [P] [US2] Configure Vitest for unit and integration tests
+ [x] T018 [P] [US2] Configure Playwright with Electron support for E2E tests
+ [x] T019 [P] [US2] Write unit smoke test asserting basic logic in `tests/unit/smoke.test.ts`
+ [x] T020 [P] [US2] Write E2E smoke test verifying window title in `tests/e2e/app.spec.ts`
+ [x] T021 [US2] Add npm scripts (dev, build, lint, format, test) to `package.json`

**Checkpoint**: At this point, tests and code quality tools can run successfully.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

+ [x] T022 [P] Run linter and formatter across all files
+ [x] T023 Run quickstart.md validation to ensure instructions work

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2). Needs US1 completed to run E2E test on the actual app window.

### Parallel Opportunities

- **Phase 1**: Typescript config, ESLint, and openapi.yaml stub can be created in parallel.
- **Phase 2**: DB setup, logging setup, and i18next setup can run in parallel.
- **Phase 3**: Preload script and React Dashboard can be built in parallel before wiring up main.ts.
- **Phase 4**: Vitest and Playwright configurations can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Launch UI components and Preload simultaneously:
Task: "[US1] Create Preload script exposing getVersions via contextBridge in src/preload/index.ts"
Task: "[US1] Create minimal React Dashboard page in src/renderer/pages/Dashboard.tsx displaying app name and versions"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Verify application launches securely and renders React.

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test manually → App MVP
3. Add User Story 2 → Run test suite → Automated Quality Assurance in place
