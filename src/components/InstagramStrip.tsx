import { getSettings } from "../data/source";
import { external, igUrl } from "../lib/whatsapp";
import { RevealGroup, RevealItem } from "./Reveal";

/** Kolase foto melengkung menuju akun IG (reveal ber-stagger, tanpa marquee). */
export function InstagramStrip() {
  const s = getSettings();
  return (
    <section className="ig" aria-labelledby="ig-judul">
      <RevealGroup className="wrap center">
        <RevealItem>
          <p className="ig__kick">Ikuti kami di Instagram</p>
        </RevealItem>
        <RevealItem>
          <a id="ig-judul" className="ig__handle" href={igUrl()} {...external}>
            @{s.instagram}
          </a>
        </RevealItem>
      </RevealGroup>
      <RevealGroup className="wrap collage">
        {s.instagramFoto.map((f, i) => (
          <RevealItem key={f.src} className={`ic ic--${i + 1}`}>
            <a href={igUrl()} {...external}>
              <img src={f.src} alt={f.alt} width={600} height={720} loading="lazy" decoding="async" />
            </a>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
