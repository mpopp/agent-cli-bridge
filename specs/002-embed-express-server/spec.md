# Feature Specification: Embed Express Server

**Feature Branch**: `002-embed-express-server`  
**Created**: 2026-03-31  
**Status**: Implemented
**Input**: User description: Integrate an embedded HTTP Express server in the Electron main process. It has to start up when the app starts up and listen to 127.0.0.1. Port and API key have to be saved and loaded from the database. On the first start up there will be no API key and port stored in the database. In that case it has to fall back to a random UUID v4 as the API key and the first free port between the port 3000 and 5000. These values should then be stored in the database on the first start up. Subsequent start ups have to read from the database and use the values that are stored there. The only endpoint that we are adding right now is the GET /health endpoint which has to return a JSON with the status and the hostname when it succeeds. In case of failure the endpoint has to return a 401 status when no API key or an invalid API key is handed in. It has to return a 404 status if the endpoint is not available. It has to return a 400 status if the request is invalid and it has to return a 500 status in all other server error cases. The reference implementation for this endpoint can be found in the server.js file that makes up the rough prototype for the application that we are building but you should only take out the part from the /health endpoint right now for this feature. ../../_prototype/server.js

## Clarifications

### Session 2026-03-31

- Q: Edge Cases & Failure Handling - Storage Read Failure → A: On storage read failures an error should be logged
- Q: Edge Cases & Failure Handling - Port Range Exhaustion → A: Pick any random available port provided by the OS
- Q: Edge Cases & Failure Handling - Saved Port Occupied → A: The system finds a new free port, updates the database, and continues

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Background Server Initialization (Priority: P1)

As a system process, the application needs to host a local HTTP server upon launch to handle incoming commands securely.

**Why this priority**: It is the foundation of the feature; without a running server, no requests can be served.

**Independent Test**: Can be tested independently by launching the application and verifying via network tools that a process is listening on `127.0.0.1` on a port between `3000` and `5000`.

**Acceptance Scenarios**:

1. **Given** the application starts for the first time without prior configuration, **When** the startup sequence runs, **Then** it allocates a free port between 3000-5000, generates a UUID v4 API key, and persists them to the local database.
2. **Given** the application has previously persisted server configuration, **When** it starts up, **Then** it retrieves the same port and API key from the database and binds the server accordingly.

---

### User Story 2 - Health Check & Security (Priority: P1)

As a client interacting with the embedded server, I need to reliably check its availability and authenticate my requests to prevent unauthorized access.

**Why this priority**: Security is critical. The server must only accept requests from authorized clients possessing the correct API key.

**Independent Test**: Can be tested independently by issuing `GET /health` requests with valid, invalid, and missing API keys.

**Acceptance Scenarios**:

1. **Given** the server is running, **When** a `GET /health` request is made with the correct `x-api-key` header, **Then** it returns a 200 OK status with a JSON payload containing `{"status": "ok"}` and the machine's hostname.
2. **Given** the server is running, **When** a request is made with no `x-api-key` header or an incorrect one, **Then** it returns a 401 Unauthorized status.
3. **Given** the server is running, **When** a request targets an unregistered endpoint, **Then** it returns a 404 Not Found status.
4. **Given** the server is running, **When** a structurally invalid request is received, **Then** it returns a 400 Bad Request status.
5. **Given** the server is running, **When** an internal server error occurs, **Then** it returns a 500 Internal Server Error status.

---

### Edge Cases

- When all ports between 3000 and 5000 are in use, the server should pick any random available port provided by the OS and log a warning.
- On storage read failures an error should be logged.
- If the previously saved port is occupied upon restart, the system should find a new free port, update the database, and continue.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST start an HTTP Express server in the Electron main process listening on `127.0.0.1`.
- **FR-002**: System MUST dynamically determine the first available port between 3000 and 5000 if no port is stored in the database.
- **FR-003**: System MUST generate a random UUID v4 as the API key if no API key is stored in the database.
- **FR-004**: System MUST store the API key and port in the database on first startup.
- **FR-005**: System MUST retrieve and use the stored API key and port from the database on subsequent startups.
- **FR-006**: System MUST provide a `GET /health` endpoint that returns a JSON object with a success status and the system hostname.
- **FR-007**: System MUST authenticate requests to `/health` requiring the `x-api-key` header to match the active API key, returning a 401 status on failure.
- **FR-008**: System MUST return a 404 status if a requested endpoint is not available.
- **FR-009**: System MUST return a 400 status for invalid requests.
- **FR-010**: System MUST return a 500 status for all other server error cases.

### Key Entities

- **Server Configuration**: Stores the `apiKey` and `port` for the embedded server, persisted to ensure continuity across sessions.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The embedded server successfully binds to `127.0.0.1` and begins listening within 3 seconds of the main process launch.
- **SC-002**: 100% of requests missing the valid `x-api-key` header are rejected with a 401 Unauthorized status.
- **SC-003**: The API key and port configuration remain identical across 100% of regular application restarts.
- **SC-004**: Valid `GET /health` requests are processed and returned in under 100 milliseconds.

## Assumptions

- An embedded database or persistent store mechanism (like SQLite or `electron-store`) is already integrated and available for use.
- Only the `GET /health` endpoint is implemented as part of this specific feature scope.