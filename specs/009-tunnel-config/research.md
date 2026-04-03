# Research: Tunnel Configuration

**Feature**: 009-tunnel-config  
**Phase**: 0 — Research  
**Status**: Complete

## Summary

All unknowns resolved by examining the existing codebase. No external research required. All decisions follow established patterns.

---

## Decision 1: Storage — SQLite table via db-migrate

- **Decision**: Add a `tunnel_configs` table and an `active_tunnel_id` column (or separate single-row table) via a new db-migrate migration, following the exact pattern of `20260401000000-exec-config`.
- **Rationale**: The project already uses db-migrate + better-sqlite3 for all persistent state. Consistent with existing migrations.
- **Alternatives considered**: Storing in `server_config` table — rejected (unrelated concern, violates single-responsibility). Separate JSON file — rejected (project uses SQLite exclusively).

---

## Decision 2: Active tunnel state — column in `tunnel_configs` table

- **Decision**: Use an `is_active INTEGER NOT NULL DEFAULT 0` boolean column on `tunnel_configs`. Only one row may have `is_active = 1` at a time; enforced at the service layer (set all to 0, then set selected to 1 in a transaction).
- **Rationale**: Simplest approach; no extra table needed. SQLite transactions make the "only one active" invariant easy to enforce.
- **Alternatives considered**: Separate `active_tunnel` single-row table — rejected (more complex, no benefit at this scale). Foreign key in `server_config` — rejected (unrelated concern).

---

## Decision 3: IPC pattern — follow existing `connectionConfig` namespace

- **Decision**: Add a `tunnelConfig` namespace to the preload `window.api` object, exposing: `getAll`, `add`, `update`, `remove`, `setActive`. All handlers registered in `src/main/api/ipc.ts`.
- **Rationale**: Mirrors the existing `connectionConfig` and `executionHistory` namespaces exactly.
- **Alternatives considered**: REST API endpoints — rejected (Constitution III requires OpenAPI-first for REST; this is UI-only internal feature, IPC is appropriate).

---

## Decision 4: Duplicate names allowed

- **Decision**: No uniqueness constraint on `name` column. The spec clarifies: "duplicate tunnel names are allowed. Name does not serve as an identifier."
- **Rationale**: Spec clarification from 2026-04-03 session.

---

## Decision 5: Validation — empty name/command rejected in dialog

- **Decision**: Client-side validation in the Add/Edit dialog: both Name and Command must be non-empty strings (trimmed). Error message shown inline; dialog stays open.
- **Rationale**: Spec clarification: "The dialog is not closed and the error is displayed."
- **Alternatives considered**: Server-side (IPC handler) validation — also added as a safety net, but primary UX is client-side.

---

## Decision 6: Active state cleared on delete of active tunnel

- **Decision**: When the active tunnel is deleted, `is_active` is simply removed with the row. No other row is promoted. The UI shows empty dropdown with no error.
- **Rationale**: Spec clarification: "The active state is cleared (no active tunnel)."

---

## Decision 7: UI framework — MUI v7 components

- **Decision**: Use MUI `Select` (controlled) for the dropdown, `Button` for actions, `Dialog` for Add/Edit and Remove confirmation, following the existing `ConnectionConfig.tsx` patterns.
- **Rationale**: MUI v7 is already the UI framework. Consistent look and feel.

---

## Resolved Clarifications (from spec)

| Question | Answer |
|---|---|
| Duplicate names? | Allowed; name is not an identifier |
| Active tunnel deleted? | Active state cleared; dropdown empty, no error |
| Empty name/command on save? | Dialog stays open, error displayed |
| Click outside dialog? | Dialog closes, no data persisted |
