# Quickstart: Project Bootstrap

This guide explains how to get the `agent-cli-bridge` running from scratch after the initial setup.

## Prerequisites

- Node.js 22.x LTS
- npm (comes with Node.js)

## Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start Development Mode**

   ```bash
   npm run dev
   ```

   This will start the Electron app with hot-module replacement for both main and renderer processes.
   You should see a minimal React window displaying the app name and versions.
   Logs will be pretty-printed to the terminal.

3. **Run Tests**

   ```bash
   npm test
   ```

   This runs Vitest unit/integration tests and Playwright E2E tests.

4. **Build for Production**
   ```bash
   npm run build
   ```
   This will output the compiled files to `dist` and `out`.
