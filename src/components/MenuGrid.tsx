import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useCallback, useSyncExternalStore, type Ref } from "react";
import { getMenu, getSettings, getTierInfo, TIER_ORDER, type MenuItem, type Tier } from "../data/source";
import { formatRupiah } from "../lib/format";
import { container, dur, ease } from "../lib/motion";
import { CustomPackage } from "./CustomPackage";
import { MenuCard } from "./MenuCard";
import { TierFilter, type Filter } from "./TierFilter";

const HASH = /^#menu-(hemat|rakyat|juragan|sultan)$/;

// hash URL sebagai "external store": aman untuk prerender (server = tanpa hash)
const hashListeners = new Set<() => void>();
function subscribeHash(cb: () => void) {
  hashListeners.add(cb);
  window.addEventListener("hashchange", cb);
  return () => {
    hashListeners.delete(cb);
    window.removeEventListener("hashchange", cb);
  };
}
const getHash = () => window.location.hash;
const getServerHash = () => "";

function toFilter(hash: string): Filter {
  const m = hash.match(HASH);
  return m ? (m[1] as Tier) : "semua";
}

function TierGroup({ tier, items, ref }: { tier: Tier; items: MenuItem[]; ref?: Ref<HTMLDivElement> }) {
  const info = getTierInfo(tier);
  const reduce = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      layout={reduce ? false : "position"}
      className="tier"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: reduce ? 1 : 0.98 }}
      transition={{ duration: reduce ? 0.2 : dur.base, ease, layout: { duration: dur.base, ease } }}
    >
      <div className="tier__head">
        <h3>Paket {info.nama}</h3>
        <p>{info.deskripsi}</p>
      </div>
      <motion.div className="cards" variants={container} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }}>
        {items.map((it) => (
          <MenuCard key={it.id} item={it} />
        ))}
      </motion.div>
    </motion.div>
  );
}

/** Katalog: filter tingkat (tersimpan di URL hash) + grup kartu beranimasi. */
export function MenuGrid() {
  const items = getMenu();
  const s = getSettings();
  const reduce = useReducedMotion();
  const filter = toFilter(useSyncExternalStore(subscribeHash, getHash, getServerHash));

  const change = useCallback((f: Filter) => {
    const url = f === "semua" ? window.location.pathname : `#menu-${f}`;
    window.history.replaceState(null, "", url);
    for (const l of hashListeners) l();
  }, []);

  const tiers = TIER_ORDER.filter((t) => filter === "semua" || filter === t);

  return (
    <section className="catalog" id="katalog" aria-label="Katalog menu">
      <div className="wrap">
        <TierFilter value={filter} onChange={change} />
        <AnimatePresence mode="popLayout" initial={false}>
          {tiers.map((t) => (
            <TierGroup key={t} tier={t} items={items.filter((i) => i.tier === t)} />
          ))}
        </AnimatePresence>
        <motion.div layout={reduce ? false : "position"} transition={{ layout: { duration: dur.base, ease } }}>
          <div className="extra">
            <div className="extra__head">
              <span className="extra__tag">Add-on</span>
              <p>Bisa ditambahkan ke menu apa saja, harga per kotak. Pilih di detail menu.</p>
            </div>
            <ul className="extra__list">
              {s.addOns.map((a) => (
                <li key={a.id}>
                  {a.nama} <strong>+{formatRupiah(a.harga)}</strong>
                </li>
              ))}
            </ul>
          </div>
          <CustomPackage compact />
        </motion.div>
      </div>
    </section>
  );
}
