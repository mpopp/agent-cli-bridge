# Data Model: Embed Express Server

## Entities

### `ServerConfiguration`

Represents the persisted configuration for the embedded Express server. It ensures that the application uses the same port and authentication key across application restarts.

**Logical Concept**: Server Config
**Table Storage**: Likely stored in a dedicated `server_config` table or a generic `config` key-value table within the SQLite database.

**Fields**:
- `id` (INTEGER, Primary Key): Single row identifier.
- `port` (INTEGER): The port the server listens on (between 3000-5000, or any free port).
- `api_key` (TEXT): The generated UUID v4 used for authentication (`x-api-key`).
- `created_at` (TEXT/DATETIME): Timestamp of initial creation.
- `updated_at` (TEXT/DATETIME): Timestamp of last update.

**State Transitions**:
- **Uninitialized**: No configuration exists in the database.
- **Initialized**: Upon first startup, `port` and `api_key` are generated, validated, and persisted.
- **Port Conflict Recovery**: If the saved port becomes occupied by another application, a new port is dynamically found and the `updated_at` and `port` fields are updated.

**Relationships**:
None. This is an isolated configuration entity.
