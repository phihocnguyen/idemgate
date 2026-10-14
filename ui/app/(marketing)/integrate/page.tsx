import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrate",
  description: "Onboarding guide to run IdemGate and wire claim → work → complete",
};

export default function IntegratePage() {
  return (
    <>
      <div className="onboard-hero">
        <h1>Integrate IdemGate</h1>
        <p>
          Run the registry, choose an integration path, then prove a double-submit replays instead of
          re-executing. Use the dashboard to inspect claims as you go.
        </p>
      </div>

      <nav className="path-nav" aria-label="Onboarding sections">
        <a href="#run">1. Run</a>
        <a href="#paths">2. Paths</a>
        <a href="#loop">3. Claim loop</a>
        <a href="#verify">4. Verify</a>
      </nav>

      <section className="step" id="run">
        <div className="step-label">Step 01</div>
        <h2>Run the registry</h2>
        <p>Start Postgres + server with Compose, or point Spring at an existing database.</p>
        <pre className="pre">{`cd idemgate
export IDEMGATE_API_KEY=dev-secret-change-me
docker compose up --build

# health
curl -s http://localhost:8080/actuator/health`}</pre>
      </section>

      <section className="step" id="paths">
        <div className="step-label">Step 02</div>
        <h2>Pick an integration path</h2>
        <p>Same guarantees — different glue. Start with HTTP if you are exploring; use the starter in Spring apps.</p>
        <div className="flow">
          <div className="flow-step">
            <div className="flow-num">HTTP</div>
            <h3>Raw API</h3>
            <p>
              <code>POST /v1/operations/claim</code> then complete with <code>ownerToken</code>. Any language.
            </p>
          </div>
          <div className="flow-step">
            <div className="flow-num">SDK</div>
            <h3>idemgate-client</h3>
            <p>Java HTTP client wrapping claim, heartbeat, and complete.</p>
          </div>
          <div className="flow-step">
            <div className="flow-num">Starter</div>
            <h3>@Idempotent</h3>
            <p>Annotate a method; the aspect runs the loop and fails closed by default.</p>
          </div>
        </div>
      </section>

      <section className="step" id="loop">
        <div className="step-label">Step 03</div>
        <h2>Claim → work → complete</h2>
        <p>
          Fingerprint is SHA-256 of the canonical payload. Same key + different fingerprint →{" "}
          <code>409 PAYLOAD_MISMATCH</code>.
        </p>
        <pre className="pre">{`# 1) Claim
curl -s -X POST http://localhost:8080/v1/operations/claim \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: dev-secret-change-me" \\
  -d '{
    "scope": "payments",
    "key": "ord_123:pay",
    "fingerprint": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    "requestMethod": "POST",
    "requestPath": "/api/charges"
  }'
# claimed=true → keep operationId + ownerToken

# 2) Do business work here…

# 3) Complete
curl -s -X POST http://localhost:8080/v1/operations/<operationId>/complete \\
  -H "Content-Type: application/json" \\
  -H "X-Api-Key: dev-secret-change-me" \\
  -d '{
    "status": "COMPLETED",
    "responseStatus": 200,
    "responseBody": "{\\"chargeId\\":\\"ch_1\\"}",
    "ownerToken": "<ownerToken>"
  }'

# 4) Double-submit: claim again with the same scope/key/fingerprint
# → claimed=false, status=COMPLETED, response replayed`}</pre>

        <p style={{ marginTop: "1.25rem" }}>
          Spring starter path — dependency <code>idemgate-spring-boot-starter</code>, then:
        </p>
        <pre className="pre">{`@Idempotent(scope = "payments", key = "#orderId + ':pay'")
public ChargeResult charge(String orderId, ChargeRequest req) {
  return paymentProvider.charge(req);
}

# application.yaml
idemgate:
  client:
    base-url: http://localhost:8080
    api-key: \${IDEMGATE_API_KEY}
    fail-closed: true`}</pre>
      </section>

      <section className="step" id="verify">
        <div className="step-label">Step 04</div>
        <h2>Verify in the dashboard</h2>
        <p>
          Open the operations UI against the same API key. Confirm the record, filters, and body
          redaction defaults.
        </p>
        <ul className="check-list">
          <li>List shows your scope/key with status COMPLETED after complete.</li>
          <li>Second claim does not create a second row — same operation, replay.</li>
          <li>Detail shows fingerprint; response body stays redacted until you enable expose in Settings.</li>
          <li>IN_PROGRESS rows appear when you claim without completing (lease still held).</li>
        </ul>
        <div className="hero-ctas" style={{ marginTop: "1.5rem" }}>
          <Link href="/operations" className="btn btn-primary">
            Open operations
          </Link>
          <Link href="/settings" className="btn btn-ghost">
            Settings
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="integrate-cta">
          <div>
            <h2>Need the full contract?</h2>
            <p className="section-lead" style={{ marginBottom: 0 }}>
              Errors, heartbeat, business keys, and admin search live in{" "}
              <code>docs/api-contract.md</code>, <code>docs/fingerprint.md</code>, and{" "}
              <code>docs/troubleshooting.md</code>.
            </p>
          </div>
          <Link href="/" className="btn btn-ghost">
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}
