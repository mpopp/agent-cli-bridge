# Data Model: POST /exec Endpoint

## Entities

### Execution Configuration
Stores system-wide limits for command execution. Restricted to a single record within the database.

**Fields**:
- `id` (INTEGER, Primary Key): Hardcoded to 1 to enforce single row.
- `timeout_seconds` (INTEGER): Default 30.
- `max_output_mb` (INTEGER): Default 10.

**Validation Rules**:
- `timeout_seconds` MUST be > 0.
- `max_output_mb` MUST be > 0.
- Database schema and repository constraints ensure only one configuration row is ever persisted.
