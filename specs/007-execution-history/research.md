# Research: Execution History

## Decision: IPC Contract for Execution History
**Rationale**: Using Electron's `contextBridge` and `ipcMain.handle` / `ipcRenderer.invoke` is the standard and most secure way to communicate between the renderer and main process in Electron. It avoids exposing full Node.js APIs to the renderer.

**Alternatives considered**: 
- **Direct HTTP to Express**: Rejected because internal communication should use IPC for better performance and security (no network stack overhead).
- **Shared Memory**: Overly complex for the required data volume.

## Decision: SQLite Pagination Strategy
**Rationale**: Use `LIMIT` and `OFFSET` for simple pagination. Given the 50 entries per page requirement and total retention of 90 days (likely <100k entries), `OFFSET` performance is acceptable. For "Load More", we will append new results to the existing state.

**Alternatives considered**:
- **Keyset Pagination (Seek method)**: More performant for very large datasets but adds complexity to the UI state management. Rejected for this scope.

## Decision: MUI Expandable Table Rows
**Rationale**: Use MUI `Table`, `TableRow`, and `Collapse` components. A state variable will track the ID of the expanded row. Clicking a row toggles its expanded state to show `stdout`, `stderr`, and `blockReason`.

**Alternatives considered**:
- **Dialog/Modal for details**: Less fluid user experience compared to in-place expansion.
- **Accordion**: Can work, but `Table` with `Collapse` rows provides better alignment for tabular data.

## Decision: Database Encryption Strategy
**Rationale**: Standard OS-level file permissions on an unencrypted SQLite database are sufficient for a local desktop app. Full database encryption (e.g., SQLCipher) or column-level encryption is not required unless the application explicitly handles highly sensitive credentials.
**Alternatives considered**: 
- **SQLCipher / Full Database Encryption**: Rejected due to unnecessary complexity and performance overhead for standard command logs.
- **Column-level Encryption**: Rejected as standard OS permissions are adequate.

## Technical Unknowns Resolved
- **IPC Contract**: Will be defined in `src/types/ipc.ts` and exposed via `src/preload/index.ts`.
- **Retention Cleanup**: Will be implemented as a service called in `src/main/index.ts` during startup.
- **Security Engine Integration**: Will add a hook in `src/main/security/engine.ts` to log blocked commands.
