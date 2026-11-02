import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useFocusTrap } from "../lib/focus-trap";
import { container, dur, ease, reveal, revealReduced } from "../lib/motion";
import { useAnchorClick, useSmoothScroll } from "../lib/smooth-scroll";
import { external, igUrl, waUmum } from "../lib/whatsapp";
import { getSettings } from "../data/source";
import { Badge } from "./Badge";
import { CloseIcon, InstagramIcon, WhatsAppIcon } from "./icons";

export type PageId = "home" | "menu";

interface NavLink {
  href: string;
  label: string;
  page?: PageId;
}

const desktopLinks: NavLink[] = [
  { href: "/menu", label: "Menu", page: "menu" },
  { href: "/#tentang", label: "Tentang" },
  { href: "/#jumat-berkah", label: "Jumat Berkah" },
  { href: "#kontak", label: "Kontak" },
];

const mobileLinks: NavLink[] = [
  { href: "/", label: "Beranda", page: "home" },
  { href: "/menu", label: "Menu", page: "menu" },
  { href: "/#tentang", label: "Tentang Kami" },
  { href: "/menu#cara-order", label: "Cara Order" },
  { href: "/#jumat-berkah", label: "Jumat Berkah" },
  { href: "#kontak", label: "Kontak" },
];

export function Header({ page }: { page: PageId }) {
  const { scrollY } = useScroll();
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { lock } = useSmoothScroll();
  const reduce = useReducedMotion();
  const menuBtn = useRef<HTMLButtonElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLDivElement>(null);
  useFocusTrap(navRef, open);

  const close = useCallback(() => setOpen(false), []);
  const onAnchor = useAnchorClick(close);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setScrolled(y > 40);
    if (y > prev && y > 180) setHidden(true);
    else if (y < prev - 2 || y < 180) setHidden(false);
  });

  const wasOpen = useRef(false);
  useEffect(() => {
    lock("menu-hp", open);
    if (open) {
      wasOpen.current = true;
      closeBtn.current?.focus();
      const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (wasOpen.current) {
      wasOpen.current = false;
      menuBtn.current?.focus({ preventScroll: true });
    }
  }, [open, lock]);

  const s = getSettings();

  return (
    <>
      <motion.header
        className={`hdr${scrolled ? " is-scrolled" : ""}`}
        animate={{ y: hidden && !open ? "-140%" : "0%" }}
        transition={{ duration: reduce ? 0 : dur.fast, ease }}
      >
        <div className="wrap hdr__in">
          <a href="/" className="hdr__badge" aria-label="Dapoer Uni, ke beranda" onClick={onAnchor}>
            <Badge className="badge" />
          </a>
          <nav className="nav" aria-label="Navigasi utama">
            {desktopLinks.map((l) => {
              const active = l.page === page;
              return (
                <a
                  key={l.href}
                  className={`pill${active ? " pill--dark" : ""}`}
                  href={l.href}
                  onClick={onAnchor}
                  aria-current={active ? "page" : undefined}
                >
                  {l.label}
                </a>
              );
            })}
            <a className="pill pill--gold" href={waUmum()} {...external}>
              <WhatsAppIcon />
              Chat WA
            </a>
          </nav>
          <button
            ref={menuBtn}
            type="button"
            className="pill nav-m"
            aria-expanded={open}
            aria-controls="menu-hp"
            onClick={() => setOpen(true)}
          >
            Menu
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={navRef}
            id="menu-hp"
            className="mnav"
            role="dialog"
            aria-modal="true"
            aria-label="Navigasi"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0.2 : dur.fast, ease }}
            data-lenis-prevent
          >
            <button ref={closeBtn} type="button" className="pill mnav__close" onClick={close}>
              <CloseIcon />
              Tutup
            </button>
            <motion.ul variants={container} initial="hidden" animate="show">
              {mobileLinks.map((l) => (
                <motion.li key={l.href} variants={reduce ? revealReduced : reveal}>
                  <a href={l.href} onClick={onAnchor} aria-current={l.page === page ? "page" : undefined}>
                    {l.label}
                  </a>
                </motion.li>
              ))}
            </motion.ul>
            <div className="mnav__cta">
              <a className="pill pill--gold" href={waUmum()} {...external}>
                <WhatsAppIcon />
                Chat WhatsApp
              </a>
              <a className="pill pill--ghost" href={igUrl()} {...external}>
                <InstagramIcon />@{s.instagram}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
