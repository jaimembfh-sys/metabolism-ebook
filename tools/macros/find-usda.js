// Searches the local USDA index by description and ranks candidates, so every
// fdc_id comes from the dataset rather than from memory.
//
// Written after discovering that 14 of 40 hand-written ids pointed at the wrong
// food entirely - avocado oil resolved to corn oil, flank steak to beef
// pancreas, coconut flour to dark chocolate. Nothing here is trusted unless it
// came out of this search and was then eyeballed.
const fs = require("fs");
const U = JSON.parse(fs.readFileSync(__dirname + "/usda-index.json", "utf8"));

function score(desc, terms, avoid) {
  const d = desc.toLowerCase();
  let s = 0;
  for (const t of terms) {
    if (!d.includes(t)) return -1;      // every required term must appear
    s += 10;
    if (d.startsWith(t)) s += 8;        // "Oil, olive…" beats "Salad dressing, olive…"
  }
  for (const a of avoid || []) if (d.includes(a)) s -= 25;
  s -= d.length / 40;                   // prefer the plainer entry
  return s;
}

function search(query, opts) {
  opts = opts || {};
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  return U.foods
    .map((f) => ({ f, s: score(f.desc, terms, opts.avoid) }))
    .filter((x) => x.s >= 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, opts.n || 5)
    .map((x) => x.f);
}

module.exports = { search };

if (require.main === module) {
  const q = process.argv.slice(2).join(" ");
  const avoid = (process.env.AVOID || "").split(",").filter(Boolean);
  search(q, { n: 8, avoid }).forEach((f) =>
    console.log(
      String(f.fdc_id).padStart(7),
      ("fat " + String(f.fat).padStart(6)).padEnd(11),
      ("kcal " + String(f.kcal).padStart(4)).padEnd(10),
      ("prot " + String(f.protein).padStart(5)).padEnd(11),
      f.desc.slice(0, 74)
    )
  );
}
