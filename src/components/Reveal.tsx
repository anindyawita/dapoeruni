import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";
import { container, reveal, revealReduced, viewportOnce } from "../lib/motion";

interface Props {
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Pembungkus: memicu reveal anak-anaknya (ber-stagger) saat masuk viewport. */
export function RevealGroup({ children, className, id }: Props) {
  return (
    <motion.div
      id={id}
      className={className}
      variants={container}
      initial="hidden"
      whileInView="show"
      viewport={viewportOnce}
    >
      {children}
    </motion.div>
  );
}

/** Satu elemen yang fade-up. Harus berada di dalam RevealGroup. */
export function RevealItem({ children, className, id }: Props) {
  const reduce = useReducedMotion();
  return (
    <motion.div id={id} className={className} variants={reduce ? revealReduced : reveal}>
      {children}
    </motion.div>
  );
}
