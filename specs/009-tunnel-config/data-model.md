# Data Model: Tunnel Configuration

**Feature**: 009-tunnel-config  
**Phase**: 1 — Design  

---

## Entity: TunnelConfig

Represents a saved tunnel command configuration.

### SQLite Table: `tunnel_configs`

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY AUTOINCREMENT | System-generated unique identifier |
| `name` | TEXT | NOT NULL | Display name (not unique; duplicates allowed) |
| `command` | TEXT | NOT NULL | The tunnel command string |
| `is_active` | INTEGER | NOT NULL DEFAULT 0 | Boolean (0/1); at most one row has value 1 |
| `created_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Creation timestamp |
| `updated_at` | DATETIME | DEFAULT CURRENT_TIMESTAMP | Last update timestamp |

### Validation Rules

- `name`: non-empty string (trimmed); max length not enforced at DB level
- `command`: non-empty string (trimmed); max length not enforced at DB level
- `is_active`: only one row may have `is_active = 1` at any time (enforced at service layer via transaction)

### State Transitions

```
[no active]  --setActive(id)-->  [id is active]
[id active]  --setActive(id2)--> [id2 is active]  (id cleared atomically)
[id active]  --remove(id)------> [no active]
```

---

## TypeScript Types (src/types/ipc.ts additions)

```typescript
export interface TunnelConfig {
  id: number;
  name: string;
  command: string;
  isActive: boolean;
}

export interface TunnelConfigInput {
  name: string;
  command: string;
}
```

---

## Migration

**File**: `src/main/database/migrations/sqls/20260403000000-tunnel-config-up.sql`

```sql
CREATE TABLE tunnel_configs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    command TEXT NOT NULL,
    is_active INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**Down**: `DROP TABLE IF EXISTS tunnel_configs;`

---

## Repository Functions (src/main/database/config.ts additions)

| Function | Signature | Description |
|---|---|---|
| `getAllTunnelConfigs` | `(): TunnelConfigRow[]` | Returns all rows ordered by `created_at ASC` |
| `insertTunnelConfig` | `(name, command): number` | Inserts row, returns new `id` |
| `updateTunnelConfig` | `(id, name, command): void` | Updates name/command + updated_at |
| `deleteTunnelConfig` | `(id): void` | Deletes row by id |
| `setActiveTunnelConfig` | `(id): void` | Transaction: set all is_active=0, then set id is_active=1 |
| `clearActiveTunnelConfig` | `(): void` | Sets all is_active=0 |
