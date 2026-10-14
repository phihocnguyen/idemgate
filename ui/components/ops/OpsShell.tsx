"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const links = [
  { href: "/ops", label: "Operations" },
  { href: "/ops/settings", label: "Settings" },
];

export function OpsShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const logout = async () => {
    await fetch("/ops/api/logout", { method: "POST" });
    router.replace("/ops/login");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-hairline">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-6 px-6">
          <div className="flex items-center gap-8">
            <Link href="/ops" className="font-mono text-[13px] tracking-[0.18em] uppercase">
              IdemGate
            </Link>
            <nav className="flex items-center gap-5">
              {links.map((l) => {
                const on = pathname === l.href || (l.href !== "/ops" && pathname.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={on ? "text-body-sm text-ink" : "text-body-sm text-mute hover:text-ink"}
                  >
                    {l.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <button
            type="button"
            onClick={logout}
            className="text-body-sm text-mute transition-colors hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
