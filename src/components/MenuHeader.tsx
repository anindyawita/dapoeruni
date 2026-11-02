import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { getSettings } from "../data/source";
import { dur, ease, fadeOnly, stagger } from "../lib/motion";
import { Brush } from "./icons";

function Mask({ children, index, className = "" }: { children: ReactNode; index: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <span className={`mask ${className}`}>
      <motion.span
        initial={{ y: "110%" }}
        animate={{ y: "0%" }}
        transition={reduce ? fadeOnly : { duration: dur.slow, ease, delay: 0.12 + index * stagger }}
      >
        {children}
      </motion.span>
    </span>
  );
}

/** Header gelap halaman Menu dengan kata raksasa terpotong di bawah (seperti "Our Menu"). */
export function MenuHeader() {
  return (
    <section className="mhead" id="top">
      <svg className="mhead__art" viewBox="0 0 200 140" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
          <path d="M28 96 A72 64 0 0 1 172 96" />
          <path d="M8 110 H192" />
          <path d="M58 70 A44 38 0 0 1 92 44" />
          <circle cx="100" cy="22" r="8" />
        </g>
      </svg>
      <h1 className="mhead__word">
        <Mask index={0}>Menu</Mask> <Mask index={1} className="mhead__kami">Kami</Mask>
      </h1>
    </section>
  );
}

export function MenuIntro() {
  const s = getSettings();
  const [first, ...rest] = s.menuPage.judul.split(" ");
  return (
    // di layar pertama: animasi CSS saja, tidak menunggu JavaScript (LCP lebih cepat)
    <section className="menu-intro" aria-labelledby="menu-judul">
      <div className="wrap center">
        <h2 id="menu-judul" className="h-display css-in">
          {first}{" "}
          <span className="brushword">
            <Brush />
            {rest.join(" ")}
          </span>
        </h2>
        <p className="lead css-in css-in--2">{s.menuPage.intro}</p>
      </div>
    </section>
  );
}
