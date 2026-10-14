Self-service Idempotency Platform
AI Agent Development Instructions — End-to-End Implementation
1. Project Mission

Build a production-oriented, self-service Idempotency Platform that allows developers to add idempotency to existing HTTP APIs without modifying their business services.

A developer should be able to:

Register an existing HTTP API through a web UI.
Configure the upstream URL, HTTP method, authentication, and idempotency policy.
Let the platform automatically provision the required metadata and storage namespace.
Receive a gateway URL.
Replace the original API URL in their client and send an Idempotency-Key header.
Automatically receive duplicate-request protection and replay previously stored successful responses.

The platform must support clients written in Java, JavaScript/TypeScript, Go, Python, and any other language capable of making HTTP requests.

The primary product principle is:

Make integration simple for developers while keeping consistency, security, and infrastructure management inside the platform.

This is not merely a reverse proxy. It is a self-service platform consisting of a Control Plane, Data Plane, managed state storage, provisioning workflows, and a developer portal.

2. Instructions to the AI Agent

You are the primary software engineer responsible for delivering this project end-to-end.

Do not stop after generating boilerplate, interfaces, mock implementations, or architecture documentation.

You must implement working features, run the available tests, verify integration behavior, fix discovered defects, and document any remaining limitations.

Required working process
Inspect the existing repository before making changes.
Identify existing code, conventions, build tools, configuration, and tests.
Create or update an implementation plan.
Implement the project incrementally in working, testable stages.
Run formatting, compilation, unit tests, integration tests, and relevant end-to-end tests.
Start the application and verify actual HTTP behavior whenever the environment permits.
Fix failures before declaring a stage complete.
Update this README and other documentation whenever implementation decisions change.
Never claim that a feature works unless it has been implemented and verified.
Never replace real functionality with TODO comments, hardcoded mock responses, or fake success results merely to make tests pass.
Engineering rules
Prefer simple, maintainable designs over premature abstraction.
Use explicit interfaces for storage and upstream HTTP execution.
Keep business logic separate from infrastructure integrations.
Use database migrations instead of relying on automatic schema generation in production.
Keep secrets out of source control and logs.
Use backward-compatible configuration changes where practical.
Avoid introducing dependencies without a clear purpose.
Pin dependency and container versions appropriately.
Use structured logging and meaningful error responses.
Ensure all external I/O has explicit timeout and resource limits.
Do not silently bypass idempotency when the state store is unavailable.
Do not claim exactly-once execution across independent systems without a concrete mechanism that provides it.
Do not disable or weaken tests to obtain a passing build.

If a design decision is unclear, choose a safe, documented default and continue implementation unless the decision requires user input or access to unavailable infrastructure.

3. Product Scope
3.1 MVP features

The MVP must include:

Developer authentication and tenant isolation.
API registration and management.
Upstream URL and HTTP method configuration.
Configurable upstream authentication.
Automatic idempotency storage namespace provisioning.
Managed idempotency policy with safe defaults.
Gateway URL generation.
HTTP reverse proxying.
Idempotency-Key validation.
Request fingerprinting.
Atomic key claiming.
Duplicate request detection.
Concurrent request coordination.
Successful response persistence and replay.
Detection of the same key used with a different request.
Explicit handling of uncertain upstream outcomes.
TTL and retention management.
Gateway health checks and metrics.
Developer portal with API creation, configuration, status, and usage examples.
Docker Compose for local development.
Unit, integration, and end-to-end tests.
API documentation and operational runbooks.
3.2 Initial limitations

The first release may limit supported upstream requests to ordinary HTTP APIs, including JSON request and response bodies.

Unless explicitly implemented and tested, do not claim support for:

WebSockets.
Arbitrary streaming responses.
Server-sent events.
Unlimited request or response bodies.
Automatic idempotency for every upstream protocol.
Transparent exactly-once side effects.
Active-active multi-region operation.
Arbitrary user-supplied proxy destinations.
Automatic database provisioning for the customer's business application.

