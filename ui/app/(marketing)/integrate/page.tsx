import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Integrate",
  description: "Onboarding guide to run IdemGate and wire claim → work → complete",
};

const btnPrimary =
  "inline-flex items-center rounded-md bg-signal px-[1.15rem] py-[0.7rem] text-[0.95rem] font-semibold text-[#f4faf6] transition hover:-translate-y-px hover:bg-signal-deep hover:no-underline";
const btnGhost =
  "inline-flex items-center rounded-md border border-line bg-transparent px-[1.15rem] py-[0.7rem] text-[0.95rem] font-semibold text-ink transition hover:-translate-y-px hover:no-underline";

export default function IntegratePage() {
  return (
    <>
      <div className="mx-auto max-w-6xl px-6 pb-4 pt-10">
        <h1 className="font-display text-[clamp(2rem,4vw,2.8rem)] tracking-tight">
          Integrate IdemGate
        </h1>
        <p className="mt-2 max-w-xl text-[1.05rem] leading-relaxed text-muted">
          Run the registry, choose an integration path, then prove a double-submit replays instead of
          re-executing. Use the dashboard to inspect claims as you go.
        </p>
      </div>

      <nav className="mx-auto flex max-w-6xl flex-wrap gap-2 px-6 pt-5" aria-label="Onboarding sections">
        {[
          ["#run", "1. Run"],
          ["#paths", "2. Paths"],
          ["#loop", "3. Claim loop"],
          ["#verify", "4. Verify"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-md border border-line bg-panel px-3.5 py-1.5 text-sm hover:border-signal hover:text-signal-deep hover:no-underline"
          >
            {label}
          </a>
        ))}
      </nav>

      <Step id="run" label="Step 01" title="Run the registry">
        <p className="mb-4 max-w-2xl text-muted leading-relaxed">
          Start Postgres + server with Compose, or point Spring at an existing database.
        </p>
        <Pre>{`cd idemgate
export IDEMGATE_API_KEY=dev-secret-change-me
docker compose up --build

# health
curl -s http://localhost:8080/actuator/health`}</Pre>
      </Step>

      <Step id="paths" label="Step 02" title="Pick an integration path">
        <p className="mb-4 max-w-2xl text-muted leading-relaxed">
          Same guarantees — different glue. Start with HTTP if you are exploring; use the starter in
          Spring apps.
        </p>
        <div className="grid border-y border-line md:grid-cols-3">
          <PathCol n="HTTP" title="Raw API">
            <code>POST /v1/operations/claim</code> then complete with <code>ownerToken</code>. Any
            language.
          </PathCol>
          <PathCol n="SDK" title="idemgate-client" mid>
            Java HTTP client wrapping claim, heartbeat, and complete.
          </PathCol>
          <PathCol n="Starter" title="@Idempotent" last>
            Annotate a method; the aspect runs the loop and fails closed by default.
          </PathCol>
        </div>
      </Step>

      <Step id="loop" label="Step 03" title="Claim → work → complete">
        <p className="mb-4 max-w-2xl text-muted leading-relaxed">
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

        <p className="mt-5 mb-4 text-muted">
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

      <Step id="verify" label="Step 04" title="Verify in the dashboard">
        <p className="mb-4 max-w-2xl text-muted leading-relaxed">
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
              className="relative border-b border-line py-2.5 pl-5 leading-snug text-muted before:absolute before:left-0 before:top-3.5 before:h-2 before:w-2 before:bg-signal"
            >
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/operations" className={btnPrimary}>
            Open operations
          </Link>
          <Link href="/settings" className={btnGhost}>
            Settings
          </Link>
        </div>
      </Step>

      <section className="mx-auto max-w-6xl px-6 pb-16 pt-8">
        <div className="flex flex-wrap items-baseline justify-between gap-5 border-t border-line py-8">
          <div>
            <h2 className="font-display text-[clamp(1.6rem,3vw,2.1rem)] tracking-tight">
              Need the full contract?
            </h2>
            <p className="mt-2 max-w-xl text-[1.05rem] leading-relaxed text-muted">
              Errors, heartbeat, business keys, and admin search live in{" "}
              <code>docs/api-contract.md</code>, <code>docs/fingerprint.md</code>, and{" "}
              <code>docs/troubleshooting.md</code>.
            </p>
          </div>
          <Link href="/" className={btnGhost}>
            Back to home
          </Link>
        </div>
      </section>
    </>
  );
}

function Step({
  id,
  label,
  title,
  children,
}: {
  id: string;
  label: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-6xl scroll-mt-4 px-6 py-9">
      <div className="mb-1 font-mono text-xs uppercase tracking-[0.1em] text-signal">{label}</div>
      <h2 className="mb-2 font-display text-[1.45rem] tracking-tight">{title}</h2>
      {children}
    </section>
  );
}

function Pre({ children }: { children: string }) {
  return (
    <pre className="m-0 overflow-x-auto rounded-lg bg-code px-4 py-4 font-mono text-[0.82rem] leading-relaxed whitespace-pre text-code-fg">
      {children}
    </pre>
  );
}

function PathCol({
  n,
  title,
  children,
  mid,
  last,
}: {
  n: string;
  title: string;
  children: React.ReactNode;
  mid?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={`border-line py-5 md:py-6 ${last ? "" : "border-b md:border-b-0 md:border-r"} ${
        mid || last ? "md:px-5" : "md:pr-5"
      }`}
    >
      <div className="mb-2 font-mono text-xs tracking-wider text-signal">{n}</div>
      <h3 className="mb-1.5 font-display text-lg tracking-tight">{title}</h3>
      <p className="m-0 text-[0.98rem] leading-relaxed text-muted">{children}</p>
    </div>
  );
}
