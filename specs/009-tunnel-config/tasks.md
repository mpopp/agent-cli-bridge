# Tasks: Tunnel Configuration

**Input**: Design documents from `/specs/009-tunnel-config/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ipc-tunnel-config.md ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and type definitions — required before any story work begins

- [ ] T001 Create db-migrate migration file `src/main/database/migrations/20260403000000-tunnel-config.js` referencing the SQL files
- [ ] T002 Create SQL up-migration `src/main/database/migrations/sqls/20260403000000-tunnel-config-up.sql` creating `tunnel_configs` table with `id`, `name`, `command`, `is_active`, `created_at`, `updated_at` columns
- [ ] T003 Create SQL down-migration `src/main/database/migrations/sqls/20260403000000-tunnel-config-down.sql` dropping `tunnel_configs` table
- [ ] T004 [P] Add `TunnelConfig` and `NewTunnelConfig` TypeScript interfaces to `src/types/ipc.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Repository layer and service layer — MUST be complete before IPC handlers and UI can be built

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement tunnel repository functions (`getAllTunnelConfigs`, `insertTunnelConfig`, `updateTunnelConfig`, `deleteTunnelConfig`, `setActiveTunnelConfig`, `getActiveTunnelConfig`) in `src/main/database/config.ts`
- [ ] T006 Create `src/main/services/tunnel.service.ts` with service functions (`getTunnelConfigs`, `addTunnelConfig`, `updateTunnelConfig`, `removeTunnelConfig`, `setActiveTunnel`, `getActiveTunnel`) wrapping the repository layer
- [ ] T007 Register all 5 IPC handlers (`tunnel-config:getAll`, `tunnel-config:add`, `tunnel-config:update`, `tunnel-config:remove`, `tunnel-config:setActive`) in `src/main/api/ipc.ts`
- [ ] T008 Expose `window.api.tunnelConfig` namespace (`getAll`, `add`, `update`, `remove`, `setActive`) via contextBridge in `src/preload/index.ts`
- [ ] T009 Add `tunnelConfig` API type declarations to `src/preload/index.d.ts`

**Checkpoint**: Foundation ready — all IPC channels functional, UI work can begin

---

## Phase 3: User Story 1 — Add a New Tunnel Configuration (Priority: P1) 🎯 MVP

**Goal**: User can open the Add dialog, fill in Name and Command, save, and see the new entry in the dropdown.

**Independent Test**: Open the Connection Configuration page → click "Add" → fill Name and Command → click Save → verify new entry appears in the dropdown.

- [ ] T010 [US1] Add `TunnelSection` component scaffold (dropdown + Add/Edit/Remove/Use buttons) to `src/renderer/pages/ConnectionConfig.tsx` below the API Key `<Paper>` block, wiring `useEffect` to load tunnel configs on mount via `window.api.tunnelConfig.getAll()`
- [ ] T011 [US1] Implement the Add/Edit dialog component (Name field, Command field, Save button, inline validation for empty fields) inside `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T012 [US1] Wire the "Add" button to open the dialog in add-mode; on Save call `window.api.tunnelConfig.add({ name, command })` and refresh the dropdown in `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T013 [P] [US1] Add i18n keys for the Tunnel section (`tunnel.section_title`, `tunnel.add_button`, `tunnel.edit_button`, `tunnel.remove_button`, `tunnel.use_button`, `tunnel.dialog_title_add`, `tunnel.dialog_title_edit`, `tunnel.name_label`, `tunnel.command_label`, `tunnel.save_button`, `tunnel.name_required`, `tunnel.command_required`, `tunnel.empty_state`) to `src/renderer/i18n/locales/en/common.json`

**Checkpoint**: User Story 1 fully functional — new tunnel configs can be created and appear in the dropdown

---

## Phase 4: User Story 2 — Edit an Existing Tunnel Configuration (Priority: P2)

**Goal**: User can select an existing entry, click Edit, change values, save, and see the updated entry in the dropdown.

**Independent Test**: Select an existing entry → click "Edit" → verify dialog pre-filled → change fields → click Save → verify dropdown reflects updated values.

- [ ] T014 [US2] Wire the "Edit" button (enabled only when an entry is selected) to open the dialog in edit-mode pre-filled with the selected entry's name and command in `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T015 [US2] On Save in edit-mode call `window.api.tunnelConfig.update({ id, name, command })` and refresh the dropdown in `src/renderer/pages/ConnectionConfig.tsx`

**Checkpoint**: User Story 2 fully functional — existing tunnel configs can be edited

---

## Phase 5: User Story 3 — Remove a Tunnel Configuration (Priority: P2)

**Goal**: User can select an entry, click Remove, confirm, and the entry is deleted; if the list becomes empty, a placeholder state is shown without errors.

