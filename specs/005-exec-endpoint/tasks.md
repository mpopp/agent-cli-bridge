# Tasks: POST /exec Endpoint

**Input**: Design documents from `/specs/005-exec-endpoint/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Tests are requested via the constitution (Test-Driven Development is required).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Initialize database configuration store using better-sqlite3 in `src/main/database/config.ts`
- [X] T002 Setup test infrastructure for executor and api using Vitest
- [X] T003 Update OpenAPI spec in `openapi.yaml` with the POST `/exec` endpoint details

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

- [X] T004 Create database migration to enforce the single-row configuration schema for Execution Configuration (timeout, max output size)
- [X] T005 Implement `config.ts` database service for reading the execution configuration
- [X] T006 Implement the base `AppError` class structure for error handling if it doesn't exist

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Execute Valid Shell Command (Priority: P1) 🎯 MVP

**Goal**: API client sends a valid shell command and it executes, returning exit code, stdout, and stderr.

**Independent Test**: Can be fully tested by sending a benign command (like `echo test`) with a valid API key and confirming the output.

### Tests for User Story 1

- [X] T007 [US1] Create integration test for POST `/exec` in `tests/integration/api/exec.test.ts`
- [X] T008 [P] [US1] Create unit tests for command execution logic in `tests/unit/executor/executor.test.ts`
- [X] T009 [P] [US1] Create unit tests for exec service in `tests/unit/services/exec-service.test.ts`

### Implementation for User Story 1

- [X] T010 [P] [US1] Implement `executor.ts` using `child_process` in `src/main/executor/executor.ts` with timeout (FR-012)
- [X] T011 [US1] Implement `exec-service.ts` in `src/main/services/exec-service.ts` to orchestrate execution (depends on T010)
- [X] T012 [US1] Implement POST `/exec` route handler in `src/main/api/routes/exec.ts`
- [X] T013 [US1] Mount the `/exec` route in `src/main/api/server.ts`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (without security validation).

---

## Phase 4: User Story 2 - Security Validation (Priority: P1)

**Goal**: Validate all commands using the Security Engine before execution to block malicious commands.

**Independent Test**: Can be tested by sending a known blocked command and verifying a 403 Forbidden response without execution.

### Tests for User Story 2

- [X] T014 [US2] Create unit tests for security validation logic in `tests/unit/security/validator.test.ts`
- [X] T015 [P] [US2] Add integration test for blocked commands returning 403 in `tests/integration/api/exec.test.ts` by only using blocked commands with severity test for the integration tests!

### Implementation for User Story 2

- [X] T016 [US2] Implement security validation logic in `src/main/security/validator.ts` integrating with `blocklist.ts`
- [X] T017 [US2] Update `exec-service.ts` to call the Security Engine before executing the command
- [X] T018 [US2] Update POST `/exec` route to handle validation failures and return 403 Forbidden with human-readable error (FR-005)

**Checkpoint**: Security Engine integration is complete, commands are validated before execution.

---

## Phase 5: User Story 3 - API Error Handling (Priority: P2)

**Goal**: Clear error responses for invalid requests (missing auth, empty payload, malformed request).

**Independent Test**: Can be tested by sending malformed requests and verifying HTTP status codes.

### Tests for User Story 3

- [X] T019 [US3] Add integration tests for 401 and 400 error scenarios in `tests/integration/api/exec.test.ts`

### Implementation for User Story 3

- [X] T020 [P] [US3] Add payload validation in POST `/exec` route (or via middleware) for missing/empty command (FR-003)
- [X] T021 [US3] Ensure authentication middleware correctly returns 401 Unauthorized for missing/invalid API key (FR-002)
- [X] T022 [US3] Add generic error handling for unexpected execution failures to return 500 (FR-008)

**Checkpoint**: Error handling is robust and complies with OpenAPI specification.

---

## Final Phase: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanups, performance checks, documentation, and overall validation

- [X] T023 Run full test suite and verify no destructive commands are executed against the real filesystem
- [X] T024 Verify execution validation overhead is under 50ms
- [X] T025 Run linter and formatting tools across all modified files
- [X] T026 Update `README.md` or `quickstart.md` with final instructions on how to use the new `/exec` endpoint

## Implementation Strategy

1. **MVP (Phase 1 & 2 & 3)**: Get the basic execution working to prove the `child_process` and Express integration.
2. **Security (Phase 4)**: This is critical and must not be skipped. Implement validation and ensure the system blocklist is respected.
3. **Robustness (Phase 5)**: Add edge-case and error handling to meet the API contract.
4. **Polish**: Finalize documentation and verify all tests pass.

## Dependencies

```text
Phase 1 (Setup) -> Phase 2 (Foundational)
Phase 2 -> Phase 3 (US1)
Phase 3 -> Phase 4 (US2)
Phase 4 -> Phase 5 (US3)
```

## Parallel Execution Examples

- **Phase 3**: `executor.ts` (T010) and `exec.test.ts` (T007) can be written at the same time. Unit tests for executor (T008) can also be written in parallel.
- **Phase 4**: Security validation logic (T016) can be implemented while the tests (T014) are being written.
- **Phase 5**: Validation schema (T020) can be added independently of testing the 401 scenario (T019).
