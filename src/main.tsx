import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces/opsz-italic.css";
import "./index.css";

import { StrictMode } from "react";
import { createRoot, hydrateRoot } from "react-dom/client";
import { App } from "./App";
import { HomePage } from "./pages/HomePage";
import { MenuPage } from "./pages/MenuPage";

// Satu entry untuk dua halaman HTML; halaman dipilih dari <html data-page="...">.
const page = document.documentElement.dataset.page;
const root = document.getElementById("root");

// tanda JS sudah jalan: mematikan fallback CSS yang menampilkan konten bila JS lambat
document.documentElement.classList.add("js-ready");

if (root) {
  const app = (
    <StrictMode>
      <App>{page === "menu" ? <MenuPage /> : <HomePage />}</App>
    </StrictMode>
  );
  // HTML hasil prerender (npm run build) di-hydrate; saat dev dirender biasa
  if (root.firstElementChild) hydrateRoot(root, app);
  else createRoot(root).render(app);
}