The platform provisions storage for idempotency state. It does not automatically create or manage the upstream application's business database.

4. Technology Stack

Use the following stack unless the existing repository has a compelling, documented alternative.

Backend
Java 21 or another explicitly selected supported LTS version.
Spring Boot 3.x, pinned to a compatible maintained release.
Spring Web MVC for Control Plane APIs.
Spring WebClient or another appropriate HTTP client for upstream proxying.
Spring Security for authentication and authorization.
Spring Data JDBC or another explicitly chosen persistence approach for metadata.
PostgreSQL for platform metadata.
Redis for fast idempotency state and atomic coordination.
Flyway for PostgreSQL schema migrations.
Maven for dependency and build management.
Bean Validation for request validation.
Micrometer for metrics.
OpenAPI for HTTP API documentation.

Choose compatible dependency versions and commit the dependency lock/build configuration supported by the selected tooling.

Frontend

Use a maintained TypeScript-based web framework, preferably React with a suitable application framework.

The frontend must provide:

Login.
API listing.
API registration.
Configuration forms.
Provisioning status.
Gateway endpoint display.
Request examples.
Basic request and idempotency metrics.
Clear validation and error messages.

Use a consistent component system and typed API client. Do not implement fake backend behavior to simulate working screens.

Infrastructure
Docker.
Docker Compose for local development.
PostgreSQL.
Redis.
A reverse proxy or load balancer configuration suitable for local integration testing.
CI pipeline for build, tests, and code quality checks.

Production deployment may use Kubernetes or an equivalent container orchestration platform.

Storage abstraction

Create an application-level storage interface so the idempotency engine is not coupled directly to Redis.

Do not introduce multiple production storage implementations unless they are actually needed. The abstraction must support the consistency and atomicity requirements of the state machine.

5. Architecture

Use a Control Plane / Data Plane architecture.

5.1 Control Plane

Responsibilities:

Manage tenants and users.
Register upstream APIs.
Manage API configuration and policy versions.
Validate upstream configuration.
Provision logical storage namespaces.
Generate gateway route identifiers.
Publish configuration to the Data Plane.
Manage API activation, deactivation, and deletion.
Expose API management endpoints.
Maintain an auditable history of important configuration changes.

The Control Plane must not be required for every incoming business request.

If the portal or Control Plane becomes temporarily unavailable, already activated routes should continue operating using the last valid configuration, subject to the availability of required runtime dependencies.

5.2 Data Plane

Responsibilities:

Authenticate the client.
Resolve the registered route.
Enforce request and route policies.
Extract and validate the idempotency key.
Calculate the request fingerprint.
Atomically claim or inspect the key.
Determine whether the request is new, in progress, completed, conflicting, or uncertain.
Forward eligible requests to the configured upstream.
Persist the result according to the defined completion protocol.
Return the upstream response or replay a stored response.
Emit logs, metrics, and tracing information.

The Data Plane must never accept arbitrary upstream URLs directly from untrusted clients.

5.3 Storage

PostgreSQL stores durable platform metadata:

Tenants.
Users and access relationships.
API registrations.
Route configuration.
Policy versions.
Provisioning operations.
Audit events.
Storage allocation metadata.

Redis initially stores runtime idempotency state:

Scoped key.
Request fingerprint.
Processing state.
Ownership token.
Lease or expiration metadata.
Completion metadata.
Replay response data when supported by the selected storage design.

Do not assume Redis replication alone provides strict durability. Document its failover behavior and test the consequences of losing recently acknowledged writes.

For deployments requiring strong durability guarantees, design a durable state-store option and explicitly define which store is authoritative.

6. Repository Structure

Create a modular repository similar to the following.

