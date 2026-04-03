# Feature Specification: Tunnel Configuration

**Feature Branch**: `009-tunnel-config`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: User description: "The Connection Configuration page shall have a new section called \"Tunnel\" below the existing API Key section. This section contains a dropdown that lists all saved tunnel configurations by name. Below or next to the dropdown there are the following buttons: an \"Add\" button that is always visible, an \"Edit\" button and a \"Remove\" button that are only visible when an entry is selected in the dropdown, and a \"Use\" button that is also only visible or enabled when an entry is selected. When the user clicks Add, a dialog opens with two text fields (Name and Command) and a Save button; filling in both fields and clicking Save creates a new tunnel configuration entry and the dropdown refreshes to include it. When the user clicks Edit with an entry selected, the same dialog opens pre-filled with the selected entry's name and command; clicking Save in this case updates the existing entry instead of creating a new one. When the user clicks Remove with an entry selected, a confirmation dialog appears asking the user if they really want to delete the entry; if the user confirms, the entry is deleted and the dropdown refreshes, and if the dropdown is now empty it simply shows an empty or placeholder state without any error. When the user clicks Use with an entry selected, the selected configuration is marked as the currently active tunnel configuration in the system. When the user navigates to the Connection Configuration page, the dropdown is pre-selected with the currently active tunnel configuration so the user always sees which tunnel command is currently in use; if no active configuration exists or no configurations have been saved yet, the dropdown is simply empty with no error."

## Clarifications

### Session 2026-04-03
- Q: How does the system handle duplicate tunnel configuration names? → A: duplicate tunnel names are allowed. Name does not serve as an identifier
- Q: What happens if the currently active tunnel configuration is removed? → A: The active state is cleared (no active tunnel).
- Q: What happens when the user tries to save an empty Name or Command in the Add/Edit dialog? → A: The dialog is not closed and the error is displayed.
- Q: How does the system handle clicking outside the Add/Edit/Remove dialogs (do they close or require explicit action)? → A: The dialogs close when clicked outside. No data is persisted.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Add a New Tunnel Configuration (Priority: P1)

As a user configuring a connection, I want to add a new tunnel configuration so that I can define the tunnel command needed for my environment.

**Why this priority**: Essential for creating any tunnel configuration in the first place.

**Independent Test**: Can be fully tested by opening the Add dialog, filling out Name and Command, and verifying the new entry appears in the dropdown.

**Acceptance Scenarios**:

1. **Given** the Connection Configuration page, **When** the user clicks "Add", **Then** a dialog opens with Name and Command text fields and a Save button.
2. **Given** the Add dialog is open, **When** the user fills in both fields and clicks "Save", **Then** a new tunnel configuration is created, the dialog closes, and the dropdown refreshes to include the new entry.

---

### User Story 2 - Edit an Existing Tunnel Configuration (Priority: P2)

As a user, I want to edit an existing tunnel configuration so that I can correct or update the command without creating a new entry.

**Why this priority**: High priority to allow users to fix mistakes or update outdated commands.

**Independent Test**: Can be tested by selecting an existing entry, clicking Edit, changing values, and verifying the changes are saved.

**Acceptance Scenarios**:

1. **Given** a tunnel configuration is selected in the dropdown, **When** the user clicks "Edit", **Then** the dialog opens pre-filled with the selected entry's Name and Command.
2. **Given** the Edit dialog is open for an existing entry, **When** the user changes the fields and clicks "Save", **Then** the existing entry is updated, the dialog closes, and the dropdown reflects the updated information.

---

### User Story 3 - Remove a Tunnel Configuration (Priority: P2)

As a user, I want to delete a tunnel configuration I no longer need so that my list remains organized.

**Why this priority**: Necessary for housekeeping and removing incorrect or obsolete entries.

**Independent Test**: Can be tested by selecting an entry, clicking Remove, confirming, and verifying the entry is gone from the dropdown.

**Acceptance Scenarios**:

1. **Given** a tunnel configuration is selected in the dropdown, **When** the user clicks "Remove", **Then** a confirmation dialog appears asking to verify deletion.
2. **Given** the Remove confirmation dialog is visible, **When** the user confirms, **Then** the entry is deleted, the dropdown refreshes, and if empty, displays a placeholder state without errors.

---

### User Story 4 - Use a Tunnel Configuration (Priority: P1)

As a user, I want to mark a specific tunnel configuration as active so that the system uses it for connections.

**Why this priority**: Critical functionality; defining tunnels is useless if one cannot be activated.

**Independent Test**: Can be tested by selecting an entry, clicking "Use", and verifying it becomes the active configuration upon page reload.

**Acceptance Scenarios**:

1. **Given** a tunnel configuration is selected in the dropdown, **When** the user clicks "Use", **Then** the configuration is marked as the currently active tunnel configuration in the system.
2. **Given** an active tunnel configuration exists, **When** the user navigates to the Connection Configuration page, **Then** the dropdown is pre-selected with the active tunnel configuration.
3. **Given** no active configuration exists or no configurations are saved, **When** the user navigates to the Connection Configuration page, **Then** the dropdown is empty without any error.

### Edge Cases

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST display a "Tunnel" section below the API Key section on the Connection Configuration page.
- **FR-002**: System MUST display a dropdown listing all saved tunnel configurations by name in the Tunnel section.
- **FR-003**: System MUST display an "Add" button that is always visible or enabled.
- **FR-004**: System MUST display "Edit", "Remove", and "Use" buttons that are only visible or enabled when a dropdown entry is selected.
- **FR-005**: System MUST present a dialog with "Name" and "Command" text fields and a "Save" button when "Add" or "Edit" is clicked.
- **FR-006**: System MUST create a new entry and refresh the dropdown when a new configuration is saved via the "Add" dialog.
- **FR-007**: System MUST pre-fill the dialog fields and update the existing entry when saved via the "Edit" dialog.
- **FR-008**: System MUST present a confirmation dialog when "Remove" is clicked and delete the entry upon confirmation, refreshing the dropdown.
- **FR-009**: System MUST show an empty or placeholder state without error if the dropdown becomes empty after deletion or initially has no items.
- **FR-010**: System MUST mark a selected entry as the currently active tunnel configuration when "Use" is clicked.
- **FR-011**: System MUST pre-select the currently active tunnel configuration in the dropdown when the Connection Configuration page is loaded.
- **FR-012**: System MUST clear the active tunnel state (fallback to none) if the currently active tunnel configuration is removed.

### Key Entities _(include if feature involves data)_

- **Tunnel Configuration**: Represents a saved tunnel command.
  - Attributes: Name (string, label, not unique), Command (string, the executable command), Internal ID (system-generated unique identifier).
- **Active Tunnel State**: A reference to the currently selected/active Tunnel Configuration.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: IPC round-trip for add operation completes in 100ms or less.
- **SC-002**: Users can clearly identify the currently active tunnel configuration immediately upon loading the Connection Configuration page.
- **SC-003**: The UI correctly enables/disables the Edit, Remove, and Use buttons instantaneously based on dropdown selection state.
- **SC-004**: Deleting the last tunnel configuration results in a clean empty state without throwing UI or system errors 100% of the time.

## Assumptions

- Users have basic familiarity with the required tunnel commands for their environments.
- Tunnel configurations are stored locally or per-user, not globally shared across all users (unless the entire system is single-tenant).
- Input validation (e.g., preventing completely empty commands or names) is standard and expected, even if not explicitly detailed in the prompt.
- The UI framework supports dynamic enabling/disabling of buttons and modal dialogs.
