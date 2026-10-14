CREATE TABLE operations (
    id              TEXT PRIMARY KEY,
    scope           TEXT NOT NULL,
    idempotency_key TEXT NOT NULL,
    fingerprint     TEXT NOT NULL,
    status          TEXT NOT NULL,
    request_method  TEXT,
    request_path    TEXT,
    response_status INTEGER,
    response_headers TEXT,
    response_body   TEXT,
    owner_token     TEXT,
    lease_expires_at TEXT,
    business_key    TEXT,
    expires_at      TEXT NOT NULL,
    retain_until    TEXT NOT NULL,
    created_at      TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at      TEXT NOT NULL DEFAULT (datetime('now')),
    completed_at    TEXT,
    CONSTRAINT uq_operations_scope_key UNIQUE (scope, idempotency_key),
    CONSTRAINT chk_operations_status CHECK (
        status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'UNKNOWN')
    )
);

CREATE INDEX idx_operations_retain_until ON operations (retain_until);
CREATE INDEX idx_operations_status_expires ON operations (status, expires_at);

CREATE UNIQUE INDEX uq_operations_scope_business_key
    ON operations (scope, business_key)
    WHERE business_key IS NOT NULL;
