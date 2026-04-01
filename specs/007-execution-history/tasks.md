# Implementation Tasks: Execution History

**Feature**: Execution History
**Specification**: /specs/007-execution-history/spec.md
**Data Model**: /specs/007-execution-history/data-model.md
**Contracts**: /specs/007-execution-history/contracts/ipc.md

## Dependencies
- US1 (View) depends on Foundational logging and setup.
- US2 (Clear) depends on US1 to have a UI to trigger the clear action.
- US3 (Navigation) runs parallel but should be integrated to view US1 and US2 results easily.

## Phase 1: Setup
**Goal**: Project initialization, types, and database schema setup

- [ ] T001 Define `ExecutionLogEntry` and `ExecutionFilter` types in `src/types/ipc.ts`
- [ ] T002 Create database migration script for `execution_log` table in `src/main/database/migrations/`
- [ ] T003 Implement cleanup service for 90-day retention in `src/main/services/history.service.ts`
- [ ] T004 Hook up cleanup service in `src/main/index.ts` during startup

## Phase 2: Foundational
**Goal**: Core backend logging functionality

- [ ] T005 Implement `logExecution` function in `src/main/services/history.service.ts`
- [ ] T006 [P] Integrate `logExecution` into Security Engine in `src/main/security/engine.ts`
- [ ] T007 [P] Integrate `logExecution` into Command Executor in `src/main/executor/executor.ts`
- [ ] T008 Implement `getLogs` database query in `src/main/services/history.service.ts`
- [ ] T009 Expose `getLogs` via IPC main handler in `src/main/api/ipc.ts`
- [ ] T010 Expose `getLogs` via preload script in `src/preload/index.ts`

## Phase 3: View Execution History (User Story 1)
**Goal**: Users can view a paginated list of all executed and blocked commands to audit system activity.
**Independent Test**: Navigate to the page, observe table of commands, load more, and filter.

- [ ] T011 [US1] Create localization strings for Execution History page in `src/renderer/i18n/en.json`
- [ ] T012 [P] [US1] Create `StatusChip` UI component in `src/renderer/components/StatusChip.tsx`
- [ ] T013 [US1] Create `HistoryTable` UI component with expandable rows in `src/renderer/components/HistoryTable.tsx`
- [ ] T014 [US1] Create `ExecutionHistory` page component integrating table and filters in `src/renderer/pages/ExecutionHistory.tsx`
- [ ] T015 [US1] Implement pagination ("Load More") logic in `ExecutionHistory` page in `src/renderer/pages/ExecutionHistory.tsx`
- [ ] T016 [US1] Implement filtering (All, Executed, Blocked) logic in `ExecutionHistory` page in `src/renderer/pages/ExecutionHistory.tsx`

## Phase 4: Clear Execution History (User Story 2)
**Goal**: Users can clear the entire execution history.
**Independent Test**: Click "Clear History", confirm, verify empty list.

- [ ] T017 [US2] Implement `clearLogs` database operation in `src/main/services/history.service.ts`
- [ ] T018 [US2] Expose `clearLogs` via IPC main handler in `src/main/api/ipc.ts`
- [ ] T019 [US2] Expose `clearLogs` via preload script in `src/preload/index.ts`
- [ ] T020 [US2] Add clear history button and confirmation dialog to `ExecutionHistory` page in `src/renderer/pages/ExecutionHistory.tsx`

## Phase 5: Navigation and About Page (User Story 3)
**Goal**: Navigate between the Execution History and About pages using a permanent left sidebar.
**Independent Test**: Click navigation items in sidebar, verify content changes.

- [ ] T021 [US3] Create `About` page component in `src/renderer/pages/About.tsx`
- [ ] T022 [P] [US3] Create permanent left `Sidebar` component in `src/renderer/components/Sidebar.tsx`
- [ ] T023 [US3] Configure TanStack Router with routes for `/` (ExecutionHistory) and `/about` in `src/renderer/App.tsx`
- [ ] T024 [US3] Update main layout to include `Sidebar` alongside routed content in `src/renderer/App.tsx`

## Phase 6: Polish
**Goal**: Final styling, accessibility, and edge case handling.

- [ ] T025 Ensure long command strings truncate with tooltip in `src/renderer/components/HistoryTable.tsx`
- [ ] T026 Handle empty state message when no logs exist in `src/renderer/pages/ExecutionHistory.tsx`
- [ ] T027 Verify NFR-001 (unencrypted DB standard permissions) manually

## Implementation Strategy
- **MVP**: Phase 1 and 2 to ensure data is captured safely. Phase 3 to view data.
- **Parallel Execution**: Frontend components (US1, US3) can be built in parallel with backend services (Foundational).
