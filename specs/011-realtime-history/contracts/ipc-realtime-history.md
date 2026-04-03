# Phase 1: IPC Contracts

## Channel: `execution-history:newEntry` (Push)

This channel is used by the main process to push newly created execution log entries to the renderer in real-time.

### Direction
Main -> Renderer (Push)

### Payload
```typescript
interface ExecutionLogEntry {
  id: number;
  command: string;
  status: 'Executed' | 'Blocked' | 'Running' | 'Failed';
  output?: string;
  createdAt: string;
}
```

### Preload Exposure
```typescript
// src/preload/index.ts
import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  executionHistory: {
    // Existing methods...
    
    // New listener method
    onNewEntry: (callback: (entry: ExecutionLogEntry) => void) => {
      const subscription = (_event: any, entry: ExecutionLogEntry) => callback(entry);
      ipcRenderer.on('execution-history:newEntry', subscription);
      return () => {
        ipcRenderer.removeListener('execution-history:newEntry', subscription);
      };
    }
  }
});
```

### Renderer Usage
```typescript
// src/renderer/pages/ExecutionHistory.tsx
useEffect(() => {
  const unsubscribe = window.api.executionHistory.onNewEntry((newEntry) => {
    // Prepend to state if it matches the current filter
    if (matchesFilter(newEntry, currentFilter)) {
      setEntries((prevEntries) => [newEntry, ...prevEntries]);
    }
  });
  
  return () => {
    unsubscribe();
  };
}, [currentFilter]);
```