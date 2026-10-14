ALTER TABLE operations
    ADD COLUMN owner_token VARCHAR(64),
    ADD COLUMN lease_expires_at TIMESTAMPTZ,
    ADD COLUMN business_key VARCHAR(256);

UPDATE operations
SET owner_token = replace(id::text, '-', ''),
    lease_expires_at = expires_at
WHERE status = 'IN_PROGRESS' AND owner_token IS NULL;

CREATE UNIQUE INDEX uq_operations_scope_business_key
    ON operations (scope, business_key)
    WHERE business_key IS NOT NULL;
