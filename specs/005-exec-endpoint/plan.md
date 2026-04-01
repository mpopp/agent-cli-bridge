# Implementation Plan: POST /exec Endpoint

**Branch**: `005-exec-endpoint` | **Date**: 2026-04-01 | **Spec**: `specs/005-exec-endpoint/spec.md`
**Input**: Feature specification from `/specs/005-exec-endpoint/spec.md`

## Summary

Implement a secure `POST /exec` endpoint that accepts shell commands, validates them against the Security Engine, and executes them with strict configuration limits (timeout and max output size). The endpoint must handle concurrent requests safely and return execution results (exit code, stdout, stderr) in a standardized envelope format.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22.x LTS
**Primary Dependencies**: Express.js 5.x, `child_process` (built-in)
**Storage**: SQLite (via better-sqlite3) for execution limits configuration
**Testing**: Vitest for unit/integration tests
**Target Platform**: Local desktop environment (Electron backend)
**Project Type**: REST API (served within Electron Main Process)
**Performance Goals**: Validation overhead < 50ms
**Constraints**: Hardcoded system blocklist MUST be the first check. Any timed-out or runaway child processes MUST be immediately terminated (SIGKILL).
**Scale/Scope**: Local single-user execution

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **I. User Safety First**: The executor must strictly terminate runaway processes if the timeout is reached. 
- **II. Defense in Depth**: Endpoint must invoke the Security Engine for command validation before any execution.
- **III. OpenAPI First**: The `openapi.yaml` file must be updated with the new `/exec` endpoint.
- **IV. Test-Driven Development**: Tests must mock process execution for security checks to avoid running destructive commands on the real filesystem.
- **VII. Pragmatic Layered Architecture**: Routes must be thin, calling a service layer which coordinates the Security Engine and Executor.

All gates pass.

## Project Structure

### Documentation (this feature)

```text
specs/005-exec-endpoint/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
└── main/
    ├── api/
    │   └── routes/
    │       └── exec.ts
    ├── services/
    │   └── exec-service.ts
    ├── executor/
    │   └── executor.ts
    ├── security/
    │   └── validator.ts
    └── database/
        └── config.ts
tests/
└── unit/
    ├── api/
    │   └── exec.test.ts
    ├── executor/
    │   └── executor.test.ts
    └── services/
        └── exec-service.test.ts
```

**Structure Decision**: Using the default constitution-aligned layout, extending existing `src/main` layers.