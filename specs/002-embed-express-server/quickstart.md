# Quickstart: Embed Express Server

## Overview

The `agent-cli-bridge` application runs an embedded HTTP server directly within the Electron Main process. This server allows authenticated clients (e.g., AI agents) to interact securely with the local machine.

## Server Startup

1. **Automatic Initialization**: Start the Electron app (`npm run dev` or the built application).
2. **First Run Setup**: The app will automatically find an available port (between 3000 and 5000) and generate a secure `x-api-key`.
3. **Persistence**: These details are saved to the local SQLite database so the server always starts on the same port with the same key across restarts.

## Finding the Port & API Key

Currently, you can find the generated API key and Port in the application logs or by querying the local SQLite database (`app.getPath('userData')/agent-cli-bridge.db`). Future UI features will display this directly in the dashboard.

## Health Check Endpoint

Once the app is running, you can test the server using `curl`:

```bash
curl -H "x-api-key: YOUR_GENERATED_API_KEY" http://127.0.0.1:<YOUR_PORT>/health
```

**Expected Response (200 OK):**

```json
{
  "status": "ok",
  "hostname": "your-computer-name"
}
```

If the API key is missing or invalid, the server will return a `401 Unauthorized` status.
