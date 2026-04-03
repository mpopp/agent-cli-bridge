# Phase 1: Data Model

## Entities

### ExecutionLogEntry (Existing)
No new database tables or migrations are required. The existing `ExecutionLogEntry` entity will be used for the payload of the real-time update.

```typescript
// Type definition for the payload sent over IPC
export interface ExecutionLogEntry {
  id: number;
  command: string;
  status: 'Executed' | 'Blocked' | 'Running' | 'Failed';
  output?: string;
  createdAt: string;
}
```

## State Changes
- The `HistoryService` will need a way to emit events when a new entry is saved to the database.
- It will likely use a standard Node.js `EventEmitter` or a direct callback to notify the IPC layer.

```typescript
export interface HistoryManagerEvents {
  newEntry: (entry: ExecutionLogEntry) => void;
}
```