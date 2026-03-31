# IPC Contract: Project Bootstrap

This defines the initial placeholder IPC bridge exposed to the renderer process.

## Preload Bridge: `window.api` (or similar namespace)

### Methods

- `getVersions(): Promise<Record<string, string>>`
  - **Returns**: A promise resolving to an object containing versions of Node, Chrome, and Electron.
  - **Purpose**: Verify that the context bridge is functioning correctly.

_Note: Further IPC contracts will be defined as features require them (e.g. settings, command execution)._