idempotency-platform/
├── README.md
├── pom.xml
├── compose.yaml
├── .env.example
├── .gitignore
├── backend/
│   ├── pom.xml
│   ├── platform-common/
│   ├── control-plane/
│   ├── provisioning/
│   ├── gateway/
│   ├── idempotency-core/
│   ├── idempotency-store-redis/
│   ├── upstream-client/
│   └── observability/
├── frontend/
│   ├── package.json
│   └── src/
├── database/
│   └── migrations/
├── deploy/
│   ├── docker/
│   └── kubernetes/
├── docs/
│   ├── architecture.md
│   ├── api-contract.md
│   ├── consistency-model.md
│   ├── security.md
│   ├── development.md
│   └── operations.md
└── tests/
    └── e2e/


Adapt this structure to the existing repository instead of restructuring working code unnecessarily.

Avoid creating excessive modules before their boundaries are justified.

7. Core Domain Model

Define explicit domain objects and persistence models.

Tenant

Fields:

id
name
status
createdAt
updatedAt
API Registration

Fields:

id
tenantId
name
routeId
upstreamUrl
httpMethod
authenticationReference
policyVersion
status
createdAt
updatedAt

Do not store raw upstream credentials in the API registration record.

Idempotency Policy

Fields:

keySource
keyHeaderName
retentionSeconds
fingerprintStrategy
onInProgress
replaySuccessfulResponses
maximumRequestBodyBytes
maximumResponseBodyBytes
upstreamTimeout
policyVersion

Apply server-side limits to all client-configurable values.

Idempotency Record

Conceptual fields:

tenantId
apiId
keyDigest
requestFingerprint
state
ownerToken
fencingToken, when supported by the coordination design
createdAt
updatedAt
leaseExpiresAt
completedAt
responseStatus
responseHeaders
responseBodyReference
expiresAt
upstreamReference

Avoid persisting sensitive request or response data unless explicitly required and protected.

Use a scoped, securely derived key digest where appropriate. Never rely on the client-provided key alone as a globally unique identifier.

8. Idempotency Semantics

These semantics must be documented and implemented consistently.

8.1 Key scope

The logical idempotency identity is:

tenantId + apiId + idempotencyKey


Use a consistent canonicalization and secure digest strategy for the storage key.

Do not allow different tenants to interfere with each other's idempotency records.

8.2 Request fingerprint

Calculate a stable fingerprint of the request fields that determine business behavior.

The fingerprint strategy must define:

Which request components are included.
How JSON is canonicalized.
Which headers are ignored.
How content types are handled.
How query parameters are normalized.
How API policy changes affect fingerprint compatibility.

Exclude volatile transport headers such as tracing identifiers and connection metadata.

Do not use the entire raw request body as the idempotency key by default.

8.3 State machine

Implement a state machine equivalent to:

ABSENT
  |
  | atomic claim
  v
IN_PROGRESS
  |
  +---- confirmed success ----> COMPLETED
  |
  +---- confirmed failure ----> FAILED
  |
  +---- uncertain outcome ----> UNKNOWN


A retry with the same key and fingerprint must follow the configured policy.

ABSENT: attempt an atomic claim.
IN_PROGRESS: do not execute a second business request.
COMPLETED: replay the saved response when eligible.
FAILED: apply the documented retry policy.
UNKNOWN: require safe recovery, reconciliation, or downstream idempotency before repeating a potentially committed side effect.

Never automatically turn an expired IN_PROGRESS record into a fresh executable request without evaluating the outcome of the previous execution.

8.4 Atomic claim

Implement atomic state transitions.

For Redis, use appropriate atomic primitives, Lua scripts, or equivalent mechanisms.

Do not use separate GET and SET operations as a substitute for an atomic claim.

8.5 Completion protocol

A successful upstream response must not be returned to the client as a fully recorded idempotent success until the result has been durably committed according to the configured consistency contract.

If the upstream succeeds but recording the response fails, do not blindly execute the upstream again.

Represent the uncertainty explicitly and provide a recovery mechanism.

8.6 Response replay

Define exactly which response fields are stored and replayed.

