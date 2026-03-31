# Data Model: Project Bootstrap & Application Shell

## Entities

### `schema_migrations`

This is a framework-level entity required by `db-migrate` to track applied database migrations.

- **Attributes**:
  - `version` (String/Varchar): The version identifier of the migration.
- **Relationships**: None.
- **Rules**: Maintained automatically by the `db-migrate` tool.

_Note: No business entities are defined in this bootstrap phase._
