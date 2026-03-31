# Phase 0: Research & Technical Unknowns

## 1. Port Selection Logic

**Task**: How to efficiently find the first free port between 3000 and 5000, and fallback to any random OS port if all are taken.
**Decision**: Implement a custom asynchronous loop using Node's native `net` module.
**Rationale**: Node's `net.createServer().listen(port)` combined with a simple `try/catch` and a `for` loop (from 3000 to 5000) provides a robust, zero-dependency way to find a free port. If the loop completes without finding a port, we can call `.listen(0)` to get a random OS-assigned port. This avoids adding a third-party dependency like `get-port` for a relatively simple requirement.
**Alternatives considered**: 
- `get-port` package: Excellent and robust, but adds an external dependency for a task we can perform natively with 20 lines of code.

## 2. API Key Generation

**Task**: How to securely generate a UUID v4.
**Decision**: Use Node's native `crypto.randomUUID()`.
**Rationale**: `crypto.randomUUID()` is natively available in Node.js (since v14.17.0/v15.6.0) and generates cryptographically secure v4 UUIDs without requiring the external `uuid` package.
**Alternatives considered**: 
- `uuid` npm package: Unnecessary dependency given native support.

## 3. Express within Electron Main Process

**Task**: Ensure the Express server does not block the Electron UI/main process.
**Decision**: Initialize and bind the Express server during or immediately after `app.whenReady()`.
**Rationale**: Node.js and Express are inherently asynchronous and non-blocking. Starting an Express server in the Electron main process runs it on the same event loop, but network I/O is offloaded. It will not block the Electron UI or other IPC messages.
**Alternatives considered**: 
- Running the server in a separate hidden renderer process or Node.js worker thread: Adds significant IPC overhead and complexity without substantial benefit for a lightweight API.

## 4. OpenAPI Specification

**Task**: How to integrate the `GET /health` endpoint specification according to "OpenAPI First" principles.
**Decision**: Define the `/health` endpoint directly in the existing root `openapi.yaml` file. The server will expose this file statically if requested, or we can just keep it as documentation for now.
**Rationale**: The constitution mandates the root `openapi.yaml` as the single source of truth.

All unknowns resolved.
