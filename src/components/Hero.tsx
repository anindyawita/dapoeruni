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
  const yBox = useTransform(scrollYProgress, [0, 1], ["0%", "12%"]);
  const parallax = desktop && !reduce;
  const onAnchor = useAnchorClick();

  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: reduce ? fadeOnly : { duration: dur.base, ease, delay },
  });

  return (
    <section ref={ref} className="hero tiles" id="top">
      <h1 className="sr-only">
        {s.namaBrand}, katering rumahan halal {s.kota}
      </h1>

      <motion.img
        className="hero__tumpeng"
        src="/images/hero/tumpeng-900.webp"
        srcSet="/images/hero/tumpeng-300.webp 300w, /images/hero/tumpeng-480.webp 480w, /images/hero/tumpeng-900.webp 900w"
        sizes="(min-width: 768px) 470px, 230px"
        width={900}
        height={898}
        alt=""
        aria-hidden="true"
        decoding="async"
        {...fadeUp(0.25)}
      />

      <motion.div className="hero__boxwrap" style={parallax ? { y: yBox } : undefined}>
        <motion.img
          className="hero__box"
          src="/images/hero/box-1100.webp"
          srcSet="/images/hero/box-480.webp 480w, /images/hero/box-640.webp 640w, /images/hero/box-1100.webp 1100w"
          sizes="(min-width: 768px) 590px, 262px"
          width={1100}
          height={1500}
          alt="Nasi kotak kraft Dapoer Uni berisi nasi daun pisang, ayam bumbu, bihun, sambal, dan kering tempe"
          fetchPriority="high"
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={reduce ? fadeOnly : { duration: dur.slow, ease }}
        />
      </motion.div>

      <motion.img
        className="hero__bowl"
        src="/images/hero/bowl-536.webp"
        srcSet="/images/hero/bowl-300.webp 300w, /images/hero/bowl-536.webp 536w"
        sizes="(min-width: 768px) 330px, 170px"
        width={536}
        height={516}
        alt=""
        aria-hidden="true"
        decoding="async"
        {...fadeUp(0.35)}
      />

      <div className="hero__words" aria-hidden="true">
        <MaskWord text="Dapoer" className="w--dapoer" index={0} />
        <motion.span className="w w--kota" {...fadeUp(0.55)}>
          {s.hero.stiker}
        </motion.span>
        <MaskWord text="Uni" className="w--uni" index={1} />
      </div>

      <motion.div className="hero__foot" {...fadeUp(0.6)}>
        <p>{s.hero.subjudul}</p>
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
