# Quickstart: Connection Configuration

## Setup
Ensure all dependencies are installed.

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
npm test
```

### Manual Verification
1. Launch the application.
2. Navigate to "Connection" in the sidebar.
3. **View Settings**: Observe the server status, address, port, and masked API key.
4. **API Key Interaction**: 
   - Click "Show" to reveal the API key. Wait 30 seconds to verify it auto-hides.
   - Click "Copy" and verify it's copied to your clipboard.
   - Click "Regenerate", confirm the dialog, and verify a new key appears immediately.
5. **Network Settings**:
   - Change address to `0.0.0.0` and observe the warning alert.
   - Enter an invalid port (e.g., `80`) and verify the error message.
   - Change port to a valid one, click "Save", confirm the restart, and verify the server restarts on the new port without crashing.