# Phase 0: Research & Decisions

## Context
The feature requires pushing new execution log entries from the REST API to the React UI in real-time.

## Decisions

### Decision 1: IPC Push Pattern
- **Decision**: The main process will use `webContents.send` to push new `execution-history:newEntry` events to the renderer. The renderer will listen via a `window.api.executionHistory.onNewEntry` method exposed by the preload script.
- **Rationale**: This is the standard Electron pattern for server-to-client real-time communication. It avoids polling, which would be inefficient and violate the real-time requirement.
- **Alternatives considered**: Polling the database from the renderer (inefficient, not real-time).

### Decision 2: React State Update Strategy
- **Decision**: The React component (`ExecutionHistory.tsx`) will maintain its list of entries in state. When a new entry arrives via IPC, it will check if the entry matches the current Status filter. If it matches, it prepends the entry to the state array. If it does not match, it ignores the entry (or stores it in a hidden buffer if necessary, but re-fetching on filter change is preferred to keep state simple).
- **Rationale**: Prepending to the React state array is simple and performant. Relying on the existing filter logic simplifies the implementation.
- **Alternatives considered**: Refetching the entire list from the database on every new entry (could cause UI flicker and unnecessary DB load).

### Decision 3: Filter Application
- **Decision**: The client-side React component will receive all new entries but will only display them if they match the currently selected filter in the UI.
- **Rationale**: The main process does not know the current UI filter state. Sending all new entries to the renderer allows the UI to decide whether to display them immediately.