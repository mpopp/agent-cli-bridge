CREATE TABLE exec_config (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    timeout_seconds INTEGER NOT NULL DEFAULT 30,
    max_output_mb INTEGER NOT NULL DEFAULT 10,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO exec_config (id, timeout_seconds, max_output_mb) VALUES (1, 30, 10);
