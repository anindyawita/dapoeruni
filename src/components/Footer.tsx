import { getSettings } from "../data/source";
import { useAnchorClick } from "../lib/smooth-scroll";
import { external, igUrl, waUmum } from "../lib/whatsapp";
import { Badge } from "./Badge";
import { BoxIcon, ClockIcon, InstagramIcon, PinIcon, WhatsAppIcon } from "./icons";
import { RevealGroup, RevealItem } from "./Reveal";

const infoIcons = [PinIcon, ClockIcon, BoxIcon];
const TAHUN = new Date().getFullYear();

export function Footer() {
  const s = getSettings();
  const onAnchor = useAnchorClick();
  return (
    <footer className="ftr" id="kontak">
      <RevealGroup className="wrap">
        <RevealItem className="ftr__top">
          <a href="/" onClick={onAnchor} aria-label="Dapoer Uni, ke beranda" className="hdr__badge">
            <Badge className="ftr__badge" />
          </a>
          <nav className="ftr__nav" aria-label="Navigasi footer">
            <a href="/menu" onClick={onAnchor}>Menu</a>
            <a href="/#tentang" onClick={onAnchor}>Tentang</a>
            <a href="/menu#cara-order" onClick={onAnchor}>Cara Order</a>
            <a href="/#jumat-berkah" onClick={onAnchor}>Jumat Berkah</a>
          </nav>
          <ul className="ftr__info">
            {s.footerInfo.map((t, i) => {
              const Icon = infoIcons[i] ?? BoxIcon;
              return (
                <li key={t}>
                  <Icon />
                  {t}
                </li>
              );
            })}
          </ul>
        </RevealItem>
        <RevealItem className="ftr__cta">
          <a className="pill pill--gold" href={waUmum()} {...external}>
            <WhatsAppIcon />
            Chat WhatsApp
          </a>
          <a className="pill pill--ghost" href={igUrl()} {...external}>
            <InstagramIcon />@{s.instagram}
          </a>
        </RevealItem>
        <RevealItem>
          <p className="ftr__word" aria-hidden="true">
            Dapoer <em>Uni</em>
          </p>
        </RevealItem>
        <div className="ftr__bottom">
          <span suppressHydrationWarning>
            © {TAHUN} {s.namaBrand} · Katering untuk semua acara kamu
          </span>
          <a href="#top" onClick={onAnchor}>
            Kembali ke atas ↑
          </a>
        </div>
      </RevealGroup>
    </footer>
  );
}
