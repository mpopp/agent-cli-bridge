# Agent CLI Bridge

**Give AI agents secure access to your Linux terminal.**

Agent CLI Bridge is a local Electron/Node.js application that exposes a REST API for AI-powered chat services (like ChatGPT, Claude, or Langdock) to execute commands on your machine. Combined with a tunneling service like [ngrok](https://ngrok.com/) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/), it lets any AI assistant interact with your terminal over the internet -- securely and under your control.

This project is being developed using **Specification-Driven Development** -- all features are designed spec-first and built with AI assistance. The OpenAPI specification serves as the single source of truth for the API.


https://github.com/user-attachments/assets/d3ae225b-cef0-4fe2-980b-caa140584e3c

---

## Why?

AI assistants are great at generating commands -- but they can't run them. You end up copy-pasting between your chat and your terminal, back and forth, dozens of times.

Agent CLI Bridge closes that gap. Your AI assistant sends commands, your machine executes them, and the output goes right back to the chat. No copy-paste, no context switching.

**Use cases:**
- Let an AI agent help you debug a server -- live, on your actual machine
- Automate repetitive terminal workflows through natural conversation
- Give an AI coding assistant real access to your dev environment
- Explore and manage your file system through chat

---

## How It Works

```
+----------------+       +---------------+       +--------------------+
|    AI Chat     |------>|    Tunnel     |------>| Agent CLI Bridge   |
|  (ChatGPT,    | HTTPS |  (ngrok /     | HTTP  |   (localhost)      |
|   Claude,      |<------|  Cloudflare)  |<------|                    |
|   Langdock)    |       +---------------+       |  +--------------+  |
+----------------+                               |  | Your Shell   |  |
                                                  |  +--------------+  |
                                                  +--------------------+
```

1. **Start Agent CLI Bridge** -- it launches a local REST API (port is auto-assigned on first start, shown in the UI, and persisted for future runs)
2. **Configure your tunnel** -- save your ngrok or Cloudflare tunnel command in the UI; Agent CLI Bridge starts it automatically on every launch
3. **Connect your AI service** -- use the public tunnel URL as a tool/API endpoint in your AI chat
4. **Chat and execute** -- your AI assistant sends commands via the API, your machine runs them, results go back

---

## Quick Start

### Prerequisites

- **Node.js 22.x LTS**
- **Linux** (primary target)
- A tunneling service: [ngrok](https://ngrok.com/) (free tier available) or [Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/)

### 1. Clone and install

```bash
git clone https://github.com/mpopp/agent-cli-bridge.git
cd agent-cli-bridge
npm install
```

### 2. Start the application

```bash
npm run dev
```

The app starts and automatically selects a port for the REST API. The port is displayed in the Electron UI and saved to the local database. You can change it manually in the UI if needed -- all subsequent starts will use the saved port.

### 3. Configure your tunnel

Open the **Connection Configuration** page in the UI and scroll to the **Tunnel** section. Click **Add** to save a tunnel command by name:

```
Name:    My ngrok tunnel
Command: ngrok http PORT
```

Replace `PORT` with the API port shown in the UI (or use `$PORT` if your tunnel command supports it). Once saved, select the entry and click **Use** to mark it as active.

Agent CLI Bridge will automatically start the configured tunnel command every time the application launches. You can save multiple configurations and switch between them at any time.

The **Tunnel** status chip in the top-right corner shows the current state: **Running**, **Stopped**, **Error**, or **Not Configured**.

### 4. Connect your AI service

Copy the public tunnel URL (e.g. `https://abc123.ngrok-free.app`) and configure it as a tool endpoint in your AI chat service.

All API calls require your API key (also shown in the UI) -- see [Security](#security).

---

## Tunnel Management

Agent CLI Bridge has built-in support for managing and auto-starting your tunnel, so you never need to open a separate terminal to keep the tunnel alive.

### Saving tunnel configurations

On the **Connection Configuration** page, the **Tunnel** section lets you maintain a list of named tunnel commands:

- **Add** -- opens a dialog with a **Name** and **Command** field. Fill in both and click **Save** to store the configuration.
- **Edit** -- opens the same dialog pre-filled with the selected entry so you can update it.
- **Remove** -- asks for confirmation before deleting the entry. If the deleted entry was active, the tunnel is stopped first and the active state is cleared.
- **Use** -- marks the selected entry as the active tunnel configuration. The previously running tunnel (if any) is stopped immediately and the new command is started.

The dropdown always pre-selects the currently active configuration so you can see at a glance which tunnel command is in use.

### Automatic startup

When the application starts and an active tunnel configuration is set, the configured command is executed automatically in the background. No manual intervention or extra terminal window is needed.

### Status monitoring

Two status chips are displayed in the top-right corner of the application:

| Chip | Description |
|---|---|
| **Rest Server** | State of the local REST API (previously labelled "Server") |
| **Tunnel** | State of the tunnel process |

The **Tunnel** chip can show the following states:

| State | Meaning |
|---|---|
| Running | Tunnel process is active |
| Stopped | Process terminated unexpectedly |
| Error | Process failed to start |
| Not Configured | No active tunnel configuration is set |

### Clean shutdown

When you close the application, the running tunnel process is terminated cleanly. If it does not exit within a reasonable timeout (5 seconds), it is forcefully killed -- ensuring no orphaned tunnel processes are left behind.

---

## Security

> **Warning: This tool exposes a shell on your machine to the internet. Understand the risks before using it.**

### Security philosophy

The security measures in Agent CLI Bridge serve different purposes:

**The API key** is the outer gate -- it prevents unauthorized access to the API entirely. Without a valid key, no requests are processed.

**The command blocklist and audit log** are not designed to stop a determined attacker. They exist to protect you from your own AI agent. Large language models can misinterpret instructions in unexpected ways. When you ask an agent to "free up disk space", it might conclude that formatting the drive is the most efficient solution. The command blocklist is a safety net against these kinds of accidental, destructive commands -- not a security boundary against intentional attacks.

**The audit log** gives you full visibility into what your AI agent has been doing. If something goes wrong, you can review exactly which commands were executed and take corrective action.

### What is in place:

- **API key authentication** -- every request must include a valid API key via the `x-api-key` header. Without it, the API rejects all calls. The API key is generated automatically and can be viewed in the UI.
- **Command blocklist** -- a hardcoded list of dangerous commands is blocked by default (e.g. disk formatting, fork bombs, recursive deletions). This catches the most critical destructive operations that an AI agent might trigger by mistake. The list is not exhaustive. See [`blocklist.ts`](src/main/security/blocklist.ts) in the source code.
- **Command audit log** -- every executed command is logged in the UI with full details, retained for 90 days. Entries older than 90 days are cleaned up on each application start. Use this to review agent activity and catch unintended actions early.
- **Your user, your permissions** -- the shell runs under the same user account that started the tool. It cannot do anything your user can't do.

### Limitations:

- No sandboxing -- commands run directly in your shell, not in a container
- No configurable allowlist/blocklist -- the blocklist is hardcoded; to modify it, you need to edit the source code
- No rate limiting
- The blocklist is a best-effort safety net, not a comprehensive security boundary

### Recommendations:

- **Do not run as root.** Create a dedicated user with limited permissions if possible.
- **Use a short-lived tunnel.** Only start the tunnel when you need it, shut it down when you are done.
- **Check the audit log regularly.** Review what your AI agent has been executing, especially after longer sessions.
- **Use on development machines, not production servers.**

---

## API

Agent CLI Bridge exposes a REST API. All endpoints require the `x-api-key` header for authentication.

The full API specification is available in [`openapi.yaml`](openapi.yaml).

### `GET /health`

Returns the health status and system hostname.

```bash
curl https://your-tunnel-url.ngrok-free.app/health \
  -H "x-api-key: YOUR_API_KEY"
```

**Response (200):**
```json
{
  "status": "ok",
  "hostname": "user-desktop-123"
}
```

### `POST /exec`

Executes a shell command and returns the result.

```bash
curl -X POST https://your-tunnel-url.ngrok-free.app/exec \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{"command": "echo Hello World", "cwd": "/home/user"}'
```

| Field | Type | Required | Description |
|---|---|---|---|
| `command` | string | Yes | The shell command to execute |
| `cwd` | string | No | Working directory for execution |

**Response (200):**
```json
{
  "data": {
    "exitCode": 0,
    "stdout": "Hello World\n",
    "stderr": ""
  },
  "error": null,
  "meta": {}
}
```

**Error responses:**

| Status | Meaning |
|---|---|
| `400` | Invalid or missing payload |
| `401` | API key missing or invalid |
| `403` | Command blocked by security rules |
| `500` | Internal server error or execution failure |

---

## Tested With

| AI Service | Status | Notes |
|---|---|---|
| [Langdock](https://langdock.com) | Tested | Works via REST API tool integration |
| [ChatGPT](https://chat.openai.com) | Should work | Any service supporting custom API tools |
| [Claude](https://claude.ai) | Should work | Via MCP or custom tool integration |

Since Agent CLI Bridge uses a standard REST API, it should be compatible with any AI service that supports calling external HTTP endpoints.

---

## Tech Stack

- **Electron** -- desktop UI
- **Node.js 22.x** -- runtime
- **SQLite** -- local storage for settings and audit log
- **TypeScript** -- all source code
- **OpenAPI 3.1** -- API specification (spec-driven development)

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the application in development mode |
| `npm run build` | Build the application |
| `npm test` | Run all tests (unit, integration, e2e) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |

---

## Roadmap

Ideas for future development -- no guarantees or timelines:

- [ ] Configurable command allowlist / blocklist via UI
- [ ] Sandboxed execution (container-based)
- [ ] Pre-built binaries (AppImage, .deb)

---

## Contributing

Contributions are welcome! Whether it is bug reports, feature requests, or pull requests -- all input is appreciated.

<!-- TODO: Add CONTRIBUTING.md with detailed guidelines -->

---

## Support This Project

If Agent CLI Bridge is useful to you, consider supporting its development:

[![Sponsor on GitHub](https://img.shields.io/badge/Sponsor-%E2%9D%A4-pink?logo=github)](https://github.com/sponsors/mpopp)

### Sponsors

*Your name or logo here -- [become a sponsor](https://github.com/sponsors/mpopp)*

---

## License

[MIT](LICENSE) -- free for personal and commercial use.
