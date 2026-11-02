import { getSettings } from "../data/source";
import { useAnchorClick } from "../lib/smooth-scroll";
import { external, waUmum } from "../lib/whatsapp";
import { WhatsAppIcon } from "./icons";
import { RevealGroup, RevealItem } from "./Reveal";

/** Penutup landing page: ajakan pesan sebelum footer. */
export function ClosingCTA() {
  const s = getSettings();
  const onAnchor = useAnchorClick();
  return (
    <section className="closing" aria-labelledby="closing-judul">
      <div className="wrap">
        <RevealGroup className="closing__in">
          <div className="closing__text">
            <RevealItem>
              <h2 id="closing-judul" className="closing__title">
                {s.penutup.judul}
              </h2>
            </RevealItem>
            <RevealItem>
              <p className="closing__body">{s.penutup.teks}</p>
            </RevealItem>
            <RevealItem className="closing__btns">
              <a className="pill pill--dark" href={waUmum()} {...external}>
                <WhatsAppIcon />
                Chat WhatsApp
              </a>
              <a className="pill" href="/menu" onClick={onAnchor}>
                Lihat Menu
              </a>
            </RevealItem>
          </div>
          <RevealItem className="closing__media">
            <img
              src="/images/paket/sultan-480.webp"
              srcSet="/images/paket/sultan-320.webp 320w, /images/paket/sultan-480.webp 480w, /images/paket/sultan-780.webp 780w"
              sizes="(min-width: 768px) 240px, 150px"
              width={480}
              height={672}
              alt=""
              aria-hidden="true"
              loading="lazy"
              decoding="async"
            />
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
