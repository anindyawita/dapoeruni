import { useId } from "react";

interface Props {
  className?: string;
  /** "solid" = lingkaran espresso (header), "line" = garis saja (footer) */
  variant?: "solid" | "line";
}

/**
 * Logo bulat sementara, digambar ulang dari label "Dapoer Uni" (ikon tudung saji emas).
 * Ganti dengan file logo asli bila sudah ada.
 */
export function Badge({ className, variant = "solid" }: Props) {
  const id = useId().replace(/:/g, "");
  const top = `rt-${id}`;
  const bot = `rb-${id}`;
  return (
    <svg viewBox="0 0 120 120" className={className} role="img" aria-label="Dapoer Uni">
      <defs>
        <path id={top} d="M 60 60 m -44 0 a 44 44 0 1 1 88 0" />
        <path id={bot} d="M 60 60 m -51 0 a 51 51 0 0 0 102 0" />
      </defs>
      <circle
        cx="60"
        cy="60"
        r="58.75"
        fill={variant === "solid" ? "#29231E" : "none"}
        stroke="#F5EEE0"
        strokeWidth="1.5"
      />
      <circle cx="60" cy="60" r="37" fill="none" stroke="#E9B965" strokeWidth="1.2" />
      <text fontFamily="Bricolage Grotesque Variable, sans-serif" fontWeight="700" fontSize="12" letterSpacing="2.6" fill="#F5EEE0">
        <textPath href={`#${top}`} startOffset="50%" textAnchor="middle">
          DAPOER UNI
        </textPath>
      </text>
      <text fontFamily="Bricolage Grotesque Variable, sans-serif" fontWeight="600" fontSize="7.6" letterSpacing="1.5" fill="#F5EEE0">
        <textPath href={`#${bot}`} startOffset="50%" textAnchor="middle">
          KATERING RUMAHAN · SURABAYA
        </textPath>
      </text>
      <g transform="translate(60 64)" fill="none" stroke="#E9B965" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M-19 4 A19 17 0 0 1 19 4" />
        <path d="M-25 8.5 H25" />
        <path d="M-10 -5 A11 9 0 0 1 -1 -9.5" strokeWidth="2" />
        <circle cx="0" cy="-16.5" r="2.8" fill="#E9B965" stroke="none" />
      </g>
    </svg>
  );
}
