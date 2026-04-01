# Quickstart: POST /exec Endpoint

## Overview
This feature implements the core `POST /exec` endpoint for the API, allowing authenticated AI agents to execute shell commands. It integrates the previously built Security Engine to validate commands before execution and introduces a secure executor that runs child processes with strict limits (timeout, output buffer size).

## Getting Started
1. Start the application in development mode: `npm run dev`
2. Obtain your local API key from the database or the application's startup log.
3. Test a valid command:
```bash
curl -X POST http://127.0.0.1:<PORT>/exec \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command": "echo hello", "cwd": "/"}'
```
4. Test a blocked command:
```bash
curl -X POST http://127.0.0.1:<PORT>/exec \
  -H "X-API-Key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"command": "rm -rf /", "cwd": "/"}'
```
Expect a `403 Forbidden` response.

## Development & Testing
Run the full test suite (unit + integration + e2e):
```bash
npm test
```
Run only linting:
```bash
npm run lint
```

The executor tests ensure that malicious commands are not executed against the real filesystem by mocking the actual process execution. Integration tests spin up the Express app in-process with a mocked database and use Node's native `fetch` to exercise the full request/response cycle.

## Implementation Notes

- **Security**: The `POST /exec` endpoint always runs the Security Engine blocklist check before spawning any process. Blocked commands return `403 Forbidden` immediately.
- **Process termination**: The executor uses `detached: true` with `process.kill(-pid, 'SIGKILL')` to kill the entire process group on timeout or output-size exceeded, ensuring no runaway child processes survive.
- **Execution limits**: Timeout (seconds) and max output size (MB) are read from the `exec_config` table (single row, id=1, defaults: 30s / 10MB).
- **Envelope format**: All responses follow `{ data, error, meta }`. On success, `data` contains `{ exitCode, stdout, stderr }`. On error, `error` contains `{ code, message }`.
- **Auth**: All requests require a valid `X-API-Key` header matching the value stored in `server_config`.