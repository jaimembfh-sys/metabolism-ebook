#!/usr/bin/env node
/**
 * Writes manuscript/WEIGHT_PROPOSALS.md - every ingredient line whose amount
 * is a COUNT rather than a weight or a volume ("2 ribeye steaks", "1 large
 * avocado", "3 bell peppers"), with the line as it stands and the line as it
 * would read with a weight on it.
 *
 * Proposals only. This script writes one markdown file and touches nothing
 * else - not recipes.json, not the recipe PDFs, not RECIPE_MACROS.md.
 *
 * Why these lines: the gram weight behind a count is an assumption the macro
 * tool makes silently, so a reader holding a different-sized avocado cannot
 * reproduce the numbers and cannot tell that they diverge.
 *
 * DRIFT, and why it is reported. report.js treats a weight stated in brackets
 * AFTER the food name as the line total, beating the count-times-typical-
 * weight it would otherwise infer (see e37e5ba). So applying a proposal
 * re-costs the recipe at the rounded weight.
 *
 * The recipes are written in whole ounces and quarter pounds - no grams, no
 * half ounces anywhere in the book - and a 70 g onion cannot be said in whole
 * ounces without moving 19%. Rather than break that voice, each amount is
 * rounded to whichever of whole ounces or quarter pounds lands closest, and
 * the consequence is measured rather than argued about: the projection below
 * costs every proposal through to the per-serving number a reader sees.
 *
 * Usage:
 *   MACRO_INDEX=<usda-index.json> MACRO_DUMP=<dump.json> node tools/macros/report.js
 *   MACRO_INDEX=<usda-index.json> node tools/macros/weight-proposals.js <dump.json>
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const DUMP = process.argv[2] || process.env.MACRO_DUMP;
if (!DUMP) {
  console.error("usage: node tools/macros/weight-proposals.js <dump.json>");
  console.error("(the dump is written by report.js with MACRO_DUMP set)");
  process.exit(1);
}
const D = JSON.parse(fs.readFileSync(DUMP, "utf8"));
const ROWS = D.rows;
const R = JSON.parse(fs.readFileSync(path.join(ROOT, "knowledge-base", "recipes.json"), "utf8")).recipes;
// Same divisor report.js uses: a YIELD entry overrides the recipe's own count
// where the recipe never stated one. Guacamole is 6.77 servings of 3/4 cup,
// not the 1 that recipes.json carries, and dividing by 1 would overstate the
// effect of a proposal on it by a factor of seven.
const { YIELD } = require("./assumptions.js");
const TITLE = {}, SERVINGS = {};
R.forEach((r) => {
  TITLE[r.slug] = r.title;
  SERVINGS[r.slug] = YIELD[r.slug] ? YIELD[r.slug].servings : (r.servings || 1);
});

// Nutrient lookup, so the projection costs a drift rather than guessing at it.
const FND = {}, SR = {};
JSON.parse(fs.readFileSync(path.join(__dirname, "foundation-index.json"), "utf8"))
  .foods.forEach((f) => (FND[f.fdc_id] = f));
if (process.env.MACRO_INDEX && fs.existsSync(process.env.MACRO_INDEX)) {
  JSON.parse(fs.readFileSync(process.env.MACRO_INDEX, "utf8")).foods.forEach((f) => (SR[f.fdc_id] = f));
}
function per100(food) {
  const s = D.sources[food];
  if (!s) return null;
  return (s.src === "Foundation" ? FND : SR)[s.fdc] || null;
}

const OZ = 28.3495, LB = 453.592;

// Units that already tell the reader an amount, so the line needs nothing.
const MEASURED = new Set(["g", "oz", "lb", "cup", "tbsp", "tsp", "ml", "l", "pint", "quart", "can", "jar"]);
const HAS_WEIGHT = /\b\d[\d./\s]*\s*[-\s]?\s*(g|grams?|oz|ounces?|lbs?|pounds?)\b/i;
const HAS_VOLUME = /\b(cups?|tbsp|tablespoons?|tsp|teaspoons?|pints?|quarts?|ml|litres?|liters?)\b/i;
// A bracket that spells out the amount - "(about 1 Tbsp)" - IS the amount.
const BRACKET_AMOUNT = /\(\s*(about|approx\w*)\b[^)]*\b(tbsp|tablespoons?|tsp|teaspoons?|cups?|oz|ounces?|g|grams?|lbs?)\b/i;

// Below this a weight on the line is noise: a garlic clove, a squeeze of lime.
const MIN_G = 30;

/* Counts that already carry a standard size. "1 large egg" is a defined 50 g
 * in USDA's tables and on every carton sold, so the reader can already
 * reproduce the number and a weight adds clutter. Held back rather than
 * dropped, so the call stays Jaime's.
 */
