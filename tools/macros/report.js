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
const { MAP3, EXTRA_NEGLIGIBLE, STILL_FLAGGED, UNIT_PATCH, DEFAULT_QTY } = require("./usda-map-3.js");
// Meat picks from the 60th-percentile rule in meat-rule.js. Declared here
// because the verification block below reads it.
const MEAT_OVERRIDE = require("./usda-map-3.js").MEAT_OVERRIDE || {};
// Foundation-first rule, 2026-09-21. Foundation is lab-measured and newer, so
// it wins wherever an entry exists for the same food; SR Legacy is the
// fallback. Hand-curated - see the header of foundation-map.js for why an
// auto-matcher was rejected.
const { FOUNDATION_MAP, FOUNDATION_REJECTED, verifyFoundation } = require("./foundation-map.js");
// Ground beef, salmon, the mixed-vegetable composite and the guacamole yield.
const { BLENDS, COMPOSITES, YIELD, blendWeight, verifyAssumptions } = require("./assumptions.js");

const USDA = JSON.parse(fs.readFileSync(SCRATCH, "utf8"));
const BY_ID = {};
USDA.foods.forEach((f) => (BY_ID[f.fdc_id] = f));
verifyMap(BY_ID);

const FND_BY_ID = {};
JSON.parse(fs.readFileSync(path.join(__dirname, "foundation-index.json"), "utf8"))
  .foods.forEach((f) => (FND_BY_ID[f.fdc_id] = f));
verifyFoundation(FND_BY_ID);
verifyAssumptions(FND_BY_ID, BY_ID);
// Every switch made, collected for the report.
const SWITCHES = {};

// Verify the extra SR Legacy ids too.
Object.entries(Object.assign({}, EXTRA_MAP, MAP2, MAP3, MEAT_OVERRIDE)).forEach(([k, v]) => {
  const f = BY_ID[v.fdc];
  if (!f) throw new Error(`EXTRA_MAP ${k}: fdc_id ${v.fdc} not in index`);
  const want = v.expect.toLowerCase().slice(0, 40);
  if (!f.desc.toLowerCase().startsWith(want)) {
    throw new Error(`EXTRA_MAP ${k}: expected "${v.expect}" got "${f.desc}"`);
  }
});

const ALL_MAP = Object.assign({}, MAP3, MAP2, MAP, EXTRA_MAP, MEAT_OVERRIDE);
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

/* Ingredient text is reduced in three steps, and a key is looked up against
 * ALL THREE in turn - widest first.
 *
 * Reducing in one step was losing real mappings. "diced", "shredded",
 * "grated" and "halved" were stripped before lookup, so every key containing
 * one of those words - "shredded cheddar cheese", "diced tomatoes", "can
 * diced tomatoes", "halved cherry tomatoes", "freshly grated parmesan" - could
 * never be reached, and the ingredient came back "no confident USDA match".
 * Splitting at the first comma lost others: "1 cup all natural, no sugar added
 * smooth peanut butter" became "all natural".
 *
 * So: try the whole line, then the part before the comma, then that with the
 * qualifiers removed. Longest and most specific wins, which is also what
 * findKey already prefers.
 */
function clean(s) {
  return s.replace(/<!--[\s\S]*?-->/g, "").replace(/\(.*?\)/g, "")
    .replace(/\s+/g, " ").trim().toLowerCase();
}
// "cooked" is NOT stripped. Cooked and raw are different foods with materially
// different macros per 100 g, and stripping it also meant the "cooked chicken"
// key could never match - chicken salad came out at 1 g of protein per serving.
const QUALIFIER = /\b(chopped|diced|minced|shredded|crumbled|grated|halved|cubed|melted|softened|divided|optional|to taste|for garnish|for sprinkling|for serving|heaping|plus more|thinly sliced|freshly ground|ripe but firm|room temperature|well drained|finely)\b/gi;

function normForms(s) {
  const whole = clean(s);
  // Map keys are written without punctuation, so "boneless, skinless chicken"
  // has to lose its comma before it can reach the "boneless skinless chicken"
  // key. Without this the line falls through to a bare "boneless" catch-all,
  // which is how a chicken THIGH line came to be costed as breast.
  const flat = clean(whole.replace(/,/g, " "));
  const head = clean(s.replace(/<!--[\s\S]*?-->/g, "").replace(/\(.*?\)/g, "").split(",")[0]);
  const bare = clean(head.replace(QUALIFIER, ""));
  return [...new Set([whole, flat, head, bare].filter(Boolean))];
}
function norm(s) { const f = normForms(s); return f[f.length - 1]; }

