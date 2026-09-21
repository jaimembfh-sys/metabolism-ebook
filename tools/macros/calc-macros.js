// Recalculates recipe macros per ingredient from USDA SR Legacy, showing the
// work. Nothing is estimated: an ingredient either resolves to an fdc_id and a
// gram weight, or it is FLAGGED and excluded from the total.
const fs = require("fs");
const path = require("path");
const { MAP, NEGLIGIBLE, FLAGGED, verifyMap } = require("./usda-map.js");

const USDA = JSON.parse(fs.readFileSync(__dirname + "/usda-index.json", "utf8"));
const BY_ID = {};
USDA.foods.forEach((f) => (BY_ID[f.fdc_id] = f));
verifyMap(BY_ID); // throws if any id drifted

const FRAC = { "¼": 0.25, "½": 0.5, "¾": 0.75, "⅓": 1 / 3, "⅔": 2 / 3, "⅛": 0.125 };

function parseQty(s) {
  if (!s) return null;
  let t = s.trim();
  for (const [g, v] of Object.entries(FRAC)) t = t.replace(g, " " + v + " ");
  t = t.trim();
  // "1 1/2" or "1/2" or "1.5" or "2"
  let total = 0, any = false;
  t.split(/\s+/).forEach((tok) => {
    if (!tok) return;
    if (/^\d+\/\d+$/.test(tok)) { const [a, b] = tok.split("/").map(Number); total += a / b; any = true; }
    else if (/^\d*\.?\d+$/.test(tok)) { total += parseFloat(tok); any = true; }
  });
  return any ? total : null;
}

const UNIT_ALIAS = {
  tbsp: "tbsp", tbsps: "tbsp", tablespoon: "tbsp", tablespoons: "tbsp",
  tsp: "tsp", tsps: "tsp", teaspoon: "tsp", teaspoons: "tsp",
  cup: "cup", cups: "cup", c: "cup",
  oz: "oz", ozs: "oz", ounce: "oz", ounces: "oz",
  lb: "lb", lbs: "lb", pound: "lb", pounds: "lb",
  g: "g", gram: "g", grams: "g",
  clove: "clove", cloves: "clove",
  slice: "slice", slices: "slice",
  rib: "rib", ribs: "rib",
  large: "large", medium: "medium", small: "small",
};

const UNIT_RE = new RegExp("^(" + Object.keys(UNIT_ALIAS).join("|") + ")\\b", "i");