Preserve appropriate application response information, including status and body, while excluding hop-by-hop headers and headers that should be regenerated.

Set a platform-specific response header such as:

Idempotency-Replayed: true


Do not store or replay arbitrary responses without configured size limits and security controls.

9. Control Plane API Contract

Implement and document the following endpoints.

Register an API
POST /v1/apis
Authorization: Bearer <access-token>
Idempotency-Key: <provisioning-operation-key>
Content-Type: application/json


Example:

{
  "name": "Create Order",
  "upstream": {
    "url": "https://orders.example.com/api/orders",
    "method": "POST"
  },
  "idempotency": {
    "keySource": {
      "type": "HEADER",
      "name": "Idempotency-Key"
    },
    "retentionSeconds": 86400,
    "onInProgress": "RETURN_CONFLICT",
    "replayResponse": true
  }
}


Return 202 Accepted when provisioning is asynchronous.

Return an operation identifier and a link or endpoint for checking provisioning status.

Retrieve an API
GET /v1/apis/{apiId}


Return the current status, active configuration version, gateway URL, and safe-to-disclose policy information.

List APIs
GET /v1/apis


Support tenant scoping, pagination, and filtering by status.

Update an API
PATCH /v1/apis/{apiId}


Validate and version configuration changes.

Prevent unsafe changes from silently invalidating active idempotency guarantees.

Activate an API
POST /v1/apis/{apiId}/activate


Activate only after required resources and route configuration are ready.

Deactivate an API
POST /v1/apis/{apiId}/deactivate


Prevent new requests from entering according to the documented behavior while preserving the handling of in-flight requests.

Delete an API
DELETE /v1/apis/{apiId}


Use a safe deletion workflow. Do not immediately delete idempotency state that may still be required to prevent duplicate side effects.

Provisioning status
GET /v1/operations/{operationId}


Return the operation state, progress, and safe error details.

All management endpoints must enforce authentication, authorization, validation, and tenant isolation.

10. Data Plane API Contract

The developer calls the generated gateway URL rather than the original upstream URL.

Example:

POST /v1/proxy/{routeId}
Idempotency-Key: order-2026-001
Content-Type: application/json
Authorization: Bearer <client-token>


The platform resolves the registered upstream and forwards the request.

Expected behavior
Condition	Expected behavior
New key	Claim and forward
Same key and fingerprint, completed	Replay eligible saved response
Same key and fingerprint, in progress	Return configured conflict or bounded wait
Same key, different fingerprint	Return 422
Invalid or missing key	Return 400
Invalid client credentials	Return 401 or 403
Upstream outcome unknown	Return a documented uncertainty response and retain recoverable state
State store unavailable	Fail closed with 503 for protected operations

These are proposed contract defaults. Keep error codes and response formats consistent across all routes.

Define a standard error schema containing:

code
message
requestId
retryable
Optional operationReference

Do not expose internal stack traces, secrets, raw Redis errors, or sensitive upstream data.

11. Provisioning Workflow

Implement provisioning as an asynchronous, retryable workflow.

Required steps:

Authenticate the developer and resolve the tenant.
Validate the request and upstream URL.
Validate route safety and upstream authentication configuration.
Create the API registration in PROVISIONING state.
Allocate the logical storage namespace and policy metadata.
Verify that the required storage is available.
Publish a versioned route configuration.
Verify that the required Data Plane configuration has been loaded.
Mark the API ACTIVE.
Return the gateway URL and an example HTTP request.

Use explicit lifecycle states:

PENDING
  -> PROVISIONING
  -> ACTIVE

PROVISIONING
  -> FAILED

ACTIVE
  -> DEACTIVATING
  -> DEACTIVATED
  -> DELETING
  -> DELETED


Allow retries after recoverable provisioning failures.

Provisioning must be idempotent. Repeating an operation must not create duplicate resources or conflicting active routes.

Use a durable job or operation record. Do not rely exclusively on in-memory background tasks.

