# Tasks: Security Engine

**Input**: Design documents from `/specs/003-security-engine/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md

## Implementation Strategy

We follow a modular approach prioritizing pure Typescript functions and testability:
- MVP Scope: Phase 1-3 (Setup, Foundational types, US1 - Blocklist). This enables basic detection.
- Incremental Delivery: Subshell parsing (US2) and input normalization (US3) build on top of the established engine structure without breaking existing tests.

## Phase 1: Setup

- [x] T001 Create security engine directory structure in `src/main/security` and `tests/unit/security`
- [x] T002 Install `validator` and `@types/validator` in `package.json`

## Phase 2: Foundational

- [x] T003 Create core interfaces (`CommandContext`, `SecurityVerdict`, `SecurityCheck`, `BlocklistEntry`) in `src/main/security/types.ts`

## Phase 3: US1 - Hardcoded Blocklist Validation

**Goal**: Establish the basic Chain of Responsibility and the fundamental blocklist mechanism.
**Independent Test Criteria**: A basic test script checks if a direct blocklist match (like `rm -rf /`) returns a block verdict.

- [x] T004 [P] [US1] Define immutable blocklist rules covering 10 categories of destruction in `src/main/security/blocklist.ts`
- [x] T005 [P] [US1] Implement `BlocklistCheck` in `src/main/security/checks/blocklist-check.ts`
- [x] T006 [US1] Implement Chain of Responsibility coordinator in `src/main/security/engine.ts`
- [x] T007 [US1] Write blocklist unit tests in `tests/unit/security/blocklist.test.ts`

## Phase 4: US2 - Subshell and Privilege Escalation Detection

**Goal**: Detect malicious strings nested within subshells or executed via `sudo`/`su`.
**Independent Test Criteria**: A command hidden in an `eval` subshell or `sudo` is successfully unpacked and evaluated.

- [x] T008 [P] [US2] Implement command segmentation and subshell extraction in `src/main/security/utils/split-commands.ts`
- [x] T009 [US2] Integrate command segmentation logic in `src/main/security/engine.ts`
- [x] T010 [P] [US2] Write split commands unit tests in `tests/unit/security/split-commands.test.ts`

## Phase 5: US3 - Input Normalization

**Goal**: Normalize input to defeat whitespace padded evasion and unicode trickery.
**Independent Test Criteria**: Commands spaced out with homoglyphs still correctly trigger the block rules.

- [x] T011 [P] [US3] Implement input normalization and homoglyph stripping using `validator` in `src/main/security/utils/normalize.ts`
- [x] T012 [US3] Integrate normalization utility at the start of the validation chain in `src/main/security/engine.ts`
- [x] T013 [P] [US3] Write normalization unit tests in `tests/unit/security/normalize.test.ts`

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 Implement max length constraint of 10,000 characters immediately before validation to prevent ReDoS in `src/main/security/engine.ts`
- [x] T015 Write integration and performance validation tests (ensuring <10ms overhead) in `tests/unit/security/engine.integration.test.ts`

## Dependencies

- Phase 2 depends on Phase 1
- Phase 3 depends on Phase 2
- Phase 4 depends on Phase 3
- Phase 5 depends on Phase 4
- Phase 6 depends on Phase 5

## Parallel Opportunities

- Blocklist definitions (T004) and `BlocklistCheck` class (T005) can be authored simultaneously.
- Utilities (`split-commands.ts`, T008) and test files (T010) can be implemented in parallel before engine integration.
- Normalization utility (`normalize.ts`, T011) and its tests (T013) can be worked on concurrently.
