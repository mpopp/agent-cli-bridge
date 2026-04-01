# Quickstart: Execution History

## Setup
Ensure all dependencies are installed and the database migrations are up to date.

```bash
npm install
npm run migrate
```

## Running the Application
Start the Electron application:

```bash
npm run dev
```

## Verifying the Feature

### Automated Verification
Run the unit and integration tests:

```bash
npm test tests/unit/execution-history
npm test tests/integration/execution-history
```

### Manual Verification
1. Launch the application.
2. Observe the sidebar on the left with "Execution History" and "About".
3. Run a few commands (via the existing dashboard or API).
4. Navigate to "Execution History".
5. Verify that:
   - All executed and blocked commands are listed.
   - Rows can be expanded to show `stdout`, `stderr`, or `blockReason`.
   - Filters work (All, Executed, Blocked).
   - "Load More" works if more than 50 entries exist.
   - "Clear History" prompts for confirmation and then clears all logs.
6. Verify NFR-001 by checking the database file permissions on disk (should rely on standard OS user permissions, not encrypted).
7. Check the "About" page for app version information.
