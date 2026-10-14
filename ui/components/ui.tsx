import Link from "next/link";
import type { ComponentProps } from "react";

/** White-filled pill — rare primary CTA (DESIGN.md button-primary). */
export function ButtonPrimary({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-pill border border-primary bg-primary px-3 py-1 text-button-md text-on-primary hover:no-underline ${className}`}
    >
      {children}
    </Link>
  );
}

/** Canonical white-outline pill (DESIGN.md button-outline-on-dark). */
export function ButtonOutline({
  href,
  children,
  className = "",
  size = "md",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  size?: "md" | "sm";
}) {
  const pad = size === "sm" ? "px-3 py-1" : "px-4 py-2";
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center rounded-pill border border-white/25 bg-transparent ${pad} text-button-md text-ink hover:border-white/40 hover:text-ink-hover hover:no-underline ${className}`}
    >
      {children}
    </Link>
  );
}

export function Eyebrow({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <p className={`text-caption-mono text-ink ${className}`}>{children}</p>;
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-sm border border-hairline bg-canvas-card p-6 text-body-md text-ink ${className}`}>
      {children}
    </div>
  );
}

export function Band({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`bg-canvas px-6 py-16 text-ink ${className}`}>{children}</section>;
}

export function Container({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`mx-auto w-full max-w-[1200px] ${className}`}>
      {children}
    </div>
  );
}

export function Divider({ className = "" }: { className?: string }) {
  return <hr className={`border-0 border-t border-hairline ${className}`} />;
}

export function NavLink(props: ComponentProps<typeof Link>) {
  const { className = "", ...rest } = props;
  return <Link {...rest} className={`text-body-sm text-ink hover:text-ink-hover hover:no-underline ${className}`} />;
}
