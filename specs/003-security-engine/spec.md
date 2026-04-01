# Feature Specification: Security Engine

**Feature Branch**: `003-security-engine`  
**Created**: 2026-04-01  
**Status**: Draft  
**Input**: User description: "Implement a Security Engine in the Electron main process..."

## Clarifications

### Session 2026-04-01

- Q: Edge Cases & Failure Handling - Regex Evaluation Runaway → A: Reject inputs longer than a maximum length (e.g., 10,000 characters) immediately before validation, but rely on the general execution timeout (e.g., 30s) as a fallback to kill runaway regex evaluations.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Hardcoded Blocklist Validation (Priority: P1)

As a user executing commands via the application, I want destructive commands to be blocked automatically by a hardcoded blocklist, so that my system is protected from irreversible damage.

**Why this priority**: System safety is the paramount requirement of the application (Constitution Core Principle I).

**Independent Test**: Can be tested independently by supplying malicious command strings (e.g., `rm -rf /`) to the Security Engine and verifying the engine returns a blocked verdict with the correct reason.

**Acceptance Scenarios**:

1. **Given** a destructive command like `rm -rf /` or `mkfs.ext4 /dev/sda1`, **When** the command is passed to the Security Engine, **Then** the engine returns a blocked verdict detailing the reason and matched rule.
2. **Given** a chained destructive command like `ls && rm -rf /`, **When** validated, **Then** the engine splits the segments, detects the destructive segment, and blocks the execution.
3. **Given** a safe command like `echo "hello world"`, **When** validated, **Then** the engine returns a pass verdict.
4. **Given** a safe command with a restricted path like `rm myfile.txt`, **When** validated, **Then** the engine passes it (since only critical path destructions are blocked).

---

### User Story 2 - Subshell and Privilege Escalation Detection (Priority: P1)

As a user, I want the Security Engine to detect destructive commands hidden within subshells or prefixed with privilege escalation (`sudo`/`su`), so that malicious bypass attempts fail.

**Why this priority**: Attackers commonly use obfuscation and privilege escalation to bypass naive blocklists.

**Independent Test**: Provide heavily obfuscated strings, subshells, and `sudo`-prefixed commands and verify they are correctly inspected and blocked.

**Acceptance Scenarios**:

1. **Given** a destructive command with `sudo` (e.g., `sudo rm -rf /`), **When** validated, **Then** the engine detects the combination and blocks it.
2. **Given** a safe command with `sudo` (e.g., `sudo apt update`), **When** validated, **Then** the engine passes it.
3. **Given** a command embedded in a subshell (e.g., `bash -c "rm -rf /"` or `eval $(rm -rf /)`), **When** validated, **Then** the engine extracts the inner payload and blocks the destructive command.

---

### User Story 3 - Input Normalization (Priority: P2)

As a user, I want the Security Engine to normalize inputs before validation, so that whitespace tricks, quote injection, and Unicode homoglyphs cannot bypass the blocklist.

**Why this priority**: Critical to making the regex-based blocklist robust against common evasion techniques.

**Independent Test**: Provide malicious commands padded with zero-width spaces, excessive whitespace, and irregular quotes.

**Acceptance Scenarios**:

1. **Given** a destructive command padded with zero-width spaces or homoglyphs, **When** validated, **Then** the engine normalizes the string, strips the homoglyphs, and blocks it.
2. **Given** a destructive command wrapped in complex nested quotes, **When** validated, **Then** the engine resolves the quotes and blocks the command.

---

### Edge Cases

- When a syntax error exists but the string still matches a blocklist pattern, the engine should block it.
- When an input attempts extreme nesting depths of subshells, the engine should correctly extract and inspect the contents without failure.
- A command like `sudo rm -rf /` is blocked, but `sudo rm -rf ~/tmp` passes (assuming `~/tmp` is not a protected path in the blocklist).
- To prevent Regular Expression Denial of Service (ReDoS) and buffer overflows, inputs longer than a maximum length (e.g., 10,000 characters) must be rejected immediately before validation. The general execution timeout (e.g., 30s) will act as a fallback.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: System MUST implement a Chain of Responsibility architecture for security validation, where checks (like `SecurityCheck`) return `pass` or `block` verdicts and stop on the first block.
- **FR-002**: System MUST implement exactly ONE check in this feature: `BlocklistCheck`, containing a compile-time hardcoded, immutable blocklist of destructive commands (frozen object).
- **FR-003**: System MUST split multi-command input strings (e.g., `;`, `&&`, `||`, `|`, `` `...` ``, `$(...)`, heredocs) into individual segments and validate each segment independently.
- **FR-004**: System MUST extract and validate commands embedded within subshell executions (`bash -c`, `sh -c`, `eval`).
- **FR-005**: System MUST evaluate commands prefixed with `sudo` or `su`; it must block them if the subsequent command matches a blocklist entry (e.g., `sudo rm -rf /`), but pass them if safe (e.g., `sudo apt update`).
- **FR-006**: System MUST perform input normalization prior to validation: collapse whitespace to a single space, strip quote escaping, detect/reject Unicode homoglyphs and zero-width spaces, trim leading/trailing whitespace, and strip inline shell comments.
- **FR-007**: System MUST provide a `SecurityVerdict` object detailing `allowed` (boolean), `reason` (string), `matchedRule` (string), and `checkName` (string).
- **FR-008**: System MUST block 10 specific categories of destruction: Filesystem destruction, Fork bombs, System shutdown/reboot, Kernel manipulation, Bootloader modification, Firewall deactivation, Network disruption, Disk/partition manipulation, Permission escalation on critical paths, and Dangerous command + critical path combinations.

### Key Entities

- **CommandContext**: Object passed through the chain. Contains `rawInput` (original string), `normalizedInput` (after normalization), and `segments` (array of split commands).
- **SecurityVerdict**: Object representing the outcome of validation. Contains `allowed` (boolean), `reason` (optional string), `matchedRule` (optional string), and `checkName` (optional string).
- **SecurityCheck**: Interface for individual checks with a `readonly name` and a `validate(context: CommandContext): SecurityVerdict` method.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The `BlocklistCheck` successfully blocks 100% of the destructive commands defined in the 10 blocklist categories across all provided test cases.
- **SC-002**: The validation chain correctly processes and passes 100% of safe, permitted commands without false positives during standard execution tests.
- **SC-003**: The normalization logic successfully defeats 100% of the tested basic evasion techniques (whitespace, quotes, Unicode zero-width spaces) in unit tests.
- **SC-004**: The Security Engine is built as a pure TypeScript module without dependencies on Electron, the database, or IPC.

## Assumptions

- Only the `BlocklistCheck` is implemented right now; path whitelist validation and script content inspection will be added in a separate `PathCheck` chain link later.
- Logging of blocked attempts is out of scope for this feature (belongs to the Audit Log feature).
- Subshell detection can be performed using regex/string parsing reliably enough for the hardcoded blocklist, rather than requiring a full AST shell parser.