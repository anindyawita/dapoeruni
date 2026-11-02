// Prerender: isi <div id="root"> di dist/*.html dengan HTML hasil React,
// supaya konten & foto hero tampil sebelum JavaScript selesai dimuat.
import { readFile, rm, writeFile } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const { render } = await import(pathToFileURL(`${root}dist-ssr/entry-server.js`).href);

for (const [file, page] of [
  ["dist/index.html", "home"],
  ["dist/menu.html", "menu"],
]) {
  const path = `${root}${file}`;
  const html = await readFile(path, "utf8");
  if (!html.includes('<div id="root"></div>')) throw new Error(`root kosong tidak ditemukan di ${file}`);
  await writeFile(path, html.replace('<div id="root"></div>', `<div id="root">${render(page)}</div>`));
  console.log(`prerender ✓ ${file}`);
}
await rm(`${root}dist-ssr`, { recursive: true, force: true });
