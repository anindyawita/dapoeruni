import { motion, useReducedMotion } from "motion/react";
import { getSettings } from "../data/source";
import { reveal, revealReduced, viewportOnce } from "../lib/motion";
import { external, waCustom } from "../lib/whatsapp";
import { WhatsAppIcon } from "./icons";

/** Banner Paket Custom: pelanggan kirim budget, Dapoer Uni bantu sesuaikan. */
export function CustomPackage({ compact = false }: { compact?: boolean }) {
  const s = getSettings();
  const reduce = useReducedMotion();
  // "Atur budget sendiri? Bisa dong." → baris tanya + baris jawab (warna emas)
  const [tanya, jawab] = s.custom.judul.includes("? ") ? s.custom.judul.split("? ") : [null, null];
  return (
    <motion.aside
      className={`custom${compact ? " custom--compact" : ""}`}
      aria-labelledby="custom-judul"
      variants={reduce ? revealReduced : reveal}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      <div className="custom__text">
        <p className="eyebrow">{s.custom.eyebrow}</p>
        <h2 id="custom-judul" className="custom__title">
          {tanya ? (
            <>
              {tanya}?<br />
              <em>{jawab}</em>
            </>
          ) : (
            s.custom.judul
          )}
        </h2>
        <p className="custom__body">{s.custom.teks}</p>
        <a className="pill pill--gold" href={waCustom()} {...external}>
          <WhatsAppIcon />
          {s.custom.tombol}
        </a>
      </div>
      <div className="custom__media" aria-hidden="true">
        <img
          src="/images/custom-box-480.webp"
          srcSet="/images/custom-box-320.webp 320w, /images/custom-box-480.webp 480w, /images/custom-box-820.webp 820w"
          sizes="(min-width: 768px) 270px, 160px"
          width={480}
          height={711}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </div>
    </motion.aside>
  );
}
