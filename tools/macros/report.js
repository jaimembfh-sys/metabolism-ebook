#!/usr/bin/env node
/**
 * Writes manuscript/RECIPE_MACROS.md - a per-ingredient breakdown of every
 * recipe, so the numbers can be checked line by line rather than trusted.
 *
 * Reads only. Does not touch recipes.json or the PDFs.
 *
 * Usage:
 *   node tools/macros/report.js                 all recipes
 *   node tools/macros/report.js slug [slug...]  named recipes only
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const SCRATCH = process.env.MACRO_INDEX ||
  "C:/Users/jaime/AppData/Local/Temp/claude/c--Projects-metabolism-ebook/154b03b6-0897-41cc-8ddb-69add87f5178/scratchpad/usda-index.json";

const { MAP, NEGLIGIBLE, FLAGGED, verifyMap } = require("./usda-map.js");
const { EXTRA_MAP, BRANDED, AMBIGUOUS } = require("./usda-map-extra.js");
const MAP2 = require("./usda-map-2.js");
const { MAP3, EXTRA_NEGLIGIBLE, STILL_FLAGGED, UNIT_PATCH } = require("./usda-map-3.js");

const USDA = JSON.parse(fs.readFileSync(SCRATCH, "utf8"));
const BY_ID = {};
USDA.foods.forEach((f) => (BY_ID[f.fdc_id] = f));
verifyMap(BY_ID);

// Verify the extra SR Legacy ids too.
Object.entries(Object.assign({}, EXTRA_MAP, MAP2, MAP3)).forEach(([k, v]) => {
  const f = BY_ID[v.fdc];
  if (!f) throw new Error(`EXTRA_MAP ${k}: fdc_id ${v.fdc} not in index`);
  const want = v.expect.toLowerCase().slice(0, 40);
  if (!f.desc.toLowerCase().startsWith(want)) {
    throw new Error(`EXTRA_MAP ${k}: expected "${v.expect}" got "${f.desc}"`);
  }
});

const ALL_MAP = Object.assign({}, MAP3, MAP2, MAP, EXTRA_MAP);
// Merge unit additions onto whatever table the entry already had.
Object.entries(UNIT_PATCH).forEach(([k, extra]) => {
  if (ALL_MAP[k]) ALL_MAP[k] = Object.assign({}, ALL_MAP[k], { grams: Object.assign({}, ALL_MAP[k].grams, extra) });
});
NEGLIGIBLE.push(...EXTRA_NEGLIGIBLE);
Object.assign(FLAGGED, STILL_FLAGGED);

// ---- parsing ----
const FRAC = { "¼": .25, "½": .5, "¾": .75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": .125 };
function parseQty(s) {
  if (!s) return null;
  let t = s.trim();
  for (const [g, v] of Object.entries(FRAC)) t = t.split(g).join(" " + v + " ");
  // "4 to 8 chilies" -> midpoint, disclosed in the breakdown
  const range = t.match(/^\s*([\d.]+)\s*(?:to|-|–)\s*([\d.]+)\s*$/);
  if (range) return { v: (parseFloat(range[1]) + parseFloat(range[2])) / 2, range: range[1] + "–" + range[2] };
  let total = 0, any = false;
  t.split(/\s+/).forEach((tok) => {
    if (!tok) return;
    if (/^\d+\/\d+$/.test(tok)) { const [a, b] = tok.split("/").map(Number); total += a / b; any = true; }
    else if (/^\d*\.?\d+$/.test(tok)) { total += parseFloat(tok); any = true; }
  });
  return any ? { v: total } : null;
}

const UNIT_ALIAS = {
  tbsp: "tbsp", tbsps: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
  tsp: "tsp", tsps: "tsp", teaspoon: "tsp", teaspoons: "tsp",
  cup: "cup", cups: "cup", c: "cup", oz: "oz", ozs: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb", g: "g", gram: "g", grams: "g",
  clove: "clove", cloves: "clove", slice: "slice", slices: "slice", rib: "rib", ribs: "rib",
  large: "large", medium: "medium", small: "small", can: "can", cans: "can",
};
const UNIT_RE = new RegExp("^(" + Object.keys(UNIT_ALIAS).join("|") + ")\\b", "i");

// Typical weights for items the recipe gives no weight for. Each one surfaces
// in the breakdown as an explicit assumption.
const TYPICAL = {
  "boneless ribeye steaks": { g: 340, why: "12 oz per steak, typical 1–1.5 inch cut" },
  "ribeye steaks": { g: 340, why: "12 oz per steak, typical 1–1.5 inch cut" },
};

function norm(s) {
  return s.replace(/<!--[\s\S]*?-->/g, "").replace(/\(.*?\)/g, "").split(",")[0]
    // "cooked" is NOT stripped. Cooked and raw are different foods with
    // materially different macros per 100 g, and stripping it also meant the
    // "cooked chicken" key could never match - chicken salad came out at 1 g
    // of protein per serving.
    .replace(/\b(chopped|diced|minced|shredded|crumbled|grated|halved|cubed|melted|softened|divided|optional|to taste|for garnish|for sprinkling|for serving|heaping|plus more|thinly sliced|freshly ground|ripe but firm|room temperature|well drained|finely)\b/gi, "")
    .replace(/\s+/g, " ").trim().toLowerCase();
}
const isBackRef = (raw) => /\bfrom step\b|\bremaining\b|\breserved\b|\(from /i.test(raw);
const isOptional = (raw, q) => q == null && /\boptional\b|for garnish|for sprinkling|for serving|to taste/i.test(raw);

// EXACT match only. A substring test here meant "pepper" swallowed "bell
// pepper" and zeroed a real ingredient. Anything not matched exactly falls
// through to the map, and failing that gets flagged - which is the behaviour
// we want, since a wrongly-zeroed ingredient is invisible in the output.
const isNeg = (n) => NEGLIGIBLE.includes(n);

function findKey(name, obj) {
  if (obj[name]) return name;
  const keys = Object.keys(obj).sort((a, b) => b.length - a.length);
  for (const k of keys) if (name.includes(k)) return k;
  return null;
}

function resolve(line) {
  const raw = line.replace(/^\s*[-*]\s*/, "").trim();
  let rest = raw;
  const qm = rest.match(/^([\d¼½¾⅓⅔⅛/.\s]+(?:to|-|–)?\s*[\d.]*)/);
  const parsed = qm ? parseQty(qm[1]) : null;
  const qty = parsed ? parsed.v : null;
  const qtyRange = parsed && parsed.range;
  if (qm && parsed) rest = rest.slice(qm[0].length);

  const um = rest.trim().match(UNIT_RE);
  let unit = um ? UNIT_ALIAS[um[1].toLowerCase()] : null;
  if (um) rest = rest.trim().slice(um[0].length);

  const food = norm(rest);
  if (!food) return null;
  const Z = { grams: 0, kcal: 0, fat: 0, protein: 0, carb: 0, fiber: 0 };

  if (isBackRef(raw)) return { raw, food, kind: "backref", ...Z };
  const ambKey = findKey(food, AMBIGUOUS);
  if (ambKey && /cauliflower rice|fried eggs/.test(ambKey)) return { raw, food, kind: "excluded", why: AMBIGUOUS[ambKey], ...Z };
  if (isOptional(raw, qty)) return { raw, food, kind: "optional", ...Z };

  // Order matters. A real mapping always wins over FLAGGED and NEGLIGIBLE:
  // "tamari or coconut aminos" was being flagged on the words "coconut aminos"
  // even though tamari is mapped and AMBIGUOUS already says to use it.
  const brandKey = findKey(food, BRANDED);
  const mapKey = findKey(food, ALL_MAP);
  if (!brandKey && !mapKey) {
    const flagKey = findKey(food, FLAGGED);
    if (flagKey) return { raw, food, kind: "flag", why: FLAGGED[flagKey] };
    if (isNeg(food)) return { raw, food, kind: "negligible", ...Z };
    return { raw, food, kind: "flag", why: "no confident USDA match" };
  }
  if (isNeg(food)) return { raw, food, kind: "negligible", ...Z };

  let src = null, per100 = null, gramsTable = null, label = null, fdc = null, note = null;
  if (brandKey) {
    const b = BRANDED[brandKey];
    src = "Branded"; per100 = b.per100g; gramsTable = b.grams; label = b.expect; fdc = b.fdc; note = b.note;
  } else {
    const key = mapKey;
    const e = ALL_MAP[key];
    const n = BY_ID[e.fdc];
    src = "SR Legacy"; per100 = { kcal: n.kcal, fat: n.fat, protein: n.protein, carb: n.carb, fiber: n.fiber || 0 };
    gramsTable = e.grams; label = n.desc; fdc = e.fdc;
    const t = TYPICAL[key];
    if (t) note = "assumed " + t.g + " g each — " + t.why;
  }

  if (!unit) unit = "each";
  let g = null;
  if (unit === "g") g = qty;
  else if (gramsTable && gramsTable[unit] != null && qty != null) g = qty * gramsTable[unit];
  else if (gramsTable && gramsTable.each != null && qty != null) g = qty * gramsTable.each;
  if (g == null) return { raw, food, kind: "flag", why: "no gram weight for unit '" + unit + "'" + (qty == null ? " and no quantity given" : "") };

  const k = g / 100;
  const amb = ambKey ? AMBIGUOUS[ambKey] : null;
  return {
    raw, food, kind: amb ? "ok-ambiguous" : "ok", fdc, label, src, note, why: amb,
    qty, qtyRange, unit, grams: +g.toFixed(1),
    kcal: +(per100.kcal * k).toFixed(1), fat: +(per100.fat * k).toFixed(1),
    protein: +(per100.protein * k).toFixed(1), carb: +(per100.carb * k).toFixed(1),
    fiber: +((per100.fiber || 0) * k).toFixed(1),
  };
}

