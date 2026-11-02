import { getSettings } from "../data/source";
import { RevealGroup, RevealItem } from "./Reveal";

const PLACEHOLDER = { teks: "[testimoni asli pelanggan, dengan izin]", nama: "[nama pelanggan · acara]" };

/**
 * Testimoni berjalan dari kanan ke kiri, berhenti saat di-hover.
 * Selama `settings.testimoni` kosong, yang tampil kartu placeholder (bukan testimoni karangan).
 */
export function Testimonials() {
  const s = getSettings();
  const real = s.testimoni.length > 0;
  const items = real ? s.testimoni : Array.from({ length: 4 }, () => PLACEHOLDER);

  const set = (dupe: boolean) => (
    <div className="marquee__set" aria-hidden={dupe || undefined}>
      {items.map((t, i) => (
        <figure key={i} className={`tcard${real ? "" : " tcard--ph"}`}>
          <span className="tcard__q" aria-hidden="true">
            “
          </span>
          <blockquote>{t.teks}</blockquote>
          <figcaption>{t.nama}</figcaption>
        </figure>
      ))}
    </div>
  );

  return (
    <section className="testi" id="testimoni" aria-labelledby="testi-judul">
      <RevealGroup className="wrap center">
        <RevealItem>
          <p className="eyebrow eyebrow--bronze">Testimoni</p>
        </RevealItem>
        <RevealItem>
          <h2 id="testi-judul" className="h-display">
            Kata Pelanggan
          </h2>
        </RevealItem>
      </RevealGroup>
      <div className="marquee">
        <div className="marquee__track">
          {set(false)}
          {set(true)}
        </div>
      </div>
    </section>
  );
}
