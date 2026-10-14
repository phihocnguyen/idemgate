import { cliBlocks } from "@/lib/landing/data";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export function Terminal() {
  return (
    <Section id="cli" eyebrow="Wire protocol" title="Claim. Replay. Conflict.">
      <div className="grid gap-4 lg:grid-cols-3">
        {cliBlocks.map((b, i) => (
          <Reveal key={b.id} delay={i * 80}>
            <div className="border border-hairline bg-[#070709] font-mono text-sm">
              <div className="flex items-center gap-2 border-b border-hairline px-4 py-2">
                <span className="size-2 rounded-full bg-[#ff5f57]/80" />
                <span className="size-2 rounded-full bg-[#febc2e]/80" />
                <span className="size-2 rounded-full bg-[#28c840]/80" />
                <span className="ml-2 text-caption-mono-sm text-mute">{b.prompt}</span>
              </div>
              <pre className="overflow-x-auto p-4 leading-6">
                {b.lines.map((l, idx) => (
                  <div
                    key={idx}
                    className={
                      l.kind === "in"
                        ? "text-body"
                        : l.kind === "ok"
                          ? "text-emerald-400"
                          : l.kind === "err"
                            ? "text-red-400"
                            : "text-accent-breeze"
                    }
                  >
                    {l.text}
                  </div>
                ))}
              </pre>
            </div>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
