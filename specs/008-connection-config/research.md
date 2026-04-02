# Research: Connection Configuration

## Decision: Port Validation
**Rationale**: Use `net` module in Node.js or `get-port` to check if the user-entered port is available on the specified address before allowing save.
**Alternatives considered**: 
- Just restart the server and show an error if it fails. Rejected due to poor UX.

## Decision: API Key Regeneration without Server Restart
**Rationale**: In the Express middleware, the active API key can be dynamically fetched from a service or variable that updates when regenerated, thus avoiding a full restart of the `listen()` call.
**Alternatives considered**: 
- Restarting the Express server. Rejected because it unnecessarily drops active connections just for an API key rotation, which is explicitly against requirements (FR-010).

## Decision: UI Component for API Key
**Rationale**: Use a standard MUI `TextField` with `type="password"` or custom masked display, paired with `InputAdornment` for Show/Hide and Copy buttons. The 30s timeout will be handled by a React `useEffect` with `setTimeout`.
**Alternatives considered**:
- Custom component. Unnecessary, MUI provides all needed elements.

## Technical Unknowns Resolved
- **Server Restart Logic**: We need to implement a proper teardown (`server.close()`) and re-initialization of the Express server in the main process when address/port changes.