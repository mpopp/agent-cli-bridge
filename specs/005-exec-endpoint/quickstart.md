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
Run unit tests for the validator and executor modules:
```bash
npm test
```
The executor tests ensure that malicious commands are not executed against the real filesystem by mocking the actual process execution.