import { motion, useReducedMotion } from "motion/react";
import { getSettings } from "../data/source";
import { container, reveal, revealReduced, viewportOnce } from "../lib/motion";
import { external, waUmum } from "../lib/whatsapp";
import { Burst, WhatsAppIcon } from "./icons";
import { RevealGroup, RevealItem } from "./Reveal";

/** Cara Order (4 langkah) + kartu ketentuan order. */
export function OrderInfo() {
  const s = getSettings();
  const reduce = useReducedMotion();
  return (
    <section className="order" id="cara-order" aria-labelledby="order-judul">
      <div className="wrap">
        <RevealGroup className="center">
          <RevealItem>
            <h2 id="order-judul" className="h-display">
              <span className="burst">
                <Burst />
                Cara
              </span>{" "}
              Order
            </h2>
          </RevealItem>
          <RevealItem>
            <p className="lead">{s.caraOrderIntro}</p>
          </RevealItem>
        </RevealGroup>

        <motion.ol className="steps" variants={container} initial="hidden" whileInView="show" viewport={viewportOnce}>
          {s.langkahOrder.map((l, i) => (
            <motion.li key={l.judul} variants={reduce ? revealReduced : reveal}>
              <span className="num" aria-hidden="true">
                {i + 1}
              </span>
              <h3>{l.judul}</h3>
              <p>{l.teks}</p>
            </motion.li>
          ))}
        </motion.ol>

        <RevealGroup className="rules">
          <RevealItem className="rules__side">
            <h3>Ketentuan order</h3>
            <p>{s.ketentuanIntro}</p>
            <a className="pill pill--gold pill--sm" href={waUmum()} {...external}>
              <WhatsAppIcon />
              Tanya via WA
            </a>
          </RevealItem>
          <RevealItem>
            <dl>
              {s.ketentuan.map((k) => (
                <div key={k.judul}>
                  <dt>{k.judul}</dt>
                  <dd>{k.isi}</dd>
                </div>
              ))}
            </dl>
          </RevealItem>
        </RevealGroup>
      </div>
    </section>
  );
}
