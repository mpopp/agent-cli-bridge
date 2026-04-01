[2026-04-01 06:58] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "choice with fallback",
    "EXPECTATION": "Use Option A as primary while keeping Option B as a documented fallback.",
    "NEW INSTRUCTION": "WHEN user picks option and mentions fallback THEN implement primary and document fallback contingency"
}

[2026-04-01 14:11] - Updated by Junie
{
    "TYPE": "correction",
    "CATEGORY": "migration usage",
    "EXPECTATION": "Use the existing migrations in src/main/database/migrations/*.js for schema setup instead of inline db.exec in setup.ts.",
    "NEW INSTRUCTION": "WHEN initializing or updating the database schema THEN run migrations from src/main/database/migrations and remove inline SQL from setup.ts"
}

[2026-04-01 14:16] - Updated by Junie
{
    "TYPE": "preference",
    "CATEGORY": "testing strategy",
    "EXPECTATION": "Unit tests should not use a database or run migrations; only minimal setup per test type.",
    "NEW INSTRUCTION": "WHEN configuring test environments by type THEN skip DB for unit; run migrations for integration and e2e"
}

