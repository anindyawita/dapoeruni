import { getSettings, getTierSummaries } from "../data/source";
import { formatRentang } from "../lib/format";
import { useAnchorClick } from "../lib/smooth-scroll";
import { CustomPackage } from "./CustomPackage";
import { ArrowIcon, Burst } from "./icons";
import { RevealGroup, RevealItem } from "./Reveal";

/** Ukuran file cut-out di public/images/paket: [lebar besar, tinggi versi 480]. */
const fotoSize: Record<string, [number, number]> = {
  hemat: [820, 526],
  rakyat: [536, 462],
  juragan: [830, 634],
  sultan: [780, 672],
};

/** Beranda: 4 tingkat paket (gaya "Signature" di referensi) + Paket Custom. */
export function PaketTeaser() {
  const s = getSettings();
  const tiers = getTierSummaries();
  const onAnchor = useAnchorClick();

  return (
    <section className="paket" id="paket">
      <div className="wrap">
        <RevealGroup className="center">
          <RevealItem>
            <div className="headdeco">
              <img
                className="headdeco__nk"
                src="/images/deco/nasi-kuning-240.webp"
                width={240}
                height={243}
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
              />
              <h2 className="h-display">{s.paket.judul}</h2>
              <Burst className="headdeco__burst" />
            </div>
          </RevealItem>
          <RevealItem>
            <p className="lead">{s.paket.intro}</p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="paket-grid">
          {tiers.map((t) => {
            const harga = formatRentang(t.min, t.max);
            const [besar, tinggi] = fotoSize[t.foto] ?? [480, 480];
            return (
              <RevealItem key={t.id}>
                <a className="pk" href={`/menu#menu-${t.id}`} onClick={onAnchor}>
                  <div className="pk__media">
                    <div className="circle circle--tiles">
                      <img
                        className={t.fotoBulat ? "is-bowl" : undefined}
                        src={`/images/paket/${t.foto}-480.webp`}
                        srcSet={`/images/paket/${t.foto}-320.webp 320w, /images/paket/${t.foto}-480.webp 480w, /images/paket/${t.foto}-${besar}.webp ${besar}w`}
                        sizes="(min-width: 768px) 360px, 40vw"
                        width={480}
                        height={tinggi}
                        alt={t.fotoAlt}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <span className="lbl">
                      Paket {t.nama}
                      {harga && <span className="lbl__p"> · {harga}</span>}
                    </span>
                  </div>
                  {harga && (
                    <p className="pk__price">
                      {harga}
                      <small> / kotak</small>
                    </p>
                  )}
                  <p className="pk__desc">{t.deskripsi}</p>
                </a>
              </RevealItem>
            );
          })}
        </RevealGroup>

        <RevealGroup className="center paket__cta">
          <RevealItem>
            <a className="pill pill--gold" href="/menu" onClick={onAnchor}>
              Lihat semua menu <ArrowIcon />
            </a>
          </RevealItem>
        </RevealGroup>

        <CustomPackage />
      </div>
    </section>
  );
}
