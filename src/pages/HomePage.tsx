import { About } from "../components/About";
import { ClosingCTA } from "../components/ClosingCTA";
import { FloatingWA } from "../components/FloatingWA";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { Hero } from "../components/Hero";
import { InstagramStrip } from "../components/InstagramStrip";
import { JumatBerkah } from "../components/JumatBerkah";
import { PaketTeaser } from "../components/PaketTeaser";
import { Testimonials } from "../components/Testimonials";

/** Beranda (landing page). Katalog lengkap ada di /menu. */
export function HomePage() {
  return (
    <>
      <Header page="home" />
      <main>
        <Hero />
        <PaketTeaser />
        <About />
        <JumatBerkah />
        <Testimonials />
        <InstagramStrip />
        <ClosingCTA />
      </main>
      <Footer />
      <FloatingWA />
    </>
  );
}
