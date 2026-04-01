# Research: Security Engine

## Decision: Subshell and Chain Parsing
**Decision**: Use custom string splitting and simple regex parsing rather than a full AST parser for command segments.
**Rationale**: A hardcoded blocklist acts as a coarse filter; simple subshell detection (`bash -c`, `$(...)`, `` `...` ``) combined with strict normalization is sufficient without the massive overhead and fragility of full bash AST parsers in JS.
**Alternatives considered**: Importing `bash-parser` or `mvdan-sh` — rejected due to dependency size, risk of parser mismatch with the underlying shell, and conflict with "pure TypeScript, no external parser" constraint.

## Decision: Regular Expression Library
**Decision**: Use Node.js built-in `RegExp`.
**Rationale**: Zero dependencies, extremely fast, sufficient for the defined patterns. Runaway evaluations are handled by the character length limit (10,000 max) and general execution timeout (30s) as specified in edge cases.
**Alternatives considered**: RE2 or PCRE libraries — rejected due to dependency bloat and lack of necessity.

## Decision: Normalization Strategy
**Decision**: Use validator (https://www.npmjs.com/package/validator) to strip Unicode homoglyphs, collapse zero-width spaces and sanitize the input in general.
**Rationale**: Using a validator library is a good choice for this purpose, as it provides a comprehensive set of string sanitization functions that can handle various edge cases and security concerns.
**Alternatives considered**: Doing a native implementation — rejected due to the complexity and potential for missing edge cases, and the risk of introducing vulnerabilities.
