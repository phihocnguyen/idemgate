import { withGate, withoutGate } from "@/lib/landing/data";
import type { LogRow } from "@/lib/landing/types";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

function toneClass(t: LogRow["tone"]) {
  if (t === "ok") return "text-emerald-400";
  if (t === "warn") return "text-amber-300";
  if (t === "err") return "text-red-400";
  return "text-mute";
}

function LogTable({ title, rows, bad }: { title: string; rows: LogRow[]; bad?: boolean }) {
  return (
    <div className="overflow-hidden border border-hairline bg-canvas-soft/40">
      <div className="flex items-center justify-between gap-4 border-b border-hairline px-5 py-3.5">
        <p className="text-caption-mono-sm text-body">{title}</p>
        {bad ? (
          <span className="text-caption-mono-sm text-red-400">×3 charges</span>
        ) : (
          <span className="text-caption-mono-sm text-accent-sunset">1 charge</span>
        )}
      </div>
      <ul className="divide-y divide-hairline font-mono text-[13px]">
        {rows.map((r) => (
          <li key={r.id} className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-3 gap-y-1 px-5 py-3.5 sm:grid-cols-[3.25rem_minmax(0,1fr)_auto]">
            <span className="text-mute">{r.method}</span>
            <span className="truncate text-body">
              {r.path}{" "}
              <span className={toneClass(r.tone)}>{r.status}</span>
            </span>
            <span className={`col-span-2 text-xs sm:col-span-1 sm:text-right ${toneClass(r.tone)}`}>{r.note}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Comparison() {
  return (
    <Section id="compare" eyebrow="Before / after" title="Same retries. Different ledger.">
      <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
        <Reveal>
          <LogTable title="Without IdemGate" rows={withoutGate} bad />
        </Reveal>
        <Reveal delay={100}>
          <LogTable title="With IdemGate" rows={withGate} />
        </Reveal>
      </div>
    </Section>
  );
}
