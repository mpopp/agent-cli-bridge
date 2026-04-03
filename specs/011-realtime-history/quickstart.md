# Phase 1: Quickstart Guide

## Overview
This feature adds real-time updates to the Execution History page. When a command execution is logged via the REST API, the new entry is immediately pushed to the UI and displayed at the top of the list if it matches the active filter.

## Implementation Order
1. **Foundation**: Update the history service to emit an event when a new entry is saved.
2. **IPC & Preload**: Wire the event to the `webContents.send` in `src/main/api/ipc.ts` and expose `onNewEntry` in the preload script.
3. **UI Integration**: Update the `ExecutionHistory.tsx` React component to listen for `onNewEntry` and update its state dynamically, applying the current filter.
4. **Testing**: Add unit tests for the event emission and E2E tests for the real-time UI updates.

## Key Files to Change
| File | Change |
|---|---|
| `src/main/services/history-service.ts` | Add `EventEmitter` logic to broadcast new entries. |
| `src/main/api/ipc.ts` | Add listener to the history service event and push to `webContents`. |
| `src/preload/index.ts` | Expose `onNewEntry` function. |
| `src/preload/index.d.ts` | Add type definitions for the new API. |
| `src/renderer/pages/ExecutionHistory.tsx` | Subscribe to `onNewEntry`, update state, and respect filters. |
| `tests/e2e/execution-history.spec.ts` | Add test for real-time updates and filter respecting behavior. |

## Run Tests
- Unit: `npm test -- --project=unit`
- E2E: `npx playwright test tests/e2e/execution-history.spec.ts`