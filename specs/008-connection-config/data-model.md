# Data Model: Connection Configuration

## Entity: `server_config` (Existing Table)
Stores the application server network and authentication configuration. Only one row typically exists (id=1).

| Field | Type | Description |
|---|---|---|
| `id` | INTEGER (PK) | Unique identifier (always 1) |
| `address` | TEXT | Bind address ('127.0.0.1' or '0.0.0.0') |
| `port` | INTEGER | Port number (1024-65535) |
| `api_key` | TEXT | UUID used for authentication |

## Validation Rules
- `address`: Must be `127.0.0.1` or `0.0.0.0`.
- `port`: Must be between `1024` and `65535`. Must not be currently in use.
- `api_key`: Must be a valid UUID.

## Relationships
- None.

## Security & Encryption
- The API key is stored in plain text in the SQLite database, protected by standard OS-level file permissions.