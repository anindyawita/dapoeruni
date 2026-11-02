import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useEffect, useState } from "react";
import { dur, ease } from "../lib/motion";
import { external, waUmum } from "../lib/whatsapp";
import { useCart } from "../lib/cart";
import { WhatsAppIcon } from "./icons";

/**
 * Tombol WA mengambang (HP saja, disembunyikan di desktop lewat CSS).
 * Muncul setelah hero terlewati; sembunyi saat katalog terlihat (supaya tidak
 * menutupi tombol kartu) dan saat bar keranjang tampil.
 */
export function FloatingWA() {
  const { scrollY } = useScroll();
  const reduce = useReducedMotion();
  const [past, setPast] = useState(false);
  const [overCatalog, setOverCatalog] = useState(false);
  const { lines } = useCart();

  useMotionValueEvent(scrollY, "change", (y) => setPast(y > window.innerHeight * 0.75));

  useEffect(() => {
    const el = document.getElementById("katalog");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setOverCatalog(e.isIntersecting), {
      rootMargin: "0px 0px -15% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <AnimatePresence>
      {past && !overCatalog && lines.length === 0 && (
        <motion.a
          className="fab"
          href={waUmum()}
          {...external}
          aria-label="Chat WhatsApp Dapoer Uni"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.9 }}
          transition={{ duration: reduce ? 0.2 : dur.fast, ease }}
          whileTap={{ scale: 0.96 }}
        >
          <WhatsAppIcon />
        </motion.a>
      )}
    </AnimatePresence>
  );
}
