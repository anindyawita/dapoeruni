/** Logo bulat Dapoer Uni (public/images/logo-240.webp, sudah dipotong lingkaran). */
export function Badge({ className }: { className?: string }) {
  return (
    <img
      src="/images/logo-240.webp"
      width={240}
      height={240}
      alt="Dapoer Uni"
      className={className}
      decoding="async"
    />
  );
}
