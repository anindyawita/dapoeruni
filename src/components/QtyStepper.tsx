import { useState } from "react";
import { QTY_MAX } from "../lib/cart";

interface Props {
  value: number;
  onChange: (n: number) => void;
  label: string;
  min?: number;
  small?: boolean;
}

/** Pemilih jumlah kotak: tombol − / + dan bisa diketik. */
export function QtyStepper({ value, onChange, label, min = 1, small = false }: Props) {
  // teks sementara hanya saat sedang diketik; selain itu tampilkan nilai asli
  const [draft, setDraft] = useState<string | null>(null);

  const commit = (raw: string) => {
    const n = parseInt(raw, 10);
    if (!Number.isNaN(n)) onChange(Math.min(QTY_MAX, Math.max(min, n)));
  };

  return (
    <div className={`qty${small ? " qty--sm" : ""}`} role="group" aria-label={label}>
      <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="Kurangi satu kotak">
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={QTY_MAX}
        value={draft ?? String(value)}
        aria-label={label}
        onFocus={() => setDraft(String(value))}
        onChange={(e) => {
          setDraft(e.target.value);
          commit(e.target.value);
        }}
        onBlur={() => setDraft(null)}
      />
      <button type="button" onClick={() => onChange(Math.min(QTY_MAX, value + 1))} disabled={value >= QTY_MAX} aria-label="Tambah satu kotak">
        +
      </button>
    </div>
  );
}