Configuration updates must use versioning and an explicit activation process.

12. Security Requirements

Security is mandatory, not a later enhancement.

Authentication and authorization
Authenticate portal users.
Authenticate gateway clients.
Enforce tenant-level authorization.
Prevent cross-tenant API access.
Support credential rotation.
Store upstream credentials in a secure secret store or protected credential subsystem.
SSRF and proxy safety
Never accept arbitrary destination URLs from normal gateway requests.
Allow only registered upstream destinations.
Restrict loopback, private, link-local, and cloud metadata destinations unless explicitly authorized by deployment policy.
Validate DNS resolution and destination IPs.
Revalidate redirect targets; preferably disable redirects by default for upstream calls.
Restrict allowed schemes to HTTPS by default in production.
Apply outbound network restrictions at infrastructure level where possible.
Data protection
Never log authorization tokens or raw idempotency keys.
Avoid logging full request or response bodies.
Redact sensitive headers.
Encrypt network traffic.
Apply appropriate at-rest protection.
Limit response replay retention and access.
Prevent clients from reading another tenant's stored response.
Resource protection
Limit request and response sizes.
Apply request rate limits and concurrency limits.
Validate TTL values against server-side maximums.
Prevent unbounded key creation and storage exhaustion.
Apply upstream timeouts and connection pool limits.
Protect against malicious or malformed HTTP requests.
13. Consistency and Failure Recovery

The platform must explicitly document its consistency model.

Upstream side effects

A proxy cannot atomically commit a transaction in an independent upstream service and another transaction in its own state store without an additional coordination protocol.

Example failure:

The Gateway forwards a payment request.
The payment service commits the payment.
The Gateway crashes before recording the response.
The client retries.

The Gateway must not assume that the payment failed.

Implement a safe strategy based on one or more of:

Propagating the same idempotency key to an upstream that supports idempotency.
Querying the upstream using a durable business reference.
Reconciliation workflows.
A documented policy that leaves the request in UNKNOWN until resolved.

Never advertise universal exactly-once execution.

Redis failure
Define the expected behavior when Redis is unavailable.
Do not bypass state checks for protected operations.
Test primary failover and acknowledged-write loss scenarios.
Document the limits of asynchronous replication.
Define how unresolved requests are recovered.
Lease expiration
Treat a lease as coordination metadata, not proof that an old worker has stopped.
Use owner tokens to prevent stale state updates.
Use fencing tokens only where the downstream can enforce them.
Do not assume lease expiration prevents a delayed worker from producing an external side effect.
TTL expiration
Apply retention policies appropriate to the business operation.
Prevent active operations from being discarded prematurely.
Document the end of the duplicate-protection window.
Keep long-lived business deduplication records where required.
Configuration changes
Version route and policy configurations.
Preserve compatible key scope across configuration updates.
Define behavior for requests already in progress during an update.
Avoid silently routing the same logical operation into a new idempotency namespace.
14. Availability and Scalability

Implement the application so it can run multiple stateless Gateway instances.

Requirements:

No authoritative idempotency state in local process memory.
Shared state across all Gateway instances.
Readiness and liveness endpoints.
Graceful shutdown.
Explicit connection and request timeouts.
Bounded retry policies.
Circuit breaking or equivalent upstream protection where appropriate.
Structured logs.
Correlation identifiers.
Metrics for request outcomes and dependencies.
Configuration caching with controlled version updates.

Production deployments should support multiple failure domains where available.

Do not claim high availability simply because the application has multiple replicas. Storage failover, durability, upstream availability, routing, and recovery are also part of the end-to-end availability model.

15. Observability

Expose metrics such as:

Total gateway requests.
New idempotency claims.
Duplicate requests.
Replayed responses.
Fingerprint conflicts.
Requests currently in progress.
Unknown outcomes.
Upstream timeout count.
Storage latency and error rate.
Provisioning duration and failures.
Response storage failures.
Idempotency record expiration and cleanup activity.

