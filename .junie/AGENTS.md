# agent-cli-bridge Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-04-01

## Active Technologies
- TypeScript 5.x, Node.js 22.x LTS + Electron, Express.js 5.x, better-sqlite3, get-port (or native net module) (002-embed-express-server)
- SQLite (via better-sqlite3) (002-embed-express-server)
- TypeScript 5.x, Node.js 22.x LTS, validator.js + None (pure TS, native Node.js built-in `RegExp` and `String.prototype.normalize`) (003-security-engine)

- TypeScript 5.x (strict mode), Node.js 22.x LTS + Electron, electron-vite, React 19.x, Material UI (MUI), TanStack Router (001-project-bootstrap)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x (strict mode), Node.js 22.x LTS: Follow standard conventions

## Recent Changes
- 003-security-engine: Added TypeScript 5.x, Node.js 22.x LTS + None (pure TS, native Node.js built-in `RegExp` and `String.prototype.normalize`)
- 003-security-engine: Added [if applicable, e.g., PostgreSQL, CoreData, files or N/A]
- 002-embed-express-server: Added TypeScript 5.x, Node.js 22.x LTS + Electron, Express.js 5.x, better-sqlite3, get-port (or native net module)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
