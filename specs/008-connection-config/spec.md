# Feature Specification: Connection Configuration

**Feature Branch**: `008-connection-config`  
**Created**: 2026-04-02  
**Status**: Draft  
**Input**: User description: "Implement a Connection Configuration page in the UI that displays and allows editing of server connection settings using the existing server_config table. Add a Connection menu item to the left sidebar between Execution History and About with icon SettingsEthernet or Lan, TanStack Router route /connection. Page layout: at the top a server status indicator as MUI chip showing running in green with actual address and port or stopped/error in red, read via IPC on page load. Bind address as MUI Select dropdown with exactly two options: 127.0.0.1 labeled Localhost only recommended (default) and 0.0.0.0 labeled All interfaces LAN access — when 0.0.0.0 is selected show a red MUI Alert warning This exposes the server to your local network ensure your network is trusted. Port as MUI TextField type number validated to integer range 1024 to 65535 with inline error if out of range. API key display shows first 8 characters followed by bullet characters for the rest. Show toggle button reveals full key and auto-hides after 30 seconds with button label changing to Hide. Copy icon button next to key copies full API key to clipboard regardless of show/hide state and shows brief Copied snackbar. Regenerate button separate from Save opens MUI confirmation dialog All connected agents will lose access Generate a new API key with Cancel and Regenerate buttons — on confirm calls regenerateApiKey IPC and updates displayed key and server immediately uses new key without restart. Save button saves address and port to server_config via IPC. Before saving validates port range and checks port availability via checkPortAvailable IPC — if port in use shows error Port N is already in use. If address or port changed show warning dialog Server will restart and active connections will be dropped with Cancel and Save and Restart buttons — on confirm server restarts on new address and port. IPC contract: getServerConfig returns address port apiKey and status as running or stopped or error. updateServerConfig accepts optional address and port and returns success boolean and optional error string and triggers server restart if address or port changed. regenerateApiKey generates new UUID writes to DB and swaps key in server middleware memory without restart and returns new apiKey. checkPortAvailable accepts port number and returns available boolean by attempting net.createServer listen and immediate close. No new database table needed — uses existing server_config. All UI strings via i18next. MUI components only. No connection string builder — out of scope because format differs per tool and platform."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - View Connection Settings (Priority: P1)

Users can view the current server connection settings, including the server status, bind address, port, and a masked API key.

**Why this priority**: Core functionality of the configuration page, allowing users to verify their current connection details to connect external agents.

**Independent Test**: Can be fully tested by opening the app and navigating to the Connection page, which should display the current settings loaded from the database.

**Acceptance Scenarios**:

1. **Given** the user launches the app, **When** they click "Connection" in the sidebar, **Then** the Connection page is displayed with the current server status (e.g., running, stopped), address dropdown, port text field, and masked API key.
2. **Given** the user is on the Connection page, **When** they look at the API key, **Then** only the first 8 characters are visible, followed by bullets.
3. **Given** the user clicks the "Show" toggle button next to the API key, **Then** the full API key is revealed and the button changes to "Hide".
4. **Given** the full API key is revealed, **When** 30 seconds pass, **Then** the key is automatically masked again and the button reverts to "Show".

---

### User Story 2 - Modify Network Settings (Priority: P1)

Users can change the server's bind address and port to allow or restrict network access, triggering a server restart upon saving.

**Why this priority**: Essential for allowing external agents on a LAN to connect to the bridge.

**Independent Test**: Can be tested by changing the port or address, saving, confirming the restart dialog, and verifying the server restarts on the new settings.

**Acceptance Scenarios**:

1. **Given** the user is editing the bind address, **When** they select "0.0.0.0 (All interfaces LAN access)", **Then** a red warning alert is displayed advising them to ensure the network is trusted.
2. **Given** the user enters a port number outside the 1024-65535 range, **When** they lose focus or attempt to save, **Then** an inline error is shown indicating the invalid range.
3. **Given** the user enters a valid port that is already in use by another application, **When** they click "Save", **Then** an error "Port [N] is already in use" is shown and the save is aborted.
4. **Given** the user changes the address or port to valid and available values, **When** they click "Save", **Then** a warning dialog prompts them that the server will restart and active connections will drop.
5. **Given** the restart warning dialog is visible, **When** the user clicks "Save and Restart", **Then** the settings are saved, the server restarts with the new configuration, and the status chip updates accordingly.

---

### User Story 3 - Regenerate API Key (Priority: P2)

Users can regenerate the API key to invalidate previous connections and secure the server, which applies immediately without a full server restart.

**Why this priority**: Essential for security if an API key is compromised or needs rotation.

**Independent Test**: Can be tested by clicking "Regenerate", confirming the dialog, and verifying the new key is displayed and active immediately.

**Acceptance Scenarios**:

1. **Given** the user is on the Connection page, **When** they click "Regenerate" next to the API key, **Then** a confirmation dialog warns that all connected agents will lose access.
2. **Given** the regeneration confirmation dialog is open, **When** the user confirms the action, **Then** a new API key is generated, saved, loaded into memory, and displayed immediately without restarting the main server listener.
3. **Given** the user wants to copy the API key, **When** they click the "Copy" icon button, **Then** the full API key is copied to their clipboard and a "Copied" snackbar briefly appears.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a "Connection" navigation link in the left sidebar between "Execution History" and "About".
- **FR-002**: System MUST display the current server status (running, stopped, error) with address and port in a UI indicator.
- **FR-003**: System MUST provide a dropdown to select the bind address with exactly two options: 127.0.0.1 (Localhost only) and 0.0.0.0 (All interfaces LAN access).
- **FR-004**: System MUST display a warning alert when the 0.0.0.0 address is selected.
- **FR-005**: System MUST provide a numeric input for the port and validate it falls within the 1024 to 65535 range.
- **FR-006**: System MUST mask the API key, showing only the first 8 characters by default.
- **FR-007**: System MUST provide a toggle to reveal the full API key that automatically hides the key after 30 seconds.
- **FR-008**: System MUST provide a copy button to copy the full API key to the clipboard, displaying a success snackbar.
- **FR-009**: System MUST provide a "Regenerate" button for the API key that prompts for confirmation before proceeding.
- **FR-010**: System MUST immediately generate a new UUID API key, persist it, and apply it to the running server middleware without a full server restart upon regeneration confirmation.
- **FR-011**: System MUST validate port availability before saving network settings and display an error if the port is in use.
- **FR-012**: System MUST prompt for confirmation before saving network settings, warning that the server will restart and drop connections.
- **FR-013**: System MUST save network settings and restart the server upon confirmation.
- **FR-014**: System MUST use the existing `server_config` database table.
- **FR-015**: System MUST localize all UI text via i18next.

### Key Entities

- **Server Configuration**: Stores the active bind address, port, and API key.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Users can successfully view, copy, and regenerate their API key.
- **SC-002**: Users can successfully change their server's bind address and port.
- **SC-003**: The system successfully prevents users from saving an invalid port or a port that is already in use 100% of the time.
- **SC-004**: API key regeneration applies immediately, and new network settings successfully restart the server.

## Assumptions

- The `server_config` database table already exists and has columns for address, port, and apiKey.
- The UI is built entirely with Material UI (MUI) components as per the project standards.
- A connection string builder is out of scope.
- "Running" status implies the Express server is actively listening on the configured address and port.