import { motion, useReducedMotion } from "motion/react";
import { getTierInfo, type MenuItem } from "../data/source";
import { useCart } from "../lib/cart";
import { formatRupiah, inisial } from "../lib/format";
import { dur, ease, reveal, revealReduced } from "../lib/motion";
import { ArrowIcon, BasketIcon, CheckIcon } from "./icons";

export function MenuCard({ item }: { item: MenuItem }) {
  const tier = getTierInfo(item.tier);
  const reduce = useReducedMotion();
  const { lines, upsert, setDetail, setDrawerOpen } = useCart();
  const inCart = lines.find((l) => l.id === item.id);

  return (
    <motion.article
      layout={reduce ? false : "position"}
      className="card"
      variants={reduce ? revealReduced : reveal}
      transition={{ layout: { duration: dur.base, ease } }}
    >
      <div className="card__ph">
        <div className={`circle ${item.foto ? "circle--photo" : "circle--tiles"}`}>
          {item.foto ? (
            <img
              src={`/images/menu/${item.foto}-400.webp`}
              width={400}
              height={400}
              alt={`${item.nama}, Paket ${tier.nama}`}
              loading="lazy"
              decoding="async"
            />
          ) : (
            <span className="ini" role="img" aria-label={`Foto ${item.nama} menyusul`}>
              {inisial(item.nama)}
              <small>Foto menyusul</small>
            </span>
          )}
        </div>
        <span className={`ttag ttag--${item.tier}`}>{tier.nama}</span>
      </div>

      <div className="card__body">
        <h4 className="card__name">
          {/* tombol ini "membentang" menutupi kartu: klik di mana saja membuka detail */}
          <button type="button" className="card__link" onClick={() => setDetail(item)} aria-haspopup="dialog">
            {item.nama}
          </button>
        </h4>
        {item.label && <p className="card__note">{item.label}</p>}
        <ul className="chips" aria-label={`Isi ${item.nama}`}>
          {item.isi.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
        <span className="card__more" aria-hidden="true">
          Lihat detail <ArrowIcon />
        </span>
      </div>

      <div className="card__foot">
        {item.harga !== null ? (
          <p className="price">
            {formatRupiah(item.harga)}
            {item.harga20plus !== undefined && <small>{item.minimalOrder}–19 kotak</small>}
          </p>
        ) : (
          <p className="price price--soon">Harga menyusul</p>
        )}
        {item.harga20plus !== undefined && (
          <p className="price20">{formatRupiah(item.harga20plus)} untuk 20+ kotak</p>
        )}
        <p className="min">Min. {item.minimalOrder} kotak</p>
        {inCart ? (
          <button type="button" className="pill pill--dark pill--sm pill--block card__btn" onClick={() => setDrawerOpen(true)}>
            <CheckIcon />
            Di keranjang · {inCart.qty} kotak
          </button>
        ) : (
          <button
            type="button"
            className="pill pill--gold pill--sm pill--block card__btn"
            onClick={() => upsert(item.id, item.minimalOrder)}
          >
            <BasketIcon />
            Masukkan keranjang
          </button>
        )}
      </div>
    </motion.article>
  );
}