Use structured logs with fields such as:

requestId
tenantId
apiId
routeId
policyVersion
idempotencyState
upstreamStatus

Do not include raw idempotency keys, credentials, or sensitive payloads in metric labels or logs.

Create operational dashboards and alerts for stuck requests, state-store failures, provisioning failures, and unusual conflict rates.

16. Frontend Requirements

Build a real developer portal backed by the Control Plane APIs.

Dashboard

Display:

Registered APIs.
API activation status.
Gateway URL.
Request volume.
Replay and conflict counts.
Recent provisioning errors.
Create API page

Provide a guided form for:

API name.
Upstream URL.
HTTP method.
Upstream authentication.
Idempotency key source.
Retention policy.
Duplicate handling policy.

Use safe defaults and explain advanced settings in beginner-friendly language.

API detail page

Display:

Active route.
Gateway URL.
Configuration version.
Current policy.
Provisioning status.
Example curl request.
Recent errors and relevant metrics.
Usability rules
Show validation errors next to the corresponding field.
Explain configuration terms in plain language.
Never display credentials after they have been securely saved.
Clearly distinguish provisioning from activation.
Provide retry actions for recoverable provisioning failures.
Do not mark an API active before the backend confirms activation.
17. Testing Strategy

Testing must cover correctness, failure handling, security, and user experience.

Unit tests

Test:

Key scope generation.
Request fingerprinting.
Policy validation.
State machine transitions.
Response eligibility for replay.
Error mapping.
Configuration version compatibility.
Integration tests

Use real disposable PostgreSQL and Redis instances where practical.

Test:

Atomic claim behavior.
Concurrent requests using the same key.
Same key with different payloads.
Storage expiration.
Storage connection failures.
Provisioning retries.
Database migration execution.
Response persistence and replay.
End-to-end tests

Run:

The Control Plane.
The Data Plane.
PostgreSQL.
Redis.
A controllable mock upstream.
The frontend where relevant.

Verify the entire workflow:

Register API.
Wait for provisioning.
Obtain gateway URL.
Send the first request.
Repeat the same request.
Confirm that the upstream side effect occurred only once in the tested scenario.
Confirm that the replayed response matches the configured contract.
Send the same key with a different payload and verify rejection.
Failure injection tests

Test:

Kill a Gateway instance during upstream execution.
Simulate upstream timeout after committing a side effect.
Disconnect Redis.
Simulate state-store failover.
Fail response persistence after upstream success.
Expire or invalidate a lease while the original worker is still running.
Update a route while requests are in progress.
Retry provisioning after a partial failure.

A test that only checks HTTP status codes is insufficient. For side-effecting operations, verify the actual number of business executions and the resulting business state.

18. Docker and Local Development

Provide a working compose.yaml for local development.

At minimum, it should run:

Control Plane.
Gateway.
PostgreSQL.
Redis.
Frontend, if included in the development stack.

Include a mock upstream service or a reproducible way to start one.

Requirements:

Use health checks.
Use persistent volumes where appropriate.
Provide .env.example.
Never commit real secrets.
Document the exact startup commands.
Document migration behavior.
Make the initial developer workflow reproducible on a clean machine.

A single-node local Redis container is sufficient for basic development but must not be represented as a production HA configuration.

19. CI/CD and Code Quality

Set up automated checks for:

Compilation.
Unit tests.
Integration tests.
Frontend type checking.
Linting and formatting.
Dependency vulnerability scanning where available.
Container image build.
API contract validation.
Database migration checks.

Use reproducible builds and pin dependencies.

Do not deploy production changes automatically unless the repository's existing deployment policy explicitly permits it.

Provide a concise CI summary identifying failures and remediation steps.

20. Definition of Done

A feature is complete only when all applicable criteria are satisfied:

