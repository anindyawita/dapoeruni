import { motion, useReducedMotion } from "motion/react";
import { getSettings, type Tier } from "../data/source";
import { dur, ease } from "../lib/motion";

export type Filter = Tier | "semua";

interface Props {
  value: Filter;
  onChange: (f: Filter) => void;
}

export function TierFilter({ value, onChange }: Props) {
  const reduce = useReducedMotion();
  const opts: { id: Filter; label: string }[] = [
    { id: "semua", label: "Semua" },
    ...getSettings().tiers.map((t) => ({ id: t.id, label: t.nama })),
  ];
  return (
    <div className="filters" role="group" aria-label="Filter tingkat paket">
      {opts.map((o) => {
        const on = o.id === value;
        return (
          <button
            key={o.id}
            type="button"
            className={`fpill${on ? " is-on" : ""}`}
            aria-pressed={on}
            onClick={() => onChange(o.id)}
          >
            {on && (
              <motion.span
                layoutId="fpill-bg"
                className="fpill__bg"
                transition={reduce ? { duration: 0 } : { duration: dur.base, ease }}
              />
            )}
            <span className="fpill__label">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
