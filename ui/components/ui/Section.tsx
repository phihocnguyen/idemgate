import type { ReactNode } from "react";
import { Container } from "./Container";

export function Section({
  id,
  eyebrow,
  title,
  children,
  className = "",
}: {
  id?: string;
  eyebrow?: string;
  title?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`relative py-20 md:py-28 ${className}`}>
      <Container>
        {(eyebrow || title) && (
          <header className="mb-10 max-w-2xl md:mb-14">
            {eyebrow ? <p className="mb-3 text-caption-mono text-mute">{eyebrow}</p> : null}
            {title ? <h2 className="text-display-sm text-ink md:text-display-md">{title}</h2> : null}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