// Look a key up against every reduction of the ingredient text, widest first.
function findKeyAny(forms, obj) {
  for (const f of forms) { const k = findKey(f, obj); if (k) return k; }
  return null;
}
// "The soaked and drained macadamia nuts" points back at an ingredient already
// weighed further up the list, the same as "the reserved marinade". It was
// sitting in FLAGGED, which made a fully-resolved recipe read as if it had a
// gap in it.
const isBackRef = (raw) => /\bfrom step\b|\bremaining\b|\breserved\b|\(from |^the soaked and drained\b/i.test(raw);
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

/* One ingredient line standing for several foods in equal parts. Equal parts
 * by weight makes the blended per-100 g profile the plain mean of the parts,
 * and every id stays on the row so it can be checked.
 */
function composite(raw, food, c) {
  const ns = c.parts.map((p) => FND_BY_ID[p.fdc]);
  const avg = (f) => ns.reduce((a, n) => a + (n[f] || 0), 0) / ns.length;
  const k = c.total_g / 100;
  return {
    raw, food, kind: "ok", src: "Foundation",
    fdc: c.parts.map((p) => p.fdc).join(", "),
    label: ns.map((n) => n.desc).join(" + "),
    note: "no quantity in the recipe — assumed " + c.assumes,
    qty: null, unit: null, grams: c.total_g,
    kcal: +(avg("kcal") * k).toFixed(1), fat: +(avg("fat") * k).toFixed(1),
    protein: +(avg("protein") * k).toFixed(1), carb: +(avg("carb") * k).toFixed(1),
    fiber: +(avg("fiber") * k).toFixed(1),
  };
}

// The gram weight for a key, using whichever unit table already covers it.
function gramsFor(forms, qty, unit) {
  const k = findKeyAny(forms, ALL_MAP);
  const t = k && ALL_MAP[k].grams;
  if (!t || qty == null) return null;
  const u = unit || "each";
  if (u === "g") return qty;
  if (t[u] != null) return qty * t[u];
  return t.each != null ? qty * t.each : null;
}

/* A weighted blend of two entries, which may come from different datasets.
 * The weight is the position between the lower-fat and the higher-fat part.
 * Every macro is blended on the same weighting - taking fat from a blend while
 * protein came from one entry would not describe any real food.
 */
function blend(raw, food, b, grams, qty, unit) {
  const w = blendWeight(b);
  const ns = b.parts
    .map((p) => ({ p, n: (p.src === "SR Legacy" ? BY_ID : FND_BY_ID)[p.fdc] }))
    .sort((x, y) => x.n.fat - y.n.fat);
  const mix = (f) => {
    const lo = ns[0].n[f] || 0, hi = ns[1].n[f] || 0;
    return lo + w * (hi - lo);
  };
  const k = grams / 100;
  const mid = ((ns[0].n.fat || 0) + (ns[1].n.fat || 0)) / 2;
  const fat = mix("fat");
  const how = b.leanTarget != null
    ? `weighted to ${b.leanTarget}% lean between the ${ns[0].p.lean}/${100 - ns[0].p.lean} and the `
      + `${ns[1].p.lean}/${100 - ns[1].p.lean} — ${fat.toFixed(2)} g fat/100 g, against the `
      + `${100 - b.leanTarget} g a ${b.leanTarget}/${100 - b.leanTarget} label implies`
    : `blended at the ${Math.round(w * 100)}th percentile between the two entries — `
      + `${fat.toFixed(2)} g fat/100 g, just above their ${mid.toFixed(2)} g midpoint`;
  return {
    raw, food, kind: "ok",
    src: [...new Set(ns.map((x) => x.p.src))].join(" + "),
    fdc: ns.map((x) => x.p.fdc).join(" + "),
    label: ns.map((x) => x.n.desc).join("  |  "),
    note: `${how}. Assumes ${b.assumes}.`,
    qty, unit, grams: +grams.toFixed(1),
    kcal: +(mix("kcal") * k).toFixed(1), fat: +(fat * k).toFixed(1),
    protein: +(mix("protein") * k).toFixed(1), carb: +(mix("carb") * k).toFixed(1),
    fiber: +(mix("fiber") * k).toFixed(1),
  };
}

const WEIGHT_UNIT_G = { g: 1, gram: 1, grams: 1, oz: 28.35, ounce: 28.35, ounces: 28.35, lb: 453.6, lbs: 453.6, pound: 453.6, pounds: 453.6 };

/* A weight stated in brackets after the food name - the total for the line.
 * Returns null for a bracket that comes before the food name, which is a
 * per-item size ("2 (5 oz) cans tuna") and is handled by the unit tables.
 */
function statedTotal(raw) {
  const re = /\(([^)]*?)\)/g;
  let m;
  while ((m = re.exec(raw)) !== null) {
    // Leading bracket: nothing but digits and spaces before it.
    if (/^[\d\s/.]*$/.test(raw.slice(0, m.index))) continue;
    const inner = m[1].replace(/^\s*(about|approx\w*)\s+/i, "");
    const w = inner.match(/^([\d]+(?:\s+\d+\/\d+)?(?:\.\d+)?|\d+\/\d+)\s*-?\s*([a-z]+)\.?$/i);
    if (!w) continue;
    const mult = WEIGHT_UNIT_G[w[2].toLowerCase()];
    if (!mult) continue;
    const q = parseQty(w[1]);
    if (!q || q.v == null) continue;
    return q.v * mult;
  }
  return null;
}