const STANDARD_SIZE = /\b(eggs?|egg yolks?|egg whites?)\b/i;

/* ---- rounding ----
 * Candidates are whole ounces and quarter pounds, the two forms the recipes
 * already use. The closest to the computed weight wins; a tie goes to pounds
 * once the line is over a pound, matching "1 1/2 lbs chicken thighs".
 */
const FRACTION = { 0: "", 0.25: " 1/4", 0.5: " 1/2", 0.75: " 3/4" };

function lbText(quarters) {
  const whole = Math.floor(quarters / 4), frac = (quarters % 4) / 4;
  if (whole === 0) return (frac === 0.25 ? "1/4" : frac === 0.5 ? "1/2" : "3/4") + " lb";
  return whole + FRACTION[frac] + (whole === 1 && frac === 0 ? " lb" : " lbs");
}

/* Pounds once the line reaches a pound, ounces below it. Closest-rounding
 * would sometimes prefer ounces above a pound - 1000 g is nearer 35 oz than
 * 2 1/4 lbs - but the book has no such line. Its fresh produce above a pound
 * is "1 lb", "1 1/2 lbs", "2 lbs", "2 1/2 lbs", and a recipe that asked for
 * 35 oz of spaghetti squash would read as though it came from a spreadsheet.
 * The coarser rounding that costs is shown as drift and carried into the
 * projection.
 */
function amountText(grams) {
  if (grams >= LB) {
    const q = Math.max(4, Math.round((grams / LB) * 4));
    return { text: lbText(q), g: (q / 4) * LB, unit: "lb" };
  }
  const oz = Math.round(grams / OZ);
  if (oz >= 1) return { text: oz + " oz", g: oz * OZ, unit: "oz" };
  return { text: Math.round(grams) + " g", g: Math.round(grams), unit: "g" };
}

/* Insert at the first comma NOT inside brackets, so a parenthetical like
 * "3 bell peppers (red, yellow, green, or orange)" is not split open. Where
 * the food name is already followed by such a bracket, the weight joins it
 * rather than opening a second one - "(red, yellow, or orange, about 13 oz)"
 * reads, "(red, yellow, or orange) (about 13 oz)" does not.
 */
function propose(raw, grams) {
  const amt = amountText(grams);
  let depth = 0, cut = raw.length, openAt = -1, closeAt = -1;
  for (let i = 0; i < raw.length; i++) {
    const c = raw[i];
    if (c === "(" || c === "[") { depth++; if (depth === 1 && closeAt === -1) openAt = i; }
    else if (c === ")" || c === "]") { depth--; if (depth === 0 && closeAt === -1) closeAt = i; }
    else if (c === "," && depth === 0) { cut = i; break; }
  }
  // Only merge into a bracket that sits before the first top-level comma and
  // describes the food (a colour list, a variety) - not a trailing aside such
  // as "(optional)" or "(from prep step)".
  if (closeAt > 0 && closeAt < cut && openAt > 0) {
    const inner = raw.slice(openAt + 1, closeAt);
    if (!/\b(optional|from|start with|if using|or\s+\d)\b/i.test(inner)) {
      return { text: raw.slice(0, closeAt) + ", about " + amt.text + raw.slice(closeAt), amt };
    }
  }
  return { text: raw.slice(0, cut) + " (about " + amt.text + ")" + raw.slice(cut), amt };
}