Implementation exists in the actual repository.
API contracts and validation are documented.
Authorization and tenant isolation are enforced.
Unit tests pass.
Relevant integration tests pass.
The feature is exercised through the actual application.
Errors are handled explicitly.
Logs and metrics are appropriate.
Configuration and migrations are included.
Documentation reflects the implemented behavior.
No known critical consistency or security issue is hidden behind a mock.

For a production-readiness claim, the relevant failure scenarios must also be tested.

If the environment cannot run Docker or external services, report the limitation explicitly and run every other available check. Do not claim unexecuted integration tests passed.

21. Implementation Roadmap

Develop in the following order.

Phase 0 — Repository Assessment
Inspect the repository.
Identify existing frameworks and code conventions.
Confirm runtime versions.
Create the implementation plan.
Record architectural decisions.

Deliverable: repository assessment and an actionable plan.

Phase 1 — Working Local Foundation
Configure the build.
Add PostgreSQL and Redis to Docker Compose.
Implement migrations.
Implement application health endpoints.
Verify that the application starts.

Deliverable: reproducible local environment.

Phase 2 — Idempotency Core
Define the domain model.
Implement key scope and fingerprinting.
Implement atomic claims.
Implement the state machine.
Implement storage abstraction.
Implement completion and replay behavior.

Deliverable: tested core engine.

Phase 3 — Proxy Data Plane
Implement registered route resolution.
Implement client authentication.
Implement upstream HTTP forwarding.
Implement response storage and replay.
Implement conflicts, timeouts, and uncertain outcomes.

Deliverable: functional proxy verified against a mock upstream.

Phase 4 — Control Plane and Provisioning
Implement API registration.
Implement policy management.
Implement durable provisioning operations.
Implement route publication.
Implement activation, deactivation, and safe deletion.

Deliverable: API can be provisioned without manual database or Redis operations.

Phase 5 — Developer Portal
Implement login.
Implement API creation form.
Implement API listing and details.
Display gateway URLs and usage examples.
Display provisioning progress and errors.

Deliverable: a beginner can configure and use an API through the portal.

Phase 6 — HA, Recovery, and Security
Add multiple Gateway instances.
Test state-store failure behavior.
Implement recovery workflows.
Harden upstream routing and credentials.
Add metrics and alerting.
Verify tenant isolation.

Deliverable: documented and tested failure behavior.

Phase 7 — Production Readiness
Finalize deployment configuration.
Complete end-to-end tests.
Document backup, restore, and operational procedures.
Establish service-level objectives.
Review data retention and security.
Publish known limitations.

Deliverable: a reproducible deployment with evidence of verification.

22. Required Agent Reporting

After each implementation phase, provide:

What was implemented.
Important design decisions.
Files and modules changed.
Commands executed.
Tests that passed.
Tests that failed or could not run.
Known defects and limitations.
The next concrete implementation steps.

Keep the report concise and factual.

Do not mark a phase complete merely because its code has been generated.

23. Final Product Acceptance Criteria

The MVP is accepted when a developer with no infrastructure experience can:

Start or access the platform using documented instructions.
Register an existing HTTP API through the portal.
Configure its upstream authentication and idempotency key.
Wait for automatic provisioning.
Receive an active Gateway URL.
Replace the original URL in an HTTP client.
Send two requests with the same key and fingerprint.
Observe the configured duplicate-handling behavior.
Receive the saved response for a completed duplicate request.
Receive a conflict for the same key with a different fingerprint.
Understand what happens when the upstream outcome is uncertain.
Observe useful errors and operational status without accessing Redis or PostgreSQL directly.

The system must also demonstrate that its documented guarantees hold under concurrent requests and the failure scenarios included in the test suite.

24. Final Instruction

Start by inspecting the repository and reporting its current state.

Then implement the project incrementally, beginning with the smallest end-to-end workflow that can be executed and tested.

Prioritize a working, safe, understandable product over a large but incomplete architecture.

The final goal is simple: a developer registers an API, receives a gateway URL, and gains useful idempotency protection without manually building or operating the infrastructure behind it.