function statedOf(text) {
  const sec = text.split(/##\s*Nutrition/i)[1];
  if (!sec) return {};
  const g = (l) => { const m = sec.match(new RegExp("^\\s*[-*]\\s*" + l + "\\s*:\\s*([\\d.]+)", "im")); return m ? parseFloat(m[1]) : null; };
  return { calories: g("Calories"), fat: g("Total Fat"), protein: g("Protein"), carbs: g("Total Carbs"), fiber: g("Fiber"), net_carbs: g("Net Carbs") };
}

function build(recipe) {
  const ingBlock = recipe.full_text.split(/##\s*Instructions/i)[0] || "";
  const rows = ingBlock.split(/\r?\n/).filter((l) => /^\s*[-*]\s+/.test(l)).map(resolve).filter(Boolean);
  const tot = { kcal: 0, fat: 0, protein: 0, carb: 0, fiber: 0 };
  rows.forEach((r) => {
    if (r.kind === "flag") return;
    tot.kcal += r.kcal || 0; tot.fat += r.fat || 0; tot.protein += r.protein || 0;
    tot.carb += r.carb || 0; tot.fiber += r.fiber || 0;
  });
  const s = recipe.servings || 1;
  const per = {
    calories: Math.round(tot.kcal / s), fat: Math.round(tot.fat / s),
    protein: Math.round(tot.protein / s), carbs: Math.round(tot.carb / s),
    fiber: Math.round(tot.fiber / s),
  };
  per.net_carbs = Math.max(0, per.carbs - per.fiber);
  return { rows, tot, per, servings: s, stated: statedOf(recipe.full_text) };
}

function md(recipe) {
  const b = build(recipe);
  const L = [];
  L.push(`## ${recipe.title}`);
  L.push("");
  L.push(`\`${recipe.slug}\` · **servings: ${b.servings}** (as stated in the recipe)`);
  L.push("");
  L.push("| Ingredient as written | Amount | Mapped to | Source | Fat g | Protein g | Carbs g |");
  L.push("|---|---|---|---|---|---|---|");
  b.rows.forEach((r) => {
    const amt = r.grams ? `${r.grams} g` : "—";
    if (r.kind === "flag") { L.push(`| ${r.raw} | ${amt} | ⚠️ **FLAGGED** — ${r.why} | — | — | — | — |`); return; }
    if (r.kind === "negligible") { L.push(`| ${r.raw} | — | *negligible* | — | 0 | 0 | 0 |`); return; }
    if (r.kind === "backref") { L.push(`| ${r.raw} | — | *back-reference, already counted above* | — | 0 | 0 | 0 |`); return; }
    if (r.kind === "optional") { L.push(`| ${r.raw} | — | *optional, no amount given* | — | 0 | 0 | 0 |`); return; }
    if (r.kind === "excluded") { L.push(`| ${r.raw} | — | *excluded — ${r.why}* | — | 0 | 0 | 0 |`); return; }
    const extra = [r.note, r.why].filter(Boolean).join(" ");
    L.push(`| ${r.raw} | ${amt} | ${r.label} <br>\`FDC ${r.fdc}\`${extra ? " <br>*" + extra + "*" : ""} | ${r.src} | ${r.fat} | ${r.protein} | ${r.carb} |`);
  });
  L.push(`| **WHOLE RECIPE TOTAL** | | | | **${b.tot.fat.toFixed(1)}** | **${b.tot.protein.toFixed(1)}** | **${b.tot.carb.toFixed(1)}** |`);
  L.push("");
  L.push(`Whole recipe: **${Math.round(b.tot.kcal)} kcal**, fat ${b.tot.fat.toFixed(1)} g, protein ${b.tot.protein.toFixed(1)} g, carbs ${b.tot.carb.toFixed(1)} g, fiber ${b.tot.fiber.toFixed(1)} g`);
  L.push(`Divided by **${b.servings} servings**.`);
  L.push("");
  const s = b.stated;
  const row = (label, was, now) => {
    const d = was != null && was !== 0 ? Math.round(((now - was) / was) * 100) : null;
    return `| ${label} | ${was ?? "—"} | **${now}** | ${d != null ? (d > 0 ? "+" : "") + d + "%" : "—"} |`;
  };
  L.push("| Per serving | Old (as printed) | New (USDA) | Change |");
  L.push("|---|---|---|---|");
  L.push(row("Calories", s.calories, b.per.calories));
  L.push(row("Fat (g)", s.fat, b.per.fat));
  L.push(row("Protein (g)", s.protein, b.per.protein));
  L.push(row("Total carbs (g)", s.carbs, b.per.carbs));
  L.push(row("Fiber (g)", s.fiber, b.per.fiber));
  L.push(row("Net carbs (g)", s.net_carbs, b.per.net_carbs));
  L.push("");
  const flags = b.rows.filter((r) => r.kind === "flag");
  if (flags.length) {
    L.push(`> ⚠️ **${flags.length} ingredient${flags.length > 1 ? "s" : ""} flagged and excluded from the totals above.** The new numbers are therefore a floor, not a final figure.`);
    flags.forEach((f) => L.push(`> - \`${f.raw}\` — ${f.why}`));
    L.push("");
  }
  const assumptions = b.rows.filter((r) => r.note || r.why);
  if (assumptions.length) {
    L.push("**Assumptions made:**");
    assumptions.forEach((a) => L.push(`- \`${a.raw}\` — ${[a.note, a.why].filter(Boolean).join(" ")}`));
    L.push("");
  }
  L.push("---");
  L.push("");
  return L.join("\n");
}

const R = JSON.parse(fs.readFileSync(path.join(ROOT, "knowledge-base", "recipes.json"), "utf8"));
const want = process.argv.slice(2);
const list = want.length ? want.map((w) => R.recipes.find((r) => r.slug === w)).filter(Boolean) : R.recipes;

const head = [
  "# Recipe macros — rebuilt from USDA FoodData Central",
  "",
  `Generated ${new Date().toISOString().slice(0, 10)} by \`tools/macros/report.js\`. **Review only — no recipe, PDF or \`recipes.json\` has been changed.**`,
  "",
  "Every number below traces to a USDA FDC id that was found by searching the dataset and then read to confirm it is the right food. `verifyMap()` asserts each id still resolves to the description it was chosen for and throws otherwise.",
  "",
  "**Sources.** SR Legacy (2018-04), downloaded in full and indexed locally — 7,793 foods. Two ingredients come from FDC Branded Foods, marked as such, because SR Legacy has no entry for them.",
  "",
  "**Ingredients are mapped to what the recipe says**, never to a fattier cut or a near neighbour. Where a recipe names a food loosely, or offers a choice, the ingredient is flagged or the assumption is stated rather than resolved silently.",
  "",
  "---",
  "",
];

fs.writeFileSync(path.join(ROOT, "manuscript", "RECIPE_MACROS.md"), head.join("\n") + list.map(md).join(""), "utf8");
console.log(`wrote manuscript/RECIPE_MACROS.md for ${list.length} recipe(s)`);
list.forEach((r) => {
  const b = build(r);
  const f = b.rows.filter((x) => x.kind === "flag").length;
  console.log(`  ${r.slug.padEnd(40)} ${String(b.per.calories).padStart(5)} kcal  fat ${String(b.per.fat).padStart(3)}g  prot ${String(b.per.protein).padStart(3)}g` + (f ? `   ⚠ ${f} flagged` : ""));
});