// ---- select ----
const props = [], standard = [], small = [];
Object.entries(ROWS).forEach(([slug, rows]) => {
  rows.forEach((x) => {
    if ((x.kind !== "ok" && x.kind !== "ok-ambiguous") || !x.grams) return;
    if (x.unit && MEASURED.has(x.unit)) return;
    if (HAS_WEIGHT.test(x.raw)) return;
    if (BRACKET_AMOUNT.test(x.raw)) return;
    // The volume test ignores parentheticals, so "6 slices bacon (or 1/3 cup
    // bacon bits)" still qualifies: it is counted in slices and the bracketed
    // alternative should not disqualify it.
    if (HAS_VOLUME.test(x.raw.replace(/\(.*?\)/g, ""))) return;
    const p = propose(x.raw, x.grams);
    const rec = {
      slug, recipe: TITLE[slug] || slug, food: x.food, current: x.raw, proposed: p.text,
      grams: x.grams, stated_g: +p.amt.g.toFixed(1),
      drift_g: +(p.amt.g - x.grams).toFixed(1),
      drift_pct: +(((p.amt.g - x.grams) / x.grams) * 100).toFixed(1),
    };
    if (x.grams < MIN_G) small.push(rec);
    else if (STANDARD_SIZE.test(x.raw)) standard.push(rec);
    else props.push(rec);
  });
});

// ---- project: what applying section 1 would do to the published numbers ----
const impact = {};
props.forEach((p) => {
  const n = per100(p.food);
  const a = impact[p.slug] = impact[p.slug] || { kcal: 0, carb: 0, fiber: 0, fat: 0, protein: 0, lines: 0, unpriced: 0 };
  a.lines++;
  if (!n) { a.unpriced++; return; }
  const k = (p.stated_g - p.grams) / 100;
  a.kcal += (n.kcal || 0) * k; a.carb += (n.carb || 0) * k;
  a.fiber += (n.fiber || 0) * k; a.fat += (n.fat || 0) * k; a.protein += (n.protein || 0) * k;
});
const projected = Object.entries(impact).map(([slug, a]) => {
  const s = SERVINGS[slug], cur = D.per[slug] || {};
  const dk = a.kcal / s, dn = (a.carb - a.fiber) / s;
  return {
    slug, recipe: TITLE[slug] || slug, servings: s, lines: a.lines, unpriced: a.unpriced,
    kcal: cur.calories, new_kcal: Math.round((cur.calories || 0) + dk),
    net: cur.net_carbs, new_net: Math.round((cur.net_carbs || 0) + dn),
    d_kcal: +dk.toFixed(1),
  };
}).sort((a, b) => Math.abs(b.d_kcal) - Math.abs(a.d_kcal));
const moved = projected.filter((p) => p.new_kcal !== p.kcal || p.new_net !== p.net);
const big = projected.filter((p) => Math.abs(p.d_kcal) >= 5);

// ---- write ----
const L = [];
const nRecipes = new Set(props.map((x) => x.slug)).size;
const worst = props.reduce((a, b) => (Math.abs(b.drift_pct) > Math.abs(a.drift_pct) ? b : a), { drift_pct: 0 });

L.push("# Weight proposals — ingredient lines with no stated weight");
L.push("");
L.push("Generated by `tools/macros/weight-proposals.js` from a `report.js` dump.");
L.push("**Proposals only — nothing here has been applied to `recipes.json` or any recipe.**");
L.push("");
L.push("These are the lines where the amount is a count rather than a weight or a volume,");
L.push("so the gram weight behind the macros is an assumption the tool makes rather than");
L.push("something a reader can see. The proposed line adds that weight and changes nothing");
L.push("else.");
L.push("");
L.push("## What you are approving");
L.push("");
L.push("- **" + props.length + " proposals** across " + nRecipes + " recipes — section 1.");
L.push("- **" + standard.length + " lines held back** where the count already carries a standard size — section 2.");
L.push("- **" + small.length + " lines left alone** under " + MIN_G + " g, where a weight would be noise — section 3.");
L.push("");
L.push("Applying a proposal **changes the macros**. A weight in brackets after the food");
L.push("name becomes the line total, beating the count-times-typical-weight the tool");
L.push("infers now, so a rounded amount moves the number. The recipes are written in whole");
L.push("ounces and quarter pounds — there is no gram and no half ounce anywhere in the");
L.push("book — and a 70 g onion cannot be said in whole ounces without moving 19%.");
L.push("");
L.push("That sounds worse than it is, because the lines that round badly are the ones that");
L.push("carry almost no calories. Costed through to the plate:");
L.push("");
L.push("- Largest drift on any single line: **" + (worst.drift_pct > 0 ? "+" : "") + worst.drift_pct + "%** (" + worst.current.slice(0, 40) + ").");
L.push("- Recipes whose published per-serving numbers would move at all: **" + moved.length + " of " + projected.length + "**.");
L.push("- Recipes moving by 5 kcal or more per serving: **" + big.length + "**" + (big.length ? " — " + big.map((p) => p.recipe).join(", ") + "." : "."));
L.push("");
L.push("Full projection in section 4.");
L.push("");
L.push("---");
L.push("");
L.push("## 1. Proposed");
L.push("");