function normaliseFood(s) {
  return s
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\(.*?\)/g, "")
    .split(",")[0]
    .replace(/\b(chopped|diced|minced|shredded|crumbled|grated|halved|cubed|melted|softened|divided|optional|to taste|for garnish|for sprinkling|heaping|packed|plus more)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

// A line that refers back to something already counted in an earlier step -
// "Hard-boiled eggs (from step 1)", "Remaining salt and pepper". Counting
// these would double the ingredient. Zeroed deliberately, not flagged.
function isBackReference(raw) {
  return /\bfrom step\b|\bremaining\b|\breserved\b|\bfrom above\b|\(from /i.test(raw);
}

// Garnishes and opt-ins with no quantity. Jaime's format marks them
// "optional"; they are not part of the stated per-serving number.
function isOptionalNoQty(raw, qty) {
  return qty == null && /\boptional\b|for garnish|for sprinkling|to taste|for serving/i.test(raw);
}

function lookupFood(name) {
  if (MAP[name]) return MAP[name];
  // try progressively shorter forms, longest key first so "olive oil" beats "oil"
  const keys = Object.keys(MAP).sort((a, b) => b.length - a.length);
  for (const k of keys) if (name.includes(k)) return MAP[k];
  return null;
}

function isNegligible(name) {
  return NEGLIGIBLE.some((n) => name === n || name.includes(n));
}

/** Resolve one ingredient line to grams + macros, or a flag. */
function resolveLine(line) {
  const raw = line.replace(/^\s*[-*]\s*/, "").trim();
  let rest = raw;

  const qtyM = rest.match(/^([\d¼½¾⅓⅔⅛/.\s]+)/);
  const qty = qtyM ? parseQty(qtyM[1]) : null;
  if (qtyM) rest = rest.slice(qtyM[0].length);

  const uM = rest.trim().match(UNIT_RE);
  let unit = uM ? UNIT_ALIAS[uM[1].toLowerCase()] : null;
  if (uM) rest = rest.trim().slice(uM[0].length);

  const food = normaliseFood(rest);
  if (!food) return { raw, skip: true, reason: "no food name" };

  const ZERO = { grams: 0, kcal: 0, fat: 0, protein: 0, carb: 0, fiber: 0 };
  if (isBackReference(raw)) return { raw, food, backref: true, ...ZERO };
  if (isOptionalNoQty(raw, qty)) return { raw, food, optional: true, ...ZERO };
  if (isNegligible(food)) return { raw, food, negligible: true, ...ZERO };

  for (const k of Object.keys(FLAGGED)) if (food.includes(k)) return { raw, food, flag: FLAGGED[k] };
  const entry = lookupFood(food);
  if (!entry) return { raw, food, flag: "NO USDA MATCH" };

  const nut = BY_ID[entry.fdc];
  if (!nut) return { raw, food, flag: "fdc_id " + entry.fdc + " not in index" };

  // unitless counts ("2 boneless ribeye steaks", "5 eggs") -> "each"
  if (!unit) unit = "each";
  let g = null;
  if (unit === "g") g = qty;
  else if (entry.grams && entry.grams[unit] != null && qty != null) g = qty * entry.grams[unit];
  else if (entry.grams && entry.grams.each != null && qty != null) g = qty * entry.grams.each;

  if (g == null) return { raw, food, flag: "NO GRAM WEIGHT for unit '" + unit + "'" + (qty == null ? " (no quantity)" : "") };

  const k = g / 100;
  return {
    raw, food, fdc: entry.fdc, usda: entry.expect, qty, unit, grams: +g.toFixed(1),
    kcal: +(nut.kcal * k).toFixed(1),
    fat: +(nut.fat * k).toFixed(1),
    protein: +(nut.protein * k).toFixed(1),
    carb: +(nut.carb * k).toFixed(1),
    fiber: +((nut.fiber || 0) * k).toFixed(1),
    note: entry.note || null,
  };
}

function calcRecipe(recipe) {
  const ingBlock = recipe.full_text.split(/##\s*Instructions/i)[0] || "";
  const lines = ingBlock.split(/\r?\n/).filter((l) => /^\s*[-*]\s+/.test(l));

  const rows = lines.map(resolveLine).filter((r) => !r.skip);

  // A named ingredient appearing twice (e.g. "1 Tbsp avocado oil" in two
  // steps) is counted twice on purpose - both go in the pan.
  const tot = { kcal: 0, fat: 0, protein: 0, carb: 0, fiber: 0 };
  rows.forEach((r) => {
    if (r.flag) return;
    tot.kcal += r.kcal; tot.fat += r.fat; tot.protein += r.protein;
    tot.carb += r.carb; tot.fiber += r.fiber;
  });

  const s = recipe.servings || 1;
  const per = {
    calories: Math.round(tot.kcal / s),
    fat: Math.round(tot.fat / s),
    protein: Math.round(tot.protein / s),
    carbs: Math.round(tot.carb / s),
    fiber: Math.round(tot.fiber / s),
  };
  per.net_carbs = Math.max(0, per.carbs - per.fiber);

  return { slug: recipe.slug, servings: s, rows, total: tot, per, flags: rows.filter((r) => r.flag) };
}

function parseStated(text) {
  const sec = text.split(/##\s*Nutrition/i)[1];
  if (!sec) return null;
  const get = (l) => {
    const m = sec.match(new RegExp("^\\s*[-*]\\s*" + l + "\\s*:\\s*([\\d.]+)", "im"));
    return m ? parseFloat(m[1]) : null;
  };
  return {
    calories: get("Calories"), fat: get("Total Fat"), protein: get("Protein"),
    carbs: get("Total Carbs"), fiber: get("Fiber"), net_carbs: get("Net Carbs"),
  };
}

module.exports = { calcRecipe, parseStated, resolveLine };

if (require.main === module) {
  const R = JSON.parse(fs.readFileSync("C:/Projects/metabolism ebook/knowledge-base/recipes.json", "utf8"));
  const want = process.argv.slice(2);
  const list = want.length ? R.recipes.filter((r) => want.includes(r.slug)) : R.recipes;

  list.forEach((r) => {
    const c = calcRecipe(r);
    const old = parseStated(r.full_text) || {};
    console.log("\n" + "=".repeat(90));
    console.log(`${r.title}   (${c.servings} servings)`);
    console.log("=".repeat(90));
    console.log("ingredient".padEnd(34) + "grams".padStart(8) + "kcal".padStart(8) + "fat".padStart(7) + "prot".padStart(7) + "carb".padStart(7) + "  USDA");
    c.rows.forEach((row) => {
      if (row.flag) { console.log("  ⚠ " + row.food.padEnd(31) + "  FLAGGED: " + row.flag); return; }
      if (row.backref) { console.log('    ' + row.food.slice(0,30).padEnd(31) + '       —       —      —      —      —   (back-reference, already counted)'); return; }
      if (row.optional) { console.log('    ' + row.food.slice(0,30).padEnd(31) + '       —       —      —      —      —   (optional, no quantity)'); return; }
      if (row.negligible) { console.log("    " + row.food.padEnd(31) + "       —       —      —      —      —   (negligible)"); return; }
      console.log(
        "    " + row.food.slice(0, 30).padEnd(31) +
        String(row.grams).padStart(7) + String(Math.round(row.kcal)).padStart(8) +
        String(row.fat.toFixed(1)).padStart(7) + String(row.protein.toFixed(1)).padStart(7) +
        String(row.carb.toFixed(1)).padStart(7) + "  " + String(row.fdc) + " " + row.usda.slice(0, 34)
      );
    });
    console.log("  " + "-".repeat(88));
    console.log("    RECIPE TOTAL".padEnd(33) + String(Math.round(c.total.kcal)).padStart(9) +
      String(c.total.fat.toFixed(1)).padStart(7) + String(c.total.protein.toFixed(1)).padStart(7) + String(c.total.carb.toFixed(1)).padStart(7));
    console.log();
    const cmp = (label, o, n) => {
      const d = o != null ? n - o : null;
      const pct = o ? ((n - o) / o) * 100 : null;
      console.log("    " + label.padEnd(12) + "was " + String(o ?? "—").padStart(5) + "   now " + String(n).padStart(5) +
        (d != null ? "   " + (d > 0 ? "+" : "") + d + (pct != null ? "  (" + (pct > 0 ? "+" : "") + pct.toFixed(0) + "%)" : "") : ""));
    };
    cmp("Calories", old.calories, c.per.calories);
    cmp("Fat (g)", old.fat, c.per.fat);
    cmp("Protein (g)", old.protein, c.per.protein);
    cmp("Carbs (g)", old.carbs, c.per.carbs);
    cmp("Fiber (g)", old.fiber, c.per.fiber);
    if (c.flags.length) console.log("\n    ⚠ " + c.flags.length + " ingredient(s) flagged and EXCLUDED from the total above.");
  });
}
