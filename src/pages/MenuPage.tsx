import { FloatingWA } from "../components/FloatingWA";
import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import { MenuGrid } from "../components/MenuGrid";
import { MenuHeader, MenuIntro } from "../components/MenuHeader";
import { OrderInfo } from "../components/OrderInfo";

/** Halaman katalog lengkap + cara order. */
export function MenuPage() {
  return (
    <>
      <Header page="menu" />
      <main>
        <MenuHeader />
        <MenuIntro />
        <MenuGrid />
        <OrderInfo />
      </main>
      <Footer />
      <FloatingWA />
    </>
  );
}
