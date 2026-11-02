import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { getHargaMin, getSettings } from "../data/source";
import { formatRupiah } from "../lib/format";
import { useMediaQuery } from "../lib/smooth-scroll";
import { RevealGroup, RevealItem } from "./Reveal";

/** Tentang Kami: cerita besar + foto melengkung bertag + tiga nilai. */
export function About() {
  const s = getSettings();
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-5%", "5%"]);
  const hargaMin = getHargaMin();

  return (
    <section className="about" id="tentang">
      <div className="wrap about__in">
        <RevealGroup>
          <RevealItem>
            <p className="eyebrow eyebrow--bronze">{s.tentang.eyebrow}</p>
          </RevealItem>
          <RevealItem>
            <p className="story__big">{s.cerita}</p>
          </RevealItem>
          <RevealItem>
            <p className="story__big story__values">{s.nilai.join(". ")}.</p>
          </RevealItem>
        </RevealGroup>

        <RevealGroup className="story__media">
          <RevealItem>
            <div ref={ref} className="arch">
              <motion.img
                src="/images/story-890.webp"
                srcSet="/images/story-400.webp 400w, /images/story-680.webp 680w, /images/story-890.webp 890w"
                sizes="(min-width: 900px) 380px, 84vw"
                width={890}
                height={1096}
                alt="Nasi kotak kraft Dapoer Uni dibuka di halaman rumah"
                loading="lazy"
                decoding="async"
                style={desktop && !reduce ? { y } : undefined}
              />
            </div>
          </RevealItem>
          <div className="tags" aria-hidden="true">
            {s.nilai.map((n, i) => (
              <RevealItem key={n} className={`tag tag--${i + 1}`}>
                {n}
              </RevealItem>
            ))}
          </div>
        </RevealGroup>
      </div>

      <RevealGroup className="wrap values">
        {s.tentang.nilaiDetail.map((v, i) => (
          <RevealItem key={v.judul} className="value">
            <span className="value__no" aria-hidden="true">
              0{i + 1}
            </span>
            <h3>{v.judul}</h3>
            <p>{v.teks.replace("{hargaMin}", hargaMin ? formatRupiah(hargaMin) : "harga terjangkau")}</p>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
