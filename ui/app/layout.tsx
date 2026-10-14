import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
export const metadata: Metadata = {
  title: "IdemGate Dashboard",
  description: "Inspect idempotency operations and runtime settings",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main>
          <nav className="nav">
            <Link href="/" className="brand">
              IdemGate
            </Link>
            <Link href="/">Operations</Link>
            <Link href="/settings">Settings</Link>
          </nav>
          {children}
        </main>
      </body>
    </html>
  );
}
