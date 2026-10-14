# Fingerprint canonicalization

SHA-256 hex (64 lowercase hex chars) over:

```
METHOD\n
PATH\n
BODY_BYTES
```

- `METHOD`: upper-case HTTP method (`POST`)
- `PATH`: request path without query string (`/api/orders/1/charges`)
- `BODY_BYTES`: raw UTF-8 body bytes (empty if none)

Java helper: `com.example.idemgate.client.Fingerprints.sha256Hex(method, path, bodyBytes)`.

The Spring starter fingerprints `METHOD + PATH + JSON(args)` for `@Idempotent` methods (servlet args excluded). Keep the same payload shape on retries.
