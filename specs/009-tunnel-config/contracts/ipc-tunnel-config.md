# IPC Contract: Tunnel Configuration

**Feature**: 009-tunnel-config  
**Phase**: 1 — Design  
**Interface type**: Electron IPC (Main ↔ Renderer via preload/contextBridge)

---

## Namespace: `window.api.tunnelConfig`

All channels are invoked via `ipcRenderer.invoke(channel, ...args)` and handled by `ipcMain.handle(channel, handler)`.

---

### `tunnelConfig:getAll`

**Direction**: Renderer → Main  
**Args**: none  
**Returns**: `TunnelConfig[]`  
**Description**: Returns all saved tunnel configurations, ordered by creation date ascending. The active one has `isActive: true`.

```typescript
window.api.tunnelConfig.getAll(): Promise<TunnelConfig[]>
```

---

### `tunnelConfig:add`

**Direction**: Renderer → Main  
**Args**: `input: TunnelConfigInput` (`{ name: string, command: string }`)  
**Returns**: `TunnelConfig` (the newly created entry)  
**Errors**: Throws if name or command is empty (after trim)  
**Description**: Creates a new tunnel configuration. Does not set it as active.

```typescript
window.api.tunnelConfig.add(input: TunnelConfigInput): Promise<TunnelConfig>
```

---

### `tunnelConfig:update`

**Direction**: Renderer → Main  
**Args**: `id: number`, `input: TunnelConfigInput`  
**Returns**: `TunnelConfig` (the updated entry)  
**Errors**: Throws if id not found, or name/command is empty  
**Description**: Updates name and command of an existing tunnel configuration.

```typescript
window.api.tunnelConfig.update(id: number, input: TunnelConfigInput): Promise<TunnelConfig>
```

---

### `tunnelConfig:remove`

**Direction**: Renderer → Main  
**Args**: `id: number`  
**Returns**: `boolean` (true on success)  
**Description**: Deletes the tunnel configuration. If it was active, active state is cleared (no other entry becomes active).

```typescript
window.api.tunnelConfig.remove(id: number): Promise<boolean>
```

---

### `tunnelConfig:setActive`

**Direction**: Renderer → Main  
**Args**: `id: number`  
**Returns**: `boolean` (true on success)  
**Description**: Marks the specified tunnel configuration as the currently active one. Clears active state from all other entries atomically.

```typescript
window.api.tunnelConfig.setActive(id: number): Promise<boolean>
```

---

## Preload Exposure (src/preload/index.ts)

```typescript
tunnelConfig: {
  getAll: (): Promise<TunnelConfig[]> => ipcRenderer.invoke('tunnelConfig:getAll'),
  add: (input: TunnelConfigInput): Promise<TunnelConfig> => ipcRenderer.invoke('tunnelConfig:add', input),
  update: (id: number, input: TunnelConfigInput): Promise<TunnelConfig> => ipcRenderer.invoke('tunnelConfig:update', id, input),
  remove: (id: number): Promise<boolean> => ipcRenderer.invoke('tunnelConfig:remove', id),
  setActive: (id: number): Promise<boolean> => ipcRenderer.invoke('tunnelConfig:setActive', id),
}
```
