# IPC Contract: Tunnel Execution

**Feature**: `010-tunnel-execution` | **Date**: 2026-04-03

## Overview

This feature adds one **push channel** (main → renderer) and one **invoke channel** (renderer → main) under the `tunnel-execution` namespace. All channels are exposed via `contextBridge` in `src/preload/index.ts`.

---

## Channels

### 1. `tunnel-execution:stateChanged` (Push — main → renderer)

**Direction**: Main process → Renderer (via `webContents.send`)  
**Trigger**: Every time the tunnel process state transitions (start, stop, error, config switch, shutdown)

**Payload** (`TunnelStateChangedPayload`):
```typescript
{
  state: 'running' | 'stopped' | 'error' | 'not_configured'
  pid?: number      // present when state === 'running'
  exitCode?: number // present when state === 'stopped'
  error?: string    // present when state === 'error'
}
```

**Example payloads**:
```json
{ "state": "running", "pid": 12345 }
{ "state": "stopped", "exitCode": 1 }
{ "state": "error", "error": "spawn ENOENT" }
{ "state": "not_configured" }
```

---

### 2. `tunnel-execution:getState` (Invoke — renderer → main)

**Direction**: Renderer → Main  
**Purpose**: Retrieve the current tunnel process state on component mount (avoids flash of incorrect state before first push)

**Args**: none

**Returns**: `TunnelStateChangedPayload`

```typescript
// Renderer usage
const payload = await window.api.tunnelExecution.getState()
// payload: TunnelStateChangedPayload
```

---

## Preload Exposure (`src/preload/index.ts`)

```typescript
tunnelExecution: {
  // Subscribe to state change pushes from main process
  // Returns an unsubscribe function
  onStateChanged: (callback: (payload: TunnelStateChangedPayload) => void): (() => void) => {
    const handler = (_event: IpcRendererEvent, payload: TunnelStateChangedPayload) => callback(payload)
    ipcRenderer.on('tunnel-execution:stateChanged', handler)
    return () => ipcRenderer.removeListener('tunnel-execution:stateChanged', handler)
  },

  // Get current state synchronously on mount
  getState: (): Promise<TunnelStateChangedPayload> =>
    ipcRenderer.invoke('tunnel-execution:getState')
}
```

## Type Declaration (`src/preload/index.d.ts`)

```typescript
tunnelExecution: {
  onStateChanged: (callback: (payload: TunnelStateChangedPayload) => void) => () => void
  getState: () => Promise<TunnelStateChangedPayload>
}
```

---

## Renderer Subscription Pattern

```typescript
useEffect(() => {
  // Get initial state on mount
  window.api.tunnelExecution.getState().then(setTunnelState)

  // Subscribe to live updates
  const unsubscribe = window.api.tunnelExecution.onStateChanged(setTunnelState)
  return unsubscribe // cleanup on unmount
}, [])
```

---

## Error Conditions

| Condition | Behaviour |
|---|---|
| No active tunnel config on startup | State pushed as `not_configured`; no process spawned |
| Tunnel command not found (ENOENT) | `error` event fires; state pushed as `error` |
| Tunnel process exits with non-zero code | `close` event fires; state pushed as `stopped` with `exitCode` |
| Process does not exit within 5s on shutdown | SIGKILL sent; state pushed as `not_configured` |
| Renderer not yet ready when state changes | Push is best-effort; renderer calls `getState()` on mount to recover |
