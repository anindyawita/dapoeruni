import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";
import { getSettings } from "../data/source";
import { dur, ease, fadeOnly, stagger } from "../lib/motion";
import { useAnchorClick, useMediaQuery } from "../lib/smooth-scroll";
import { external, waUmum } from "../lib/whatsapp";
import { WhatsAppIcon } from "./icons";

/** Kata judul yang naik dari balik garis (efek masking). */
function MaskWord({ text, className, index }: { text: string; className: string; index: number }) {
  const reduce = useReducedMotion();
  return (
    <span className={`w ${className} mask`}>
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={reduce ? fadeOnly : { duration: dur.slow, ease, delay: 0.12 + index * stagger }}
      >
        {text}
      </motion.span>
    </span>
  );
}

export function Hero() {
  const s = getSettings();
  const reduce = useReducedMotion();
  const desktop = useMediaQuery("(min-width: 768px)");
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // parallax berlapis: yang paling depan bergerak sedikit lebih jauh
  const yTumpeng = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const yBox = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);
  const yBowl = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);
  const parallax = desktop && !reduce;
  const onAnchor = useAnchorClick();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? fadeOnly : { duration: dur.base, ease, delay },
  });
  // foto hero langsung terlihat sejak HTML tampil (bagus untuk LCP); masuknya cukup "mengendap"
  const settle = (delay: number) => ({
    initial: { scale: 1.06, y: 14 },
    animate: { scale: 1, y: 0 },
    transition: reduce ? fadeOnly : { duration: dur.slow, ease, delay },
  });

  // subjudul boleh berisi " · ": dua baris di desktop, satu baris di HP
  const [sub1, ...subRest] = s.hero.subjudul.split(" · ");

  return (
    <section ref={ref} className="hero" id="top">
      <h1 className="sr-only">
        {s.namaBrand}, katering halal {s.kota}
      </h1>

      <motion.div className="hero__item hero__item--tumpeng" style={parallax ? { y: yTumpeng } : undefined}>
        <motion.img
          src="/images/hero/tumpeng-1100.webp"
          srcSet="/images/hero/tumpeng-320.webp 320w, /images/hero/tumpeng-600.webp 600w, /images/hero/tumpeng-1100.webp 1100w"
          sizes="(min-width: 768px) 540px, 300px"
          width={1100}
          height={872}
          alt="Tumpeng nasi kuning Dapoer Uni dengan mie, ayam, dan hiasan bunga sayur"
          fetchPriority="high"
          {...settle(0.08)}
        />
      </motion.div>

      <motion.div className="hero__item hero__item--box" style={parallax ? { y: yBox } : undefined}>
        <motion.img
          src="/images/hero/box-1200.webp"
          srcSet="/images/hero/box-360.webp 360w, /images/hero/box-640.webp 640w, /images/hero/box-1200.webp 1200w"
          sizes="(min-width: 768px) 580px, 290px"
          width={1200}
          height={1469}
          alt="Nasi kotak kraft Dapoer Uni berisi nasi daun pisang, ayam, timun, bihun, sambal, dan kering tempe"
          fetchPriority="high"
          {...settle(0)}
        />
      </motion.div>

      <motion.div className="hero__item hero__item--bowl" style={parallax ? { y: yBowl } : undefined}>
        <motion.img
          src="/images/hero/bowl-800.webp"
          srcSet="/images/hero/bowl-240.webp 240w, /images/hero/bowl-420.webp 420w, /images/hero/bowl-800.webp 800w"
          sizes="(min-width: 768px) 400px, 195px"
          width={800}
          height={753}
          alt=""
          aria-hidden="true"
          {...settle(0.16)}
        />
      </motion.div>

      <div className="hero__words" aria-hidden="true">
        <MaskWord text="Dapoer" className="w--dapoer" index={0} />
        <MaskWord text="Uni" className="w--uni" index={1} />
      </div>

      <motion.div className="hero__foot" {...fadeUp(0.6)}>
        <p>
          <span>{sub1}</span>
          {subRest.length > 0 && (
            <>
              <span className="sep"> · </span>
              <span>{subRest.join(" · ")}</span>
            </>
          )}
        </p>
        <div className="hero__btns">
          <a className="pill" href="/menu" onClick={onAnchor}>
            Lihat Menu
          </a>
          <a className="pill pill--gold" href={waUmum()} {...external}>
            <WhatsAppIcon />
            Chat WA
          </a>
        </div>
      </motion.div>
    </section>
  );
}
