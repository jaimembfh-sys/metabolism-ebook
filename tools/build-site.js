#!/usr/bin/env node
/**
 * Assembles dist/ — everything the public site needs, and nothing else — and
 * netlify.toml publishes that directory.
 *
 * WHY THIS EXISTS. netlify.toml set no publish directory, so Netlify's default
 * applied and the whole repository root was the site. A check against
 * howyourbodyburns.netlify.app on 2026-09-22 found these reachable:
 *
 *     /knowledge-base/recipes.json          200
 *     /knowledge-base/protocol-corpus.json  200
 *     /package.json                         200
 *     /server.js                            200
 *
 * The first two are meant to be public - index.html fetches them at runtime.
 * The other two are not. And manuscript/, coach-reference/ and tools/ only
 * 404ed because they were added after the last deploy: the next one would have
 * put the whole AI coach corpus, every internal report and the USDA tooling on
 * the open web.
 *
 * The list below is an ALLOWLIST, derived by reading every src, href and
 * fetch() in the nine public HTML pages, not by guessing. Adding a page or an
 * asset means adding it here; a missing file fails the build rather than
 * shipping a broken link.
 *
 * Usage: node tools/build-site.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const DIST = path.join(ROOT, "dist");

/* Files and directories the public site serves. Everything else stays out. */
const PAGES = [
  "index.html",
  "account-info.html",
  "beauty-basics.html",
  "bionut.html",
  "contact-us.html",
  "create-new-password.html",
  "metaburn-ai-coach.html",
  "order-history.html",
  "understanding-metabolism.html",
  "foundations-of-health.html",
];

const FILES = [
  ...PAGES,
  "Low_Carb_Whole_Food_Snacks.pdf",
  "Super_Quick_Meal_Ideas.pdf",
  // The five the app fetches at runtime. The rest of knowledge-base/ - the
  // recipe markdown, the chunk files, the build scripts, coach-fixtures.json -
  // is source and stays behind.
  "knowledge-base/recipes.json",
  "knowledge-base/protocol-corpus.json",
  "knowledge-base/coach-rules.json",
  "knowledge-base/daily-quotes.json",
  "knowledge-base/researcher-sources.json",
];

const DIRS = [
  "styles",       // brand.css
  "scripts",      // a11y.js, format.js, retrieval.js — all three are loaded
  "images",       // several referenced directly, and one built at runtime
  "logos",        // favicon-mind-body.png, mind-body-cropped.png
  "recipes",      // the 43 recipe PDFs, linked from the recipe list
  // Approved by Jaime 2026-09-22. The coach links to these by the `page`
  // field build-recipes-corpus.js writes into recipes.json, so they have to
  // be reachable for those links to resolve. The PDFs stay published beside
  // them until he retires them.
  "recipes-html",
];

/* Deliberately NOT published, and why:
 *
 *   manuscript/              internal reports, correction logs, review notes
 *   coach-reference/         the AI coach knowledge corpus
 *   knowledge-base/*         recipe source, chunk files, build scripts
 *   tools/                   macro pipeline and the 1.3 MB USDA index
 *   Certifications/          personal documents
 *   Functional medicine content/
 *   _original-assets-backup/
 *   outputs/                 flyer working files
 *   .claude/                 editor and permission settings
 *   .env.example             names of the secrets, even without values
 *   package.json, package-lock.json, server.js, serve.ps1
 *   recipes-html/            NOT YET APPROVED — add to DIRS when it is
 */

function copyFile(rel) {
  const from = path.join(ROOT, rel);
  if (!fs.existsSync(from)) throw new Error("missing file in allowlist: " + rel);
  const to = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  return fs.statSync(from).size;
}

function copyDir(rel) {
  const from = path.join(ROOT, rel);
  if (!fs.existsSync(from)) throw new Error("missing directory in allowlist: " + rel);
  let n = 0, bytes = 0;
  for (const e of fs.readdirSync(from, { withFileTypes: true })) {
    const sub = rel + "/" + e.name;
    if (e.isDirectory()) { const r = copyDir(sub); n += r.n; bytes += r.bytes; }
    else { bytes += copyFile(sub); n++; }
  }
  return { n, bytes };
}

fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

let files = 0, bytes = 0;
for (const f of FILES) { bytes += copyFile(f); files++; }
for (const d of DIRS) { const r = copyDir(d); files += r.n; bytes += r.bytes; }

console.log("dist/ built — " + files + " files, " + (bytes / 1024 / 1024).toFixed(1) + " MB");

/* Every local reference in every published page must resolve inside dist/,
 * or the allowlist has a hole in it.
 */
const holes = [];     // in the repo, but not published — the allowlist is wrong
const already = [];   // not in the repo either — broken before this existed
for (const p of PAGES) {
  const t = fs.readFileSync(path.join(DIST, p), "utf8");
  const refs = new Set();
  for (const m of t.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) refs.add(m[1]);
  for (const m of t.matchAll(/fetch\(\s*["']([^"']+)["']/g)) refs.add(m[1]);
  for (const r of refs) {
    const u = r.trim().replace(/[?#].*$/, "");
    if (!u || /^(https?:|\/\/|#|mailto:|tel:|data:|javascript:)/i.test(u)) continue;
    if (u.startsWith("/api/") || u.includes("${")) continue;   // function routes, runtime-built
    const rel = u.replace(/^\//, "");
    if (fs.existsSync(path.join(DIST, rel))) continue;
    (fs.existsSync(path.join(ROOT, rel)) ? holes : already).push(p + " -> " + r);
  }
}
/* A file that is in the repo but missing from dist/ is this script's fault and
 * fails the build. A file that is in neither was already a dead link on the
 * live site - /1.jpg and friends 404 there today, because the images are
 * images/1.webp - and publishing less does not make that worse, so it is
 * reported rather than treated as a regression.
 */
if (already.length) {
  console.log("\n  already-dead links, unchanged by this (they 404 on the live site now):");
  already.forEach((m) => console.log("    " + m));
}
if (holes.length) {
  console.error("\nALLOWLIST HOLE — in the repo, linked, but not published:");
  holes.forEach((m) => console.error("  " + m));
  process.exit(1);
}
console.log("\n  every reference that resolves in the repo also resolves in dist/");
