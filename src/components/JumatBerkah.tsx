import { getSettings } from "../data/source";
import { external, waJumatBerkah } from "../lib/whatsapp";
import { WhatsAppIcon } from "./icons";
import { RevealGroup, RevealItem } from "./Reveal";

export function JumatBerkah() {
  const s = getSettings();
  const jb = s.jumatBerkah;
  return (
    <section className="jb" id="jumat-berkah">
      <div className="wrap jb__in">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow">{jb.eyebrow}</p>
          </RevealItem>
          <RevealItem>
            <h2 className="h-display h-display--cream">{jb.judul}</h2>
          </RevealItem>
          {jb.paragraf.map((p) => (
            <RevealItem key={p}>
              <p className="jb__body">{p}</p>
            </RevealItem>
          ))}
          <RevealItem className="jb__cta">
            <a className="pill pill--gold" href={waJumatBerkah()} {...external}>
              <WhatsAppIcon />
              Pesan Jumat Berkah
            </a>
          </RevealItem>
        </RevealGroup>
        <RevealGroup className="jb__media">
          <RevealItem>
            <div className="circle circle--photo">
              <img
                src="/images/jumat-berkah-1000.webp"
                srcSet="/images/jumat-berkah-400.webp 400w, /images/jumat-berkah-680.webp 680w, /images/jumat-berkah-1000.webp 1000w"
                sizes="(min-width: 900px) 470px, 330px"
                width={1000}
                height={1000}
                alt="Deretan mangkuk nasi berisi tahu, abon, timun, dan sambal"
                loading="lazy"
                decoding="async"
              />
            </div>
          </RevealItem>
          <RevealItem className="blobst">
            <span>
              {jb.stiker.map((w, i) => (
                <span key={w}>
                  {w}
                  {i < jb.stiker.length - 1 && <br />}
                </span>
              ))}
            </span>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