function resolve(line) {
  const raw = line.replace(/^\s*[-*]\s*/, "").trim();
  let rest = raw;
  const qm = rest.match(/^([\d¼½¾⅓⅔⅛/.\s]+(?:to|-|–)?\s*[\d.]*)/);
  const parsed = qm ? parseQty(qm[1]) : null;
  let qty = parsed ? parsed.v : null;
  const qtyRange = parsed && parsed.range;
  if (qm && parsed) rest = rest.slice(qm[0].length);

  const um = rest.trim().match(UNIT_RE);
  let unit = um ? UNIT_ALIAS[um[1].toLowerCase()] : null;
  if (um) rest = rest.trim().slice(um[0].length);

  const forms = normForms(rest);
  const food = forms[forms.length - 1];
  if (!food) return null;
  const Z = { grams: 0, kcal: 0, fat: 0, protein: 0, carb: 0, fiber: 0 };

  if (isBackRef(raw)) return { raw, food, kind: "backref", ...Z };
  const ambKey = findKeyAny(forms, AMBIGUOUS);
  if (ambKey && /cauliflower rice|fried eggs/.test(ambKey)) return { raw, food, kind: "excluded", why: AMBIGUOUS[ambKey], ...Z };
  if (isOptional(raw, qty)) return { raw, food, kind: "optional", ...Z };

  // Composites resolve before the map lookups, because the line they stand for
  // names no single food and would otherwise fall through to FLAGGED.
  const compKey = findKeyAny(forms, COMPOSITES);
  if (compKey) {
    const c = COMPOSITES[compKey];
    if (c.exclude) return { raw, food, kind: "excluded", why: c.excludeWhy, ...Z };
    return composite(raw, food, c);
  }

  // A blend of two entries, for a meat where Jaime asked for a value between
  // them rather than either one. Both ids stay on the row.
  const blendKey = findKeyAny(forms, BLENDS);
  if (blendKey) {
    const b = BLENDS[blendKey];
    const g = gramsFor(forms, qty, unit);
    if (g != null) return blend(raw, food, b, g, qty, unit);
  }

  // Order matters. A real mapping always wins over FLAGGED and NEGLIGIBLE:
  // "tamari or coconut aminos" was being flagged on the words "coconut aminos"
  // even though tamari is mapped and AMBIGUOUS already says to use it.
  const brandKey = findKeyAny(forms, BRANDED);
  const mapKey = findKeyAny(forms, ALL_MAP);
  if (!brandKey && !mapKey) {
    const flagKey = findKeyAny(forms, FLAGGED);
    if (flagKey) return { raw, food, kind: "flag", why: FLAGGED[flagKey] };
    if (isNeg(food)) return { raw, food, kind: "negligible", ...Z };
    return { raw, food, kind: "flag", why: "no confident USDA match" };
  }
  if (isNeg(food)) return { raw, food, kind: "negligible", ...Z };

  let src = null, per100 = null, gramsTable = null, label = null, fdc = null, note = null;

  // Foundation-first: it outranks both SR Legacy and the Branded stand-ins
  // (coconut flour was on a Branded entry only because SR Legacy had none).
  // MACRO_NO_FOUNDATION=1 reproduces the pre-Foundation numbers, so the
  // before/after tables are generated from the same code path rather than
  // from a remembered earlier run.
  const fndKey = process.env.MACRO_NO_FOUNDATION ? null
    : (FOUNDATION_MAP[mapKey] ? mapKey : (FOUNDATION_MAP[brandKey] ? brandKey : null));
  if (fndKey) {
    const n = FND_BY_ID[FOUNDATION_MAP[fndKey].fdc];
    src = "Foundation"; fdc = n.fdc_id; label = n.desc;
    // Foundation does not report fiber for every food - avocado, chia, celery,
    // cucumber, romaine and cabbage all come back without it, even from the
    // full detail endpoint. Left at zero, net carbs would be badly overstated
    // (guacamole read 86 g net carbs per serving instead of 27). Where
    // Foundation has no fiber, it is taken from the SR Legacy entry this
    // ingredient was on and the breakdown says so. For meat, cheese, cream and
    // oil that fallback is 0 either way.
    let fiber = n.fiber, fiberFrom = null;
    if (fiber == null) {
      const sr = ALL_MAP[fndKey] ? BY_ID[ALL_MAP[fndKey].fdc] : null;
      fiber = sr && sr.fiber ? sr.fiber : 0;
      if (fiber) fiberFrom = sr.fdc_id;
    }
    per100 = { kcal: n.kcal, fat: n.fat, protein: n.protein, carb: n.carb, fiber };
    // Unit conversions are unchanged by the switch, so keep whatever gram
    // table the SR Legacy or Branded entry already carried.
    gramsTable = (ALL_MAP[fndKey] && ALL_MAP[fndKey].grams) || (BRANDED[fndKey] && BRANDED[fndKey].grams);
    const t = TYPICAL[fndKey];
    if (t) note = "assumed " + t.g + " g each — " + t.why;
    if (fiberFrom) {
      note = (note ? note + "; " : "") + "fiber " + fiber + " g/100 g from SR Legacy " + fiberFrom + " — Foundation reports none for this food";
    }
    if (!SWITCHES[fndKey]) {
      const old = ALL_MAP[fndKey] ? BY_ID[ALL_MAP[fndKey].fdc] : null;
      const ob = !old && BRANDED[fndKey] ? BRANDED[fndKey] : null;
      SWITCHES[fndKey] = {
        key: fndKey,
        from: old ? { src: "SR Legacy", fdc: old.fdc_id, desc: old.desc, fat: old.fat, protein: old.protein, carb: old.carb, fiber: old.fiber || 0, kcal: old.kcal }
                  : { src: "Branded", fdc: ob.fdc, desc: ob.expect, fat: ob.per100g.fat, protein: ob.per100g.protein, carb: ob.per100g.carb, fiber: ob.per100g.fiber || 0, kcal: ob.per100g.kcal },
        to: { src: "Foundation", fdc: n.fdc_id, desc: n.desc, fat: n.fat, protein: n.protein, carb: n.carb, fiber: n.fiber || 0, kcal: n.kcal },
      };
    }
  } else if (brandKey) {
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

  /* A weight Jaime wrote in brackets AFTER the food name is the total for the
   * line, and it beats any count-times-typical-weight this tool would infer.
   * "6 small chicken breasts (1 1/2 lbs)" was being costed at 840 g against
   * the 680 g stated, and "3 chicken breasts (about 1 lb)" at 522 g against
   * 454 g.
   *
   * A bracket BEFORE the food name is a per-item size instead - "2 (5 oz) cans
   * tuna" is two 5 oz cans - and that already resolves correctly, so it is
   * left alone.
   */
  const stated = statedTotal(raw);
  if (stated != null) {
    const ambNote = ambKey ? AMBIGUOUS[ambKey] : null;
    const g0 = stated;
    const k0 = g0 / 100;
    return {
      raw, food, kind: ambNote ? "ok-ambiguous" : "ok", fdc, label, src,
      note: (note ? note + "; " : "") + "weight taken from the recipe line",
      why: ambNote, qty, qtyRange, unit, grams: +g0.toFixed(1),
      kcal: +(per100.kcal * k0).toFixed(1), fat: +(per100.fat * k0).toFixed(1),
      protein: +(per100.protein * k0).toFixed(1), carb: +(per100.carb * k0).toFixed(1),
      fiber: +((per100.fiber || 0) * k0).toFixed(1),
    };
  }
  // "Juice of 1 lime" states its own quantity in words, so nothing parsed off
  // the front of the line. The key supplies it.
  if (qty == null) {
    const dq = findKeyAny(forms, DEFAULT_QTY);
    if (dq) qty = DEFAULT_QTY[dq];
  }
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
  // recipes.json carries no serving count for the guacamole; its nutrition is
  // stated per 3/4 cup, so the count is the computed yield divided by 3/4.
  const y = YIELD[recipe.slug];
  const s = y ? y.servings : (recipe.servings || 1);
  const per = {
    calories: Math.round(tot.kcal / s), fat: Math.round(tot.fat / s),
    protein: Math.round(tot.protein / s), carbs: Math.round(tot.carb / s),
    fiber: Math.round(tot.fiber / s),
  };
  per.net_carbs = Math.max(0, per.carbs - per.fiber);
  return { rows, tot, per, servings: s, yield: y, stated: statedOf(recipe.full_text) };
}

function md(recipe) {
  const b = build(recipe);
  const L = [];
  L.push(`## ${recipe.title}`);
  L.push("");
  L.push(b.yield
    ? `\`${recipe.slug}\` · **servings: ${b.servings}** — not stated in the recipe; ${b.yield.why}`
    : `\`${recipe.slug}\` · **servings: ${b.servings}** (as stated in the recipe)`);
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
  "**Sources, in order of precedence.** Foundation Foods first — the newest, lab-measured data — wherever an entry exists for the food the recipe names. SR Legacy (2018-04) is the fallback. Foundation is 394 foods and was pulled in full via the API; SR Legacy is 7,793 foods, downloaded in full and indexed locally. One ingredient came from FDC Branded Foods and has since moved to Foundation.",
  "",
  "**Ingredients are mapped to what the recipe says**, never to a fattier cut or a near neighbour. Where a recipe names a food loosely, or offers a choice, the ingredient is flagged or the assumption is stated rather than resolved silently. A Foundation entry is used only when it describes the same food — where it describes a different one, the ingredient stays on SR Legacy and section 2b gives the reason.",
  "",
  "**Fiber.** Foundation does not report fiber for every food. Where it reports none, fiber is taken from the SR Legacy entry for the same ingredient and the row says so. For meat, cheese, cream and oil that fallback is zero either way.",
  "",
  "---",
  "",
];

/* The Foundation switch report. MACRO_BASELINE points at a dump produced by
 * a MACRO_NO_FOUNDATION=1 run, so the before column is a real run of this
 * same code rather than remembered numbers.
 */
function foundationSection() {
  const body = list.map(build);
  const sw = Object.values(SWITCHES).sort((a, b) => a.key.localeCompare(b.key));
  const L = [];
  L.push("\n---\n", "## Foundation-first: what changed\n");
  L.push("Jaime's rule, 2026-09-21 — use a Foundation entry whenever one exists for that food, SR Legacy only as fallback.\n");

  L.push("\n### 1. Ingredients that switched from SR Legacy to Foundation\n");
  L.push("Values are per 100 g. `Δ` is Foundation minus the previous source.\n");
  L.push("\n| Ingredient | Was | Fat | Protein | Carbs | Now | Fat | Protein | Carbs | Δ fat | Δ protein |");
  L.push("|---|---|--:|--:|--:|---|--:|--:|--:|--:|--:|");
  const d = (a, b) => { const v = +(b - a).toFixed(2); return (v > 0 ? "+" : "") + v; };
  sw.forEach((s) => L.push(`| ${s.key} | ${s.from.src} ${s.from.fdc}<br>${s.from.desc} | ${s.from.fat} | ${s.from.protein} | ${s.from.carb} | Foundation ${s.to.fdc}<br>${s.to.desc} | ${s.to.fat} | ${s.to.protein} | ${s.to.carb} | ${d(s.from.fat, s.to.fat)} | ${d(s.from.protein, s.to.protein)} |`));
  L.push(`\n**${sw.length} ingredients switched.**\n`);

  const stayed = {};
  body.forEach((b) => b.rows.forEach((x) => { if (x.src && x.src !== "Foundation") stayed[x.food] = x; }));
  const keys = Object.keys(stayed).sort();
  L.push("\n### 2. Ingredients still on SR Legacy — Foundation has no entry for the food\n");
  L.push("\n| Ingredient | Source | Entry used |");
  L.push("|---|---|---|");
  keys.forEach((k) => L.push(`| ${k} | ${stayed[k].src} ${stayed[k].fdc} | ${stayed[k].label} |`));
  L.push(`\n**${keys.length} ingredients stayed.** Foundation is only 394 foods, so most pantry items, oils, spices, sauces, broths and herbs simply are not in it.\n`);

  L.push("\n### 2b. Foundation has an entry, but for a different food — deliberately not switched\n");
  L.push("\n| Ingredient | Why it stayed |");
  L.push("|---|---|");
  Object.entries(FOUNDATION_REJECTED).forEach(([k, why]) => L.push(`| ${k} | ${why} |`));

  const basePath = process.env.MACRO_BASELINE;
  if (basePath && fs.existsSync(basePath)) {
    const base = JSON.parse(fs.readFileSync(basePath, "utf8")).per;
    const net = (p) => (p.net_carbs != null ? p.net_carbs : +(p.carbs - (p.fiber || 0)).toFixed(1));
    L.push("\n\n### 3. Per-serving change, every recipe that moved\n");
    L.push("\n| Recipe | Fat | Protein | Net carbs | Calories |");
    L.push("|---|---|---|---|---|");
    let n = 0;
    list.forEach((r, i) => {
      const a = body[i].per, b = base[r.slug];
      if (!b) return;
      if (a.fat === b.fat && a.protein === b.protein && net(a) === net(b) && a.calories === b.calories) return;
      n++;
      const c = (x, y, u) => (x === y ? `${x}${u}` : `${x}${u} → **${y}${u}**`);
      L.push(`| ${r.title} | ${c(b.fat, a.fat, "g")} | ${c(b.protein, a.protein, "g")} | ${c(net(b), net(a), "g")} | ${c(b.calories, a.calories, "")} |`);
    });
    L.push(`\n**${n} of ${list.length} recipes changed.** The before column is a real run with \`MACRO_NO_FOUNDATION=1\`, not a remembered figure.\n`);
  }
  return L.join("\n");
}

fs.writeFileSync(path.join(ROOT, "manuscript", "RECIPE_MACROS.md"),
  head.join("\n") + list.map(md).join("") + foundationSection(), "utf8");
console.log(`wrote manuscript/RECIPE_MACROS.md for ${list.length} recipe(s)`);

// MACRO_DUMP=<path> writes the per-serving numbers and the switch list as
// JSON, so before/after tables are diffed from two real runs.
if (process.env.MACRO_DUMP) {
  const out = { per: {}, switches: SWITCHES, sources: {} };
  list.forEach((r) => {
    const b = build(r);
    out.per[r.slug] = b.per;
    b.rows.forEach((x) => { if (x.src) out.sources[x.food] = { src: x.src, fdc: x.fdc, label: x.label }; });
    out.rows = out.rows || {};
    out.rows[r.slug] = b.rows.map((x) => ({
      raw: x.raw, food: x.food, kind: x.kind, unit: x.unit, qty: x.qty,
      grams: x.grams, label: x.label, note: x.note,
    }));
  });
  fs.writeFileSync(process.env.MACRO_DUMP, JSON.stringify(out, null, 1), "utf8");
}
list.forEach((r) => {
  const b = build(r);
  const f = b.rows.filter((x) => x.kind === "flag").length;
  console.log(`  ${r.slug.padEnd(40)} ${String(b.per.calories).padStart(5)} kcal  fat ${String(b.per.fat).padStart(3)}g  prot ${String(b.per.protein).padStart(3)}g` + (f ? `   ⚠ ${f} flagged` : ""));
});
