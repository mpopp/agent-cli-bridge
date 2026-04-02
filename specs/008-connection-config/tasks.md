# Implementation Tasks: Connection Configuration

**Feature**: Connection Configuration
**Specification**: /specs/008-connection-config/spec.md
**Data Model**: /specs/008-connection-config/data-model.md
**Contracts**: /specs/008-connection-config/contracts/ipc.md

## Dependencies
- US1 (View) depends on Foundational IPC and types.
- US2 (Modify Network) depends on US1 for the base UI.
- US3 (Regenerate API Key) depends on US1 for the base UI.

## Phase 1: Setup
**Goal**: Project initialization, types, and utility setup

- [x] T001 Define `ServerConfig`, `NetworkConfig`, `ServerStatus` types in `src/types/ipc.ts`
- [x] T002 Implement port availability check utility using `net` module in `src/main/utils/network.ts`

## Phase 2: Foundational
**Goal**: Core backend configuration functions

- [x] T003 Implement `getConfig`, `saveNetworkConfig`, and `regenerateApiKey` queries in `src/main/services/config.service.ts`
- [x] T004 Refactor Express server management for graceful restart in `src/main/api/server.ts`
- [x] T005 Expose IPC main handlers for `connection-config` in `src/main/api/ipc.ts`
- [x] T006 Expose methods via preload script in `src/preload/index.ts`

## Phase 3: View Connection Settings (User Story 1)
**Goal**: Users can view the current server connection settings and masked API key.
**Independent Test**: Navigate to the page, observe current settings and masked API key that auto-hides.

- [x] T007 [US1] Create localization strings for Connection page in `src/renderer/i18n/locales/en/common.json`
- [x] T008 [P] [US1] Create `MaskedApiKey` UI component with Show/Hide and 30s timeout in `src/renderer/components/MaskedApiKey.tsx`
- [x] T009 [US1] Create `ConnectionConfig` page component integrating config details in `src/renderer/pages/ConnectionConfig.tsx`
- [x] T010 [US1] Update `Sidebar` component with "Connection" link in `src/renderer/components/Sidebar.tsx`
- [x] T011 [US1] Configure TanStack Router with route for `/connection` in `src/renderer/main.tsx`

## Phase 4: Modify Network Settings (User Story 2)
**Goal**: Users can change the server's bind address and port with validation and trigger restart.
**Independent Test**: Change port/address, see warnings, save, confirm restart dialog, verify server restarts.

- [x] T012 [US2] Add address dropdown with 0.0.0.0 warning in `ConnectionConfig` page in `src/renderer/pages/ConnectionConfig.tsx`
- [x] T013 [US2] Add port numeric input with 1024-65535 validation in `ConnectionConfig` page in `src/renderer/pages/ConnectionConfig.tsx`
- [x] T014 [US2] Add save button, API validation, and restart confirmation dialog in `src/renderer/pages/ConnectionConfig.tsx`

## Phase 5: Regenerate API Key (User Story 3)
**Goal**: Users can regenerate the API key which applies immediately.
**Independent Test**: Click Regenerate, confirm, verify new key appears instantly.

- [x] T015 [US3] Add "Regenerate" button and confirmation dialog to `ConnectionConfig` page in `src/renderer/pages/ConnectionConfig.tsx`
- [x] T016 [US3] Add "Copy" button with snackbar notification to `MaskedApiKey` component in `src/renderer/components/MaskedApiKey.tsx`

## Phase 6: Polish
**Goal**: Final styling, error handling, and security verification.

- [x] T017 Ensure server status indicator reflects actual server state in `src/renderer/pages/ConnectionConfig.tsx`
- [x] T018 Verify Express middleware dynamically uses the newly generated API key without restart in `src/main/api/server.ts`
- [x] T019 Ensure that all tests are green!

## Implementation Strategy
- **MVP**: Phase 1, Phase 2, and Phase 3 to establish the foundation and view the configuration.
- **Parallel Execution**: The `MaskedApiKey` UI component can be built independently of the backend services.