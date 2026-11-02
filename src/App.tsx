import { MotionConfig } from "motion/react";
import { useEffect, type ReactNode } from "react";
import { CartBar } from "./components/CartBar";
import { CartDrawer } from "./components/CartDrawer";
import { CartProvider } from "./components/CartProvider";
import { MenuDetail } from "./components/MenuDetail";
import { SmoothScroll } from "./components/SmoothScroll";
import { useSmoothScroll } from "./lib/smooth-scroll";

/** Datang dari halaman lain dengan hash (mis. /#jumat-berkah, /menu#menu-juragan): gulir halus ke sana. */
function InitialHash() {
  const { scrollTo } = useSmoothScroll();
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash || hash === "#top") return;
    const id = /^#menu-(hemat|rakyat|juragan|sultan)$/.test(hash) ? "katalog" : decodeURIComponent(hash.slice(1));
    const t = window.setTimeout(() => {
      const el = document.getElementById(id);
      if (el) scrollTo(el);
    }, 450);
    return () => window.clearTimeout(t);
  }, [scrollTo]);
  return null;
}

export function App({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <CartProvider>
          <InitialHash />
          {children}
          <MenuDetail />
          <CartDrawer />
          <CartBar />
        </CartProvider>
      </SmoothScroll>
    </MotionConfig>
  );
}