let last = "";
props.forEach((x) => {
  if (x.slug !== last) {
    const p = projected.find((q) => q.slug === x.slug);
    L.push("");
    L.push("### " + x.recipe);
    if (p) {
      L.push("");
      L.push("*Per serving if applied: " + p.kcal + " → " + p.new_kcal + " kcal, net carbs " +
        p.net + " → " + p.new_net + " g.*");
    }
    L.push("");
    last = x.slug;
  }
  const d = x.drift_g === 0 ? "no change"
    : (x.drift_g > 0 ? "+" : "") + x.drift_g + " g (" + (x.drift_pct > 0 ? "+" : "") + x.drift_pct + "%)";
  L.push("| | |");
  L.push("|---|---|");
  L.push("| current | " + x.current + " |");
  L.push("| **proposed** | **" + x.proposed + "** |");
  L.push("| basis | " + x.grams + " g computed → " + x.stated_g + " g stated · drift " + d + " |");
  L.push("");
});

L.push("---");
L.push("");
L.push("## 2. Held back — the count already carries a standard size");
L.push("");
L.push("A large egg is 50 g in USDA's tables and on the carton, so these lines are already");
L.push("reproducible and a weight mostly adds clutter. Shown in case you want them anyway.");
L.push("");
L.push("| Recipe | Current | Would become |");
L.push("|---|---|---|");
standard.forEach((x) => L.push("| " + x.recipe + " | " + x.current + " | " + x.proposed + " |"));
L.push("");
L.push("---");
L.push("");
L.push("## 3. Left alone — under " + MIN_G + " g");
L.push("");
L.push("A weight here would be noise, and in several cases longer than the ingredient.");
L.push("");
L.push("| Recipe | Line | Computed |");
L.push("|---|---|---|");
small.forEach((x) => L.push("| " + x.recipe + " | " + x.current + " | " + x.grams + " g |"));
L.push("");
L.push("---");
L.push("");
L.push("## 4. Projection — every recipe, if section 1 is applied in full");
L.push("");
L.push("`=` means the published number does not move.");
L.push("");
L.push("| Recipe | Servings | Lines | Calories | Net carbs |");
L.push("|---|---|---|---|---|");
projected.forEach((p) => {
  L.push("| " + p.recipe + " | " + p.servings + " | " + p.lines + " | " +
    (p.new_kcal === p.kcal ? p.kcal + " `=`" : p.kcal + " → **" + p.new_kcal + "**") + " | " +
    (p.new_net === p.net ? p.net + " `=`" : p.net + " → **" + p.new_net + "**") + " |");
});
L.push("");

fs.writeFileSync(path.join(ROOT, "manuscript", "WEIGHT_PROPOSALS.md"), L.join("\n") + "\n", "utf8");
// WEIGHT_PROPOSALS_JSON=<path> also writes the rows as JSON, for checking the
// projection independently of the markdown.
if (process.env.WEIGHT_PROPOSALS_JSON) {
  fs.writeFileSync(process.env.WEIGHT_PROPOSALS_JSON, JSON.stringify({ props, standard, small, projected }, null, 1), "utf8");
}
console.log("wrote manuscript/WEIGHT_PROPOSALS.md");
console.log("  proposed:   " + props.length + " lines across " + nRecipes + " recipes");
console.log("  held back:  " + standard.length + " (standard size)   left alone: " + small.length + " (under " + MIN_G + " g)");
console.log("  published numbers that would move: " + moved.length + " of " + projected.length +
  "; by 5+ kcal: " + big.length);
const unpriced = projected.filter((p) => p.unpriced);
if (unpriced.length) console.log("  WARNING unpriced lines in: " + unpriced.map((p) => p.slug).join(", "));
