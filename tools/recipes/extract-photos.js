/* Pull the hero photograph out of each recipe PDF and write it as a JPEG to
 * images/recipes/<slug>.jpg.
 *
 * Each PDF holds: the 499x224 logo, one wide photo (1408xN or 1402x430) with a
 * DeviceGray SMask beside it, and in 27 of them a second 1024x1024 photo, also
 * with a mask. The wide one is the hero - it is the banner across the top - so
 * that is what comes out. Everything is DeviceRGB, 8 bits, ASCII85 over Flate.
 */
const fs = require("fs"), path = require("path"), zlib = require("zlib");
const sharp = require("sharp");

function a85(str) {
  str = str.replace(/\s+/g, "").replace(/^<~/, "");
  const e = str.indexOf("~>"); if (e >= 0) str = str.slice(0, e);
  const out = []; let t = 0, n = 0;
  for (const ch of str) {
    if (ch === "z" && n === 0) { out.push(0, 0, 0, 0); continue; }
    t = t * 85 + (ch.charCodeAt(0) - 33); n++;
    if (n === 5) { for (let i = 3; i >= 0; i--) out.push((t >>> (i * 8)) & 255); t = 0; n = 0; }
  }
  if (n > 0) { for (let i = n; i < 5; i++) t = t * 85 + 84; for (let i = 3; i >= 4 - (n - 1); i--) out.push((t >>> (i * 8)) & 255); }
  return Buffer.from(out);
}

const ROOT = path.resolve(__dirname, "..", "..");
const OUTDIR = path.join(ROOT, "images", "recipes");
fs.mkdirSync(OUTDIR, { recursive: true });

const R = JSON.parse(fs.readFileSync(path.join(ROOT, "knowledge-base", "recipes.json"), "utf8")).recipes;
const report = [];

for (const r of R) {
  const pdfPath = path.join(ROOT, r.source_file);
  if (!fs.existsSync(pdfPath)) { report.push({ slug: r.slug, status: "no pdf" }); continue; }
  const s = fs.readFileSync(pdfPath).toString("latin1");

  // Every image XObject, with where its stream starts and how long it is.
  const found = [];
  const re = /<<([^<>]*\/Subtype \/Image[^<>]*)>>\s*stream\r?\n/g;
  let m;
  while ((m = re.exec(s))) {
    const d = m[1].replace(/\s+/g, " ");
    const w = +(d.match(/\/Width (\d+)/) || [])[1];
    const h = +(d.match(/\/Height (\d+)/) || [])[1];
    const len = +(d.match(/\/Length (\d+)/) || [])[1];
    const cs = (d.match(/\/ColorSpace \/(\w+)/) || [])[1];
    if (w && h && len && cs === "DeviceRGB") found.push({ w, h, len, at: m.index + m[0].length });
  }
  // The hero is the widest image that is not the logo.
  const heroes = found.filter((i) => !(i.w === 499 && i.h === 224)).sort((a, b) => b.w * b.h - a.w * a.h);
  const wide = heroes.filter((i) => i.w / i.h > 1.5);
  const pick = wide[0] || heroes[0];
  if (!pick) { report.push({ slug: r.slug, status: "no photo" }); continue; }

  let rgb;
  try { rgb = zlib.inflateSync(a85(s.slice(pick.at, pick.at + pick.len))); }
  catch (e) { report.push({ slug: r.slug, status: "decode failed: " + e.message }); continue; }

  const want = pick.w * pick.h * 3;
  if (rgb.length !== want) { report.push({ slug: r.slug, status: `size mismatch ${rgb.length} vs ${want}` }); continue; }

  // A real photograph varies; a solid fill does not. Cheap guard against
  // pulling out a background rectangle by mistake.
  let mn = 255, mx = 0, sum = 0;
  for (let i = 0; i < rgb.length; i += 997) { const v = rgb[i]; if (v < mn) mn = v; if (v > mx) mx = v; sum += v; }
  const spread = mx - mn;

  const out = path.join(OUTDIR, r.slug + ".jpg");
  sharp(rgb, { raw: { width: pick.w, height: pick.h, channels: 3 } })
    .jpeg({ quality: 82, mozjpeg: true })
    .toFile(out)
    .then(() => {
      const kb = Math.round(fs.statSync(out).size / 1024);
      report.push({ slug: r.slug, status: "ok", w: pick.w, h: pick.h, kb, spread, others: heroes.length - 1 });
      done();
    })
    .catch((e) => { report.push({ slug: r.slug, status: "encode failed: " + e.message }); done(); });
}

let pending = R.length;
function done() {
  if (--pending > 0) return;
  print();
}
// Recipes that bailed before the async encode still counted against pending.
const sync = report.filter((x) => x.status !== "ok").length;
pending -= 0;
if (report.length === R.length) print();

function print() {
  if (print.called) return; print.called = true;
  report.sort((a, b) => a.slug.localeCompare(b.slug));
  console.log("slug".padEnd(48) + "status".padEnd(10) + "size".padEnd(12) + "KB".padStart(5) + "  spread  extra");
  for (const x of report) {
    console.log(x.slug.padEnd(48) + String(x.status).padEnd(10) +
      (x.w ? (x.w + "x" + x.h).padEnd(12) : "".padEnd(12)) +
      String(x.kb || "").padStart(5) + "  " + String(x.spread || "").padStart(6) + "  " + (x.others || 0));
  }
  const ok = report.filter((x) => x.status === "ok");
  console.log("\n  extracted: " + ok.length + " of " + R.length);
  const bad = report.filter((x) => x.status !== "ok");
  bad.forEach((b) => console.log("  PROBLEM " + b.slug + ": " + b.status));
  const flat = ok.filter((x) => x.spread < 40);
  flat.forEach((f) => console.log("  SUSPECT (little variation, may not be a photo): " + f.slug));
  
}
