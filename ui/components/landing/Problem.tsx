import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Problem() {
  return (
    <Section id="problem" eyebrow="The failure mode" title="Timeouts do not forgive.">
      <div className="grid gap-10 md:grid-cols-2 md:gap-20">
        <Reveal>
          <p className="text-body-lg text-body">
            A client retries. A load balancer retries. Your worker retries. Three{" "}
            <span className="text-ink">201 Created</span> responses later, the customer was charged three times —
            and each log line looks correct alone.
          </p>
        </Reveal>
        <Reveal delay={100}>
          <p className="text-body-lg text-body">
            IdemGate is a Postgres registry on that path: claim the key, run the side effect once, replay the stored
            response forever after. Race losers get conflict. Mismatched bodies fail closed.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
