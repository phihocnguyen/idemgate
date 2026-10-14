import { logos } from "@/lib/landing/data";
import { Container } from "@/components/ui/Container";

export function LogoStrip() {
  return (
    <div className="border-y border-hairline py-12">
      <Container>
        <p className="mb-8 text-center text-caption-mono-sm text-mute">
          For teams that cannot afford a double charge
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
          {logos.map((name) => (
            <li key={name} className="font-mono text-[13px] tracking-[0.08em] text-body-mid uppercase">
              {name}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
