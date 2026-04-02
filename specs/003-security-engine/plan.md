# Implementation Plan: Security Engine

**Branch**: `003-security-engine` | **Date**: 2026-04-01 | **Spec**: [Link to spec](./spec.md)
**Input**: Feature specification from `/specs/003-security-engine/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Implement a Security Engine in the Electron main process to validate shell commands against a hardcoded blocklist. The engine follows a Chain of Responsibility pattern and performs input normalization and chain splitting to accurately detect destructive operations, even when obscured by privilege escalation or subshells.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 22.x LTS
**Primary Dependencies**: validator (https://www.npmjs.com/package/validator) and pure TS, native Node.js built-in `RegExp`
**Storage**: N/A
**Testing**: Vitest
**Target Platform**: Desktop-App (Electron Main Process)
**Project Type**: Desktop-App module
**Performance Goals**: <10ms validation overhead per command
**Constraints**: Pure TypeScript, no Electron IPC or DB dependencies allowed here. Hard length limit (10,000 chars) before validation to prevent ReDoS.
**Scale/Scope**: Covers 10 destructive categories with custom regex definitions.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- **Principle I (User Safety First)**: Adhered. The Security Engine acts as the hardcoded blocklist, fulfilling the non-negotiable requirement to block system-level destructive commands. Test coverage explicitly forbids actual execution against real filesystems.
- **Principle II (Defense in Depth)**: Adhered. This engine establishes Layer 1 of the defense architecture.
- **Principle IV (Test-Driven Development)**: Adhered. High coverage (≥90%) using assertion-based tests is planned. No test will execute actual commands.
- **Principle VII (Pragmatic Layered Architecture)**: Adhered. The engine lives in `src/main/security/` and is strictly isolated with zero external framework dependencies.

## Project Structure

### Documentation (this feature)

```text
specs/003-security-engine/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
└── main/
    └── security/
        ├── types.ts                     # Interfaces (CommandContext, SecurityVerdict, SecurityCheck)
        ├── engine.ts                    # Chain of Responsibility coordinator
        ├── blocklist.ts                 # Immutable blocklist rules 
        ├── checks/
        │   └── blocklist-check.ts       # Implementation of SecurityCheck for blocklist
        └── utils/
            ├── normalize.ts             # Input sanitization
            └── split-commands.ts        # Command segmentation

tests/
└── unit/
    └── security/                        # Vitest assertion tests for security engine
```

**Structure Decision**: A single cohesive `security` module within the `main` process directory matching the defined architectural conventions.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation                  | Why Needed         | Simpler Alternative Rejected Because |
| -------------------------- | ------------------ | ------------------------------------ |
| N/A                        | N/A                | N/A                                  |
