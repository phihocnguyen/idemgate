import {
  Band,
  ButtonOutline,
  ButtonPrimary,
  Card,
  Container,
  Divider,
  Eyebrow,
} from "@/components/ui";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrate",
  description: "Onboarding guide to run IdemGate and wire claim → work → complete",
};

export default function IntegratePage() {
  return (
    <>
      <Band>
        <Container>
          <Eyebrow className="mb-4">Onboarding</Eyebrow>
          <h1 className="text-display-md text-ink">Integrate IdemGate</h1>
          <p className="mt-4 max-w-2xl text-body-lg text-body">
            Run the registry, choose an integration path, then prove a double-submit replays instead
            of re-executing. Use the dashboard to inspect claims as you go.
          </p>
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="Onboarding sections">
            {[
              ["#run", "1. Run"],
              ["#paths", "2. Paths"],
              ["#loop", "3. Claim loop"],
              ["#verify", "4. Verify"],
            ].map(([href, label]) => (
              <a
                key={href}
                href={href}
                className="rounded-pill border border-white/25 px-3 py-1 text-button-md text-ink hover:border-white/40 hover:no-underline"
              >
                {label}
              </a>
            ))}
          </nav>
        </Container>
      </Band>

      <Divider />

      <Step id="run" eyebrow="Step 01" title="Run the registry">
        <p className="mb-6 max-w-2xl text-body-md text-body">
          Start Postgres + server with Compose, or point Spring at an existing database.
        </p>
        <Pre>{`cd idemgate
export IDEMGATE_API_KEY=dev-secret-change-me
docker compose up --build

# health
curl -s http://localhost:8080/actuator/health`}</Pre>
      </Step>

      <Divider />

      <Step id="paths" eyebrow="Step 02" title="Pick an integration path">
        <p className="mb-6 max-w-2xl text-body-md text-body">
          Same guarantees — different glue. Start with HTTP if you are exploring; use the starter in
          Spring apps.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <p className="text-caption-mono-sm text-mute">HTTP</p>
            <h3 className="mt-3 text-display-xs">Raw API</h3>
            <p className="mt-2 text-body-md text-body">
              <code>POST /v1/operations/claim</code> then complete with <code>ownerToken</code>. Any
              language.
            </p>
          </Card>
          <Card>
            <p className="text-caption-mono-sm text-mute">SDK</p>
            <h3 className="mt-3 text-display-xs">idemgate-client</h3>
            <p className="mt-2 text-body-md text-body">
              Java HTTP client wrapping claim, heartbeat, and complete.
            </p>
          </Card>
          <Card>
            <p className="text-caption-mono-sm text-mute">Starter</p>
            <h3 className="mt-3 text-display-xs">@Idempotent</h3>
            <p className="mt-2 text-body-md text-body">
              Annotate a method; the aspect runs the loop and fails closed by default.
            </p>
          </Card>
        </div>
      </Step>

      <Divider />

      <Step id="loop" eyebrow="Step 03" title="Claim → work → complete">
        <p className="mb-6 max-w-2xl text-body-md text-body">
          Fingerprint is SHA-256 of the canonical payload. Same key + different fingerprint →{" "}
          <code>409 PAYLOAD_MISMATCH</code>.
        </p>
        <Pre>{`# 1) Claim
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
# → claimed=false, status=COMPLETED, response replayed`}</Pre>

        <p className="mt-6 mb-4 text-body-md text-body">
          Spring starter path — dependency <code>idemgate-spring-boot-starter</code>, then:
        </p>
        <Pre>{`@Idempotent(scope = "payments", key = "#orderId + ':pay'")
public ChargeResult charge(String orderId, ChargeRequest req) {
  return paymentProvider.charge(req);
}

# application.yaml
idemgate:
  client:
    base-url: http://localhost:8080
    api-key: \${IDEMGATE_API_KEY}
    fail-closed: true`}</Pre>
      </Step>

      <Divider />

      <Step id="verify" eyebrow="Step 04" title="Verify in the dashboard">
        <p className="mb-6 max-w-2xl text-body-md text-body">
          Open the operations UI against the same API key. Confirm the record, filters, and body
          redaction defaults.
        </p>
        <ul className="m-0 max-w-2xl list-none p-0">
          {[
            "List shows your scope/key with status COMPLETED after complete.",
            "Second claim does not create a second row — same operation, replay.",
            "Detail shows fingerprint; response body stays redacted until you enable expose in Settings.",
            "IN_PROGRESS rows appear when you claim without completing (lease still held).",
          ].map((item) => (
            <li
              key={item}
              className="border-b border-hairline py-3 pl-4 text-body-md text-body before:mr-3 before:inline-block before:text-mute before:content-['—']"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-8 flex flex-wrap gap-3">
          <ButtonPrimary href="/operations">Open operations</ButtonPrimary>
          <ButtonOutline href="/settings">Settings</ButtonOutline>
        </div>
      </Step>

      <Divider />

      <Band>
        <Container className="flex flex-wrap items-end justify-between gap-6">
          <div className="max-w-xl">
            <Eyebrow className="mb-4">Docs</Eyebrow>
            <h2 className="text-display-md text-ink">Need the full contract?</h2>
            <p className="mt-4 text-body-lg text-body">
              Errors, heartbeat, business keys, and admin search live in{" "}
              <code>docs/api-contract.md</code>, <code>docs/fingerprint.md</code>, and{" "}
              <code>docs/troubleshooting.md</code>.
            </p>
          </div>
          <ButtonOutline href="/">Back to home</ButtonOutline>
        </Container>
      </Band>
    </>
  );
}

function Step({
  id,
  eyebrow,
  title,
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Band>
      <Container id={id} className="scroll-mt-16">
        <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
        <h2 className="mb-4 text-display-md text-ink">{title}</h2>
        {children}
      </Container>
    </Band>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="m-0 overflow-x-auto rounded-sm border border-hairline bg-canvas-mid px-6 py-4 font-mono text-body-sm leading-relaxed whitespace-pre text-body">
      {children}
    </pre>
  );
}
