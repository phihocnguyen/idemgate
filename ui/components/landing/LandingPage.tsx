import { Nav } from "./Nav";
import { Hero } from "./Hero";
import { LogoStrip } from "./LogoStrip";
import { Problem } from "./Problem";
import { Product } from "./Product";
import { Comparison } from "./Comparison";
import { Features } from "./Features";
import { Dashboard } from "./Dashboard";
import { Terminal } from "./Terminal";
import { CTA } from "./CTA";
import { Footer } from "./Footer";

/** Server shell that composes client islands. */
export function LandingPage() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <LogoStrip />
        <Problem />
        <Product />
        <Comparison />
        <Features />
        <Dashboard />
        <Terminal />
        <CTA />
      </main>
      <Footer />
    </>
  );
}
