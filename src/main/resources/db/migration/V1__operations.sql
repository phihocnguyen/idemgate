CREATE TABLE operations (
    id              UUID PRIMARY KEY,
    scope           VARCHAR(128)  NOT NULL,
    idempotency_key VARCHAR(256)  NOT NULL,
    fingerprint     CHAR(64)      NOT NULL,
    status          VARCHAR(32)   NOT NULL,
    request_method  VARCHAR(16),
    request_path    VARCHAR(512),
    response_status INTEGER,
    response_headers JSONB,
    response_body   TEXT,
    expires_at      TIMESTAMPTZ   NOT NULL,
    retain_until    TIMESTAMPTZ   NOT NULL,
    created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    completed_at    TIMESTAMPTZ,
    CONSTRAINT uq_operations_scope_key UNIQUE (scope, idempotency_key),
    CONSTRAINT chk_operations_status CHECK (
        status IN ('IN_PROGRESS', 'COMPLETED', 'FAILED', 'UNKNOWN')
    )
);

CREATE INDEX idx_operations_retain_until ON operations (retain_until);
CREATE INDEX idx_operations_status_expires ON operations (status, expires_at);