**Independent Test**: Select an entry → click "Remove" → verify confirmation dialog appears → confirm → verify entry is gone; repeat until empty → verify placeholder state, no errors.

- [ ] T016 [US3] Wire the "Remove" button (enabled only when an entry is selected) to open a confirmation dialog in `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T017 [US3] On confirmation call `window.api.tunnelConfig.remove(id)`, refresh the dropdown, and show placeholder state when the list is empty in `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T018 [P] [US3] Add i18n keys for the Remove confirmation dialog (`tunnel.remove_confirm_title`, `tunnel.remove_confirm_text`, `tunnel.remove_confirm_yes`, `tunnel.remove_confirm_no`) to `src/renderer/i18n/locales/en/common.json`
- [ ] T021 [US3] Ensure that when the active tunnel config is removed (US3 flow), the active state is cleared in the service layer (`removeTunnelConfig` in `src/main/services/tunnel.service.ts` calls `setActiveTunnelConfig(null)` when the removed entry was active)

**Checkpoint**: User Story 3 fully functional — tunnel configs can be removed; empty state handled cleanly

---

## Phase 6: User Story 4 — Use a Tunnel Configuration (Priority: P1)

**Goal**: User can mark a selected entry as active; on page load the dropdown pre-selects the active configuration; if none exists the dropdown is empty without errors.

**Independent Test**: Select an entry → click "Use" → reload the page → verify the same entry is pre-selected in the dropdown. Remove the active entry → reload → verify dropdown is empty without errors.

- [ ] T019 [US4] Wire the "Use" button (enabled only when an entry is selected) to call `window.api.tunnelConfig.setActive(id)` and update the active selection state in `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T020 [US4] On page load, after fetching all tunnel configs, pre-select the entry where `is_active = 1` in the dropdown (or leave empty if none) in `src/renderer/pages/ConnectionConfig.tsx`

**Checkpoint**: User Story 4 fully functional — active tunnel persists across page loads; cleared correctly on removal

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Button enable/disable states, error handling, snackbar feedback, and unit tests

- [ ] T022 Ensure "Edit", "Remove", and "Use" buttons are disabled (not just hidden) when no dropdown entry is selected across all states in `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T023 Add snackbar error feedback for IPC failures (add/update/remove/setActive) using the existing `showSnackbar` pattern in `src/renderer/pages/ConnectionConfig.tsx`
- [ ] T024 [P] Write unit tests for all tunnel service functions (`getTunnelConfigs`, `addTunnelConfig`, `updateTunnelConfig`, `removeTunnelConfig`, `setActiveTunnel`, `getActiveTunnel`) in `tests/unit/tunnel.service.test.ts`
- [ ] T025 [P] Write E2E test covering the full tunnel config lifecycle (add → edit → use → remove → empty state) in `tests/e2e/tunnel-config.spec.ts`
- [ ] T026 update the CHANGELONG.md file with the new feature

---

## Dependencies

```
T001 → T002, T003 (migration JS references SQL files)
T001–T004 → T005 (repository needs table + types)
T005 → T006 (service wraps repository)
T006 → T007 (IPC handlers call service)
T007 → T008 (preload exposes IPC)
T008 → T009 (types for preload)
T008, T009 → T010–T021 (UI calls preload API)
T010 → T011 → T012 (dialog built before wiring Add)
T012 → T014, T015 (Edit reuses dialog from Add)
T012 → T016, T017 (Remove needs dropdown state)
T017 → T021 (active-state clearing on remove)
T010, T012, T014, T017, T019, T020 → T022, T023 (polish after all buttons wired)
T006 → T024 (unit tests need service)
T022, T023 → T025 (E2E after full UI complete) -> T026 (changelog)
```

## Parallel Execution Examples

**Phase 1–2** (sequential, foundational):
- T001–T003 sequential (migration files), T004 parallel with T001–T003

**Phase 3 onwards** (after T009 complete):
- T010–T012 sequential within US1; T013 parallel with T010–T012
- T014–T015 (US2) can start after T012
- T016–T017 (US3) can start after T012; T018 parallel with T016–T017
- T019–T021 (US4) can start after T017 (needs remove flow for T021)
- T024, T025 parallel with each other after their prerequisites

## Implementation Strategy

**MVP Scope** (deliver US1 + US4 first — both P1):
1. Complete Phase 1 + Phase 2 (T001–T009)
2. Complete Phase 3 US1 (T010–T013)
3. Complete Phase 6 US4 (T019–T021)
4. Then add US2 (Phase 4) and US3 (Phase 5)
5. Polish last (Phase 7)

**Incremental delivery**: Each phase produces a testable increment. US1 alone (add + list) is a usable MVP.
