# Quickstart: Tunnel Configuration

**Feature**: 009-tunnel-config  
**Phase**: 1 — Design  

---

## What This Feature Does

Adds a "Tunnel" section to the Connection Configuration page. Users can:
- View all saved tunnel configurations in a dropdown
- Add new configurations (Name + Command)
- Edit existing configurations
- Remove configurations (with confirmation)
- Mark a configuration as "active" (the one the system will use)

The active tunnel is persisted in SQLite and pre-selected on page load.

---

## Implementation Order

1. **DB migration** — create `tunnel_configs` table
2. **Repository** — add CRUD functions to `src/main/database/config.ts`
3. **Service** — create `src/main/services/tunnel.service.ts`
4. **IPC handlers** — add `tunnelConfig:*` channels to `src/main/api/ipc.ts`
5. **Types** — add `TunnelConfig`, `TunnelConfigInput` to `src/types/ipc.ts`
6. **Preload** — expose `window.api.tunnelConfig` in `src/preload/index.ts` + `index.d.ts`
7. **UI** — add Tunnel section to `src/renderer/pages/ConnectionConfig.tsx`
8. **i18n** — add tunnel keys to `src/renderer/i18n/locales/en/common.json`
9. **Tests** — unit tests for service, E2E for UI flows

---

## Key Files

| File | Change |
|---|---|
| `src/main/database/migrations/sqls/20260403000000-tunnel-config-up.sql` | New — creates `tunnel_configs` table |
| `src/main/database/migrations/sqls/20260403000000-tunnel-config-down.sql` | New — drops `tunnel_configs` table |
| `src/main/database/migrations/20260403000000-tunnel-config.js` | New — migration JS wrapper |
| `src/main/database/config.ts` | Modified — add tunnel repository functions |
| `src/main/services/tunnel.service.ts` | New — CRUD + active state service |
| `src/main/api/ipc.ts` | Modified — register tunnel IPC handlers |
| `src/types/ipc.ts` | Modified — add TunnelConfig, TunnelConfigInput |
| `src/preload/index.ts` | Modified — expose tunnelConfig namespace |
| `src/preload/index.d.ts` | Modified — add tunnelConfig types |
| `src/renderer/pages/ConnectionConfig.tsx` | Modified — add Tunnel section below API Key |
| `src/renderer/i18n/locales/en/common.json` | Modified — add tunnel i18n keys |
| `tests/unit/tunnel.service.test.ts` | New — unit tests |
| `tests/e2e/tunnel-config.spec.ts` | New — E2E tests |

---

## UI Behaviour Summary

```
Connection Configuration page
├── Network Settings (existing)
├── API Key (existing)
└── Tunnel (NEW)
    ├── Dropdown: lists all tunnel configs by name; pre-selects active one
    ├── Add button (always enabled)
    ├── Edit button (enabled only when dropdown has selection)
    ├── Remove button (enabled only when dropdown has selection)
    └── Use button (enabled only when dropdown has selection)

Add/Edit Dialog:
├── Name text field (required)
├── Command text field (required)
├── Save button
└── Closes on outside click (no save)

Remove Confirmation Dialog:
├── "Are you sure?" message
├── Confirm button → deletes entry, refreshes dropdown
└── Cancel button
```

---

## Running Tests

```bash
npm run test:unit   # unit tests (Vitest via Electron Node)
npm run test:e2e    # E2E tests (Playwright)
npm test            # both
```
