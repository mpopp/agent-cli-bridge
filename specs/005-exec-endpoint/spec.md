# Feature Specification: POST /exec Endpoint

**Feature Branch**: `005-exec-endpoint`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Implement a POST /exec endpoint in the embedded HTTP server (Feature 002, already implemented) that executes shell commands on the host system. The Security Engine (Feature 003, already implemented) validates commands before execution. Request body accepts command (required, non-empty string) and cwd (optional, defaults to process.env.HOME). Timeout is NOT a request parameter — it is controlled internally only. Response on success (200): { exitCode, stdout, stderr } where exitCode is the process exit code (0 for success, error code or fallback 1), stdout and stderr are strings. Before execution the command string MUST be validated by the Security Engine (Feature 003). If the engine returns block, respond with 403 including error blocked and a human-readable reason only — MUST NOT include matchedRule or any pattern information in the response because exposing matching patterns would allow an agent to iteratively craft commands that bypass the blocklist. Error responses: 401 Unauthorized if x-api-key header is missing or invalid, 400 Bad Request if command field is missing or empty or not a string or body is malformed JSON, 403 Forbidden if Security Engine blocks the command with reason only and no pattern, 500 Internal Server Error for any unexpected error outside defined scenarios. Execution configuration is stored in an exec_config table with a strict column schema: id INTEGER PRIMARY KEY DEFAULT 1 with CHECK (id = 1) to enforce single-row, timeout_seconds INTEGER NOT NULL DEFAULT 30 in whole seconds with no artificial maximum, max_output_mb INTEGER NOT NULL DEFAULT 10 in whole megabytes with no artificial maximum. On first app startup the default row is inserted if it does not exist, on subsequent starts values are read from the existing row. The table requires a db-migrate migration. Shell is /bin/bash. cwd is not validated in this feature — path validation will be a future PathCheck chain link in the Security Engine. No UI for editing configuration values — backend only. No IPC contract needed. No audit logging — that belongs to a future feature. Features 002 and 003 are already implemented and available. Reference: server.js /exec block for basic execution structure. Prototype of /exec endpoint as reference can be found in ../../_prototype/server.js"

## Clarifications

### Session 2026-04-01
- Q: What should happen if the command execution reaches the specified timeout limit? → A: Terminate the process immediately and return an error response

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Execute Valid Shell Command (Priority: P1)

As an API client, I want to send a valid shell command to the `/exec` endpoint so that it executes on the host system and returns the result.

**Why this priority**: Core functionality of the feature.

**Independent Test**: Can be fully tested by sending a benign command (like `echo test`) with a valid API key and confirming the output.

**Acceptance Scenarios**:

1. **Given** a running server with a valid API key, **When** a POST request is made to `/exec` with a valid command, **Then** the server responds with 200 OK and includes the exit code, stdout, and stderr.
2. **Given** a command that produces stderr output, **When** executed, **Then** the stderr field contains the output and exitCode reflects the process result.
3. **Given** a valid request with an explicit working directory, **When** executed, **Then** the command runs in the specified directory.

---

### User Story 2 - Security Validation (Priority: P1)

As a system administrator, I want all commands to be validated by the Security Engine before execution so that malicious commands are blocked.

**Why this priority**: Critical for system security to prevent unauthorized destructive actions.

**Independent Test**: Can be tested by sending a known blocked command and verifying a 403 Forbidden response without execution. The only commands from the blocklist allowed are those with severity "test" within blocklist.ts. Other commands on the blocklist are off-limits for testing independent of the test stage (unit, integration or e2e)! This is NON-NEGOTIABLE

**Acceptance Scenarios**:

1. **Given** a command that violates security rules, **When** requested, **Then** the server responds with 403 Forbidden.
2. **Given** a blocked command, **When** the 403 response is returned, **Then** it contains a human-readable error reason but MUST NOT include the matched rule or pattern.

---

### User Story 3 - API Error Handling (Priority: P2)

As an API client, I want clear error responses for invalid requests so I can correct my integration.

**Why this priority**: Essential for good API design and developer experience.

**Independent Test**: Can be tested by sending malformed requests and verifying HTTP status codes.

**Acceptance Scenarios**:

1. **Given** a request missing the authentication header, **When** received, **Then** the server responds with 401 Unauthorized.
2. **Given** a request with an empty command field, **When** received, **Then** the server responds with 400 Bad Request.
3. **Given** a request with malformed payload, **When** received, **Then** the server responds with 400 Bad Request.

---

### Edge Cases

- What happens when a command execution exceeds the configured timeout? (Expected: Terminate the process immediately and return an error response).
- What happens when a command produces output exceeding the configured maximum size? (Expected: output is truncated or process terminated).
- What happens when the specified working directory does not exist? (Expected: command fails with a non-zero exit code and error in stderr).
- How does the system handle concurrent execution requests? (Expected: executed independently within system resource limits).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST expose a POST `/exec` endpoint that accepts a payload with a required `command` string and optional `cwd` string (defaulting to user HOME).
- **FR-002**: System MUST validate authentication and return 401 Unauthorized if missing or invalid.
- **FR-003**: System MUST validate the request body and return 400 Bad Request if `command` is missing, empty, not a string, or if payload is malformed.
- **FR-004**: System MUST pass the command to the Security Engine for validation before execution.
- **FR-005**: System MUST return 403 Forbidden with a human-readable reason (and NO matched patterns) if the Security Engine blocks the command.
- **FR-006**: System MUST execute allowed commands using the standard system shell.
- **FR-007**: System MUST return 200 OK on successful execution completion (even if the command itself fails), providing exit code, standard output, and standard error.
- **FR-008**: System MUST return 500 Internal Server Error for unexpected execution failures.
- **FR-009**: System MUST read execution configuration (timeout, max output size) from a configuration data store.
- **FR-010**: System MUST enforce a strict single-row schema for the configuration data store.
- **FR-011**: System MUST initialize default configuration values on first startup if they do not exist.
- **FR-012**: System MUST terminate the process immediately and return an error response if the command execution exceeds the configured timeout.

### Key Entities

- **Execution Configuration**: Database entity storing system-wide limits for command execution (timeout in seconds, max output in MB). Restricted to a single record.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: 100% of commands blocked by the Security Engine return a 403 without executing and without exposing blocklist patterns.
- **SC-002**: Commands complete and return standard output/error and exit codes correctly formatted.
- **SC-003**: Valid requests missing the command payload are rejected with a 400 Bad Request in under 50ms.
- **SC-004**: Unauthorized requests are rejected with a 401 Unauthorized in under 50ms.
- **SC-005**: The data store contains exactly one configuration record enforcing default limits.

## Assumptions

- The host system has a standard shell available.
- The HTTP server framework handles basic request payload parsing.
- Working directory validation is out of scope for this feature and will be handled by a future component.
- The Security Engine API is synchronous or returns a Promise that resolves quickly.
- Audit logging is out of scope for this iteration.
- No UI is required for editing configuration values.