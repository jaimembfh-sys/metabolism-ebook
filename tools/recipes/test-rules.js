#!/usr/bin/env node
/**
 * Every binding rule, tested deterministically. No API calls, no model, no
 * cost — a rule that only holds on average is not a rule, and a regex change
 * is verified by running the regex, not by asking a model what it thinks.
 *
 * Covers:
 *   1. the allergen vocabulary, term by term, including every one of Jaime's
 *      2026-09-22 decisions and the behaviour each replaced
 *   2. index.html's inline ALLERGEN_TERMS matching tools/allergens.js exactly
 *   3. the recipe tags that result
 *   4. the disordered-eating scrub
 *   5. the meal slot enum
 *   6. the allergen pool filter and meal-plan violation check
 *
 * Usage: node tools/recipes/test-rules.js
 * Exit code 1 if anything fails.
 */
const fs = require("fs");
const path = require("path");
const ROOT = path.resolve(__dirname, "..", "..");
const A = require(path.join(ROOT, "tools", "allergens.js"));

let pass = 0;
const failures = [];

function check(name, actual, expected) {
  const a = JSON.stringify(actual), e = JSON.stringify(expected);
  if (a === e) { pass++; return true; }
  failures.push({ name, expected: e, actual: a });
  return false;
}
function section(t) { console.log("\n" + t); }

// ---------------------------------------------------------------------------
section("1. Allergen vocabulary — Jaime's decisions 2026-09-22");

const T = A.ALLERGEN_TERMS;
const hits = (allergen, s) => T[allergen].test(s);

// decision 3 — peanut butter is not dairy
check('dairy: "1 Tbsp peanut butter" → no', hits("dairy", "1 Tbsp peanut butter"), false);
check('dairy: "2/3 cup natural creamy peanut butter" → no', hits("dairy", "2/3 cup natural creamy peanut butter (no sugar added)"), false);
check('dairy: "sunflower seed butter" → no', hits("dairy", "3 Tbsp sunflower butter"), false);
// …without breaking real dairy
check('dairy: "1/4 cup butter" → yes', hits("dairy", "1/4 cup butter"), true);
check('dairy: "5 oz feta cheese" → yes', hits("dairy", "5 oz feta cheese, cut into cubes"), true);
check('dairy: "8 oz cream cheese" → yes', hits("dairy", "8 oz cream cheese, cubed"), true);
check('dairy: "1 cup heavy cream" → yes', hits("dairy", "1/2 cup heavy cream"), true);
// …and without re-breaking the plant milks
check('dairy: "coconut milk" → no', hits("dairy", "13.5 oz canned unsweetened coconut milk"), false);
check('dairy: "almond milk" → no', hits("dairy", "1 cup almond milk"), false);
check('dairy: "coconut cream" → no', hits("dairy", "1/2 cup coconut cream"), false);

// decision 4 — the flour rule narrows
check('gluten: "coconut flour" → no', hits("gluten", "1/2 cup coconut flour"), false);
check('gluten: "almond flour" → no', hits("gluten", "2 cups almond flour"), false);
check('gluten: "cassava flour" → no', hits("gluten", "1 cup cassava flour"), false);
check('gluten: bare "flour" → yes', hits("gluten", "2 cups flour"), true);
check('gluten: "wheat flour" → yes', hits("gluten", "2 cups wheat flour"), true);
check('gluten: "all-purpose flour" → yes', hits("gluten", "2 cups all-purpose flour"), true);
// …without breaking the rest of the gluten list
check('gluten: "bread" → yes', hits("gluten", "2 slices bread"), true);
check('gluten: "pasta" → yes', hits("gluten", "8 oz pasta"), true);
check('gluten: "oats" → yes', hits("gluten", "1 cup oats"), true);
check('gluten: "gluten-free bread" → no', hits("gluten", "2 slices gluten-free bread"), false);

// decision 4 second half — almond flour still tags nuts
check('nuts: "almond flour" → yes', hits("nuts", "2 cups almond flour"), true);
// decision 5 — peanut stays under nuts
check('nuts: "peanut butter" → yes', hits("nuts", "1 Tbsp peanut butter"), true);
check('nuts: "macadamia" → yes', hits("nuts", "1 cup raw macadamia nuts"), true);

// decisions 1 and 2 — tamari and worcestershire join soy
check('soy: "tamari" → yes', hits("soy", "6 Tbsp tamari"), true);
check('soy: "worcestershire" → yes', hits("soy", "2 tsp Worcestershire sauce"), true);
check('soy: "tofu" → yes', hits("soy", "14 oz tofu"), true);
check('soy: "coconut aminos" alone → no', hits("soy", "1/4 cup coconut aminos"), false);

// shellfish untouched
check('shellfish: "shrimp" → yes', hits("shellfish", "1 lb large raw shrimp"), true);
check('shellfish: "oyster sauce" → yes', hits("shellfish", "2 Tbsp oyster sauce"), true);
check('shellfish: "fish sauce" → no (not shellfish)', hits("shellfish", "4 tsp fish sauce"), false);

// decision 1 — the swappable fork
check("soy_swappable: 'tamari or coconut aminos' → swappable", A.SOY_SWAPPABLE.test.test("6 Tbsp tamari or coconut aminos"), true);
check("soy_swappable: 'tamari' alone → not swappable", A.SOY_SWAPPABLE.test.test("6 Tbsp tamari"), false);

// ---------------------------------------------------------------------------
section("2. index.html inline copy matches tools/allergens.js");

const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
function inlineConst(name) {
  // index.html is CRLF, so the terminator is ";\r\n" — matching ";\n" finds
  // nothing and reports a false drift.
  const m = html.match(new RegExp("const " + name + " = ([^\\r\\n]*?);\\r?\\n"));
  return m ? m[1].trim() : null;
}
const inlinePlant = inlineConst("PLANT_PREFIX");
check("PLANT_PREFIX inline matches", inlinePlant, JSON.stringify(A.PLANT_PREFIX));
const inlineNonGluten = inlineConst("NON_GLUTEN_FLOUR");
check("NON_GLUTEN_FLOUR inline matches", inlineNonGluten, JSON.stringify(A.NON_GLUTEN_FLOUR));
for (const k of Object.keys(A.ALLERGEN_TERMS)) {
  // Single line only: a [\s\S] match runs past the end of the entry and
  // swallows the next one. The trailing comma is optional — shellfish is the
  // last entry in the object and has none.
  const m = html.match(new RegExp("\\n\\s*" + k + ": (new RegExp\\([^\\r\\n]*?\\)|/[^\\r\\n]*?/i),?\\s*\\r?\\n"));
  const found = m ? m[1].trim().replace(/,$/, "") : "(not found in index.html)";
  // Compare the compiled source, which is what actually matters.
  let compiled = null;
  try {
    compiled = new Function("PLANT_PREFIX", "NON_GLUTEN_FLOUR", "return (" + found + ");")(A.PLANT_PREFIX, A.NON_GLUTEN_FLOUR).source;
  } catch (e) { compiled = "(could not evaluate: " + e.message + ")"; }
  check("ALLERGEN_TERMS." + k + " inline matches", compiled, A.ALLERGEN_TERMS[k].source);
}

// ---------------------------------------------------------------------------
section("3. Recipe tags");

const corpus = JSON.parse(fs.readFileSync(path.join(ROOT, "knowledge-base", "recipes.json"), "utf8"));
const bySlug = {};
corpus.recipes.forEach((r) => (bySlug[r.slug] = r));
const tagsOf = (s) => (bySlug[s] ? bySlug[s].allergens : ["(missing recipe)"]);

check("thai-panang: dairy dropped, nuts kept", tagsOf("thai-panang-chicken-curry"), ["nuts"]);
check("thai-slaw: dairy dropped, nuts kept", tagsOf("thai-slaw-with-peanut-dressing"), ["nuts"]);
check("keto-peanut-butter-balls: dairy+gluten dropped", tagsOf("keto-peanut-butter-balls"), ["nuts"]);
check("keto-chicken-parmesan: gluten dropped, dairy+nuts kept", tagsOf("keto-chicken-parmesan"), ["dairy", "nuts"]);
check("fluffy-coconut-keto-pancakes: gluten dropped", tagsOf("fluffy-coconut-keto-pancakes"), ["dairy"]);
check("beef-and-broccoli: tamari is swappable, not binding soy", tagsOf("beef-and-broccoli"), []);
check("beef-and-broccoli: carries the swap instruction",
  !!(bySlug["beef-and-broccoli"] && bySlug["beef-and-broccoli"].soy_swappable), true);
check("shrimp-scampi: shellfish kept", tagsOf("shrimp-scampi-with-zucchini-noodles").includes("shellfish"), true);
check("greek-salad: dairy kept", tagsOf("greek-salad"), ["dairy"]);
check("every recipe has a page", corpus.recipes.every((r) => /^\/recipes-html\/.+\.html$/.test(r.page || "")), true);

// ---------------------------------------------------------------------------
// Sections 4-6 are filled in as those rules land; each require() is guarded so
// this file runs green before and after.
section("4-6. Runtime rules (scrub, slots, pool filter)");
let runtime = null;
try { runtime = require(path.join(ROOT, "tools", "recipes", "coach-rules-lib.js")); }
catch (e) { console.log("   coach-rules-lib.js not present yet — skipped"); }

if (runtime) {
  // 4. disordered-eating scrub
  const plan = {
    days: [{ day_label: "Day 1", meals: [{
      slot: "Breakfast", title: "Avocado Egg Bake", source: "shared_recipe",
      description: "A 308-calorie start with 28g of fat.",
      macros_note: "~308 cal, 8g protein", macros: { calories: 308, protein_g: 8, carbs_g: 10, fat_g: 28 },
      coaching_note: "Try cutting back to 200 calories.",
    }] }],
    rationale: "This week averages 1,800 calories a day across 3 meals.",
    allergy_note: null,
  };
  const scrubbed = runtime.scrubNumbersIfFlagged(plan, true);
  check("scrub: macros nulled", scrubbed.days[0].meals[0].macros, null);
  check("scrub: macros_note nulled", scrubbed.days[0].meals[0].macros_note, null);
  check("scrub: no digit in description", /\d/.test(scrubbed.days[0].meals[0].description), false);
  check("scrub: no digit in coaching_note", /\d/.test(scrubbed.days[0].meals[0].coaching_note || ""), false);
  check("scrub: no digit in rationale", /\d/.test(scrubbed.rationale), false);
  check("scrub: day_label keeps its number", scrubbed.days[0].day_label, "Day 1");
  const untouched = runtime.scrubNumbersIfFlagged(plan, false);
  check("scrub: unflagged plan untouched", untouched.days[0].meals[0].macros_note, "~308 cal, 8g protein");
  check("scrub: description never left null (it is required)",
    typeof scrubbed.days[0].meals[0].description === "string" && scrubbed.days[0].meals[0].description.length > 0, true);
  check("scrub: surviving sentence kept verbatim",
    runtime.scrubText("A 308-calorie start with 28g of fat. Creamy baked avocado with a soft egg."),
    "Creamy baked avocado with a soft egg.");
  check("scrub: cooking numbers survive",
    runtime.scrubText("Roast at 400°F for 25 minutes, then rest 5 minutes."),
    "Roast at 400°F for 25 minutes, then rest 5 minutes.");
  check("scrub: measurements survive",
    runtime.scrubText("Use 1/2 cup coconut milk and 2 Tbsp peanut butter."),
    "Use 1/2 cup coconut milk and 2 Tbsp peanut butter.");
  check("scrub: all-numeric text returns null, not a stump",
    runtime.scrubText("~450 cal, 35g protein"), null);
  check("scrub: nutrition panels stripped from pool text",
    /Calories:/.test(runtime.stripNutritionPanels("## Nutrition\n\n### Per serving\n- Calories: 356\n\n## Notes\nx")), false);

  // 5. slot enum
  check("slots: rule_of_3s", runtime.slotsFor("rule_of_3s"), ["Breakfast", "Lunch", "Dinner"]);
  check("slots: time_restricted_eating", runtime.slotsFor("time_restricted_eating"), ["First Meal", "Last Meal"]);
  check("slots: carb_backloading", runtime.slotsFor("carb_backloading"), ["Breakfast", "Lunch", "Dinner"]);
  check("slots: snack rejected", runtime.findSlotViolations(
    { days: [{ day_label: "Day 1", meals: [{ slot: "Afternoon Snack" }] }] }, "rule_of_3s").length > 0, true);
  check("slots: valid plan passes", runtime.findSlotViolations(
    { days: [{ day_label: "Day 1", meals: [{ slot: "Breakfast" }, { slot: "Lunch" }, { slot: "Dinner" }] }] }, "rule_of_3s").length, 0);
  check("slots: 4 meals rejected", runtime.findSlotViolations(
    { days: [{ day_label: "Day 1", meals: [{ slot: "Breakfast" }, { slot: "Lunch" }, { slot: "Dinner" }, { slot: "Supper" }] }] }, "rule_of_3s").length > 0, true);

  // 6. pool filter + meal-plan violations
  const pool = corpus.recipes;
  const dairyFree = runtime.filterPoolByAllergies(pool, ["dairy"]);
  check("pool: no dairy recipe survives a dairy allergy",
    dairyFree.some((r) => (r.allergens || []).includes("dairy")), false);
  check("pool: thai-panang survives a dairy allergy (peanut butter is not dairy)",
    dairyFree.some((r) => r.slug === "thai-panang-chicken-curry"), true);
  const soyFree = runtime.filterPoolByAllergies(pool, ["soy"]);
  check("pool: beef-and-broccoli survives a soy allergy (swappable)",
    soyFree.some((r) => r.slug === "beef-and-broccoli"), true);
  check("pool: swappable recipes carry the instruction",
    (soyFree.find((r) => r.slug === "beef-and-broccoli") || {}).soy_swappable != null, true);
  check("pool: nut recipes removed for a nut allergy",
    runtime.filterPoolByAllergies(pool, ["nuts"]).some((r) => (r.allergens || []).includes("nuts")), false);

  const badPlan = { days: [{ day_label: "Day 1", meals: [
    { slot: "Breakfast", title: "Toast and butter", source: "ai_generated", description: "Sourdough bread with butter." },
  ] }], rationale: "" };
  check("meal-plan check: ai_generated gluten caught",
    runtime.findMealPlanAllergenViolations(badPlan, ["gluten"], pool).length > 0, true);
  check("meal-plan check: clean plan passes",
    runtime.findMealPlanAllergenViolations(
      { days: [{ day_label: "Day 1", meals: [{ slot: "Breakfast", title: "Avocado Egg Bake", source: "shared_recipe", description: "Baked avocado and egg." }] }], rationale: "" },
      ["gluten"], pool).length, 0);
}

// ---------------------------------------------------------------------------
section("7. index.html's mirrored rules behave like the library");

/* Pull the functions straight out of index.html and run the same inputs
 * through both copies. A comment promising they match is not a test; this is.
 * Brace-matching extractor, same approach the earlier allergen test used. */
function extract(src, marker) {
  const s = src.indexOf(marker);
  if (s === -1) return null;
  // A string constant — const PLANT_PREFIX = "..."; — has no braces to match,
  // so brace-walking runs off into the next function and declares it twice.
  const semi = src.indexOf(";", s);
  const brace = src.indexOf("{", s);
  if (semi !== -1 && (brace === -1 || semi < brace)) return src.slice(s, semi + 1);
  let i = brace, d = 0, q = null, esc = false;
  for (let j = i; j < src.length; j++) {
    const c = src[j];
    if (esc) { esc = false; continue; }
    if (c === "\\") { esc = true; continue; }
    if (q) { if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; continue; }
    if (c === "/" && src[j + 1] === "*") { const e = src.indexOf("*/", j); if (e > 0) { j = e + 1; continue; } }
    if (c === "{") d++;
    else if (c === "}") { d--; if (d === 0) return src.slice(s, j + 1); }
  }
  return null;
}

const NEEDED = ["const KEEP_NUMBER =", "function sentenceIsSafe(", "function scrubText(",
  "function stripNutritionPanels(", "function scrubNumbersIfFlagged(",
  "const SLOTS_BY_PATTERN =", "function slotsFor(", "function findSlotViolations(",
  "function recipeViolates(", "function filterPoolByAllergies(", "function swapInstructionsFor(",
  "function findMealPlanAllergenViolations(", "const PLANT_PREFIX", "const NON_GLUTEN_FLOUR",
  "const ALLERGEN_TERMS =", "function getDeclaredAllergies(",
  "function parseSharedRecipeIngredientLines(", "function recipeAllergenHitsLive("];
const missing = NEEDED.filter((n) => !extract(html, n));
check("all mirrored rules found in index.html", missing, []);

let mirror = null;
if (!missing.length) {
  const src = NEEDED.map((n) => extract(html, n)).join("\n") +
    "\nreturn { scrubText, stripNutritionPanels, scrubNumbersIfFlagged, slotsFor, findSlotViolations," +
    " filterPoolByAllergies, swapInstructionsFor, findMealPlanAllergenViolations," +
    " getDeclaredAllergies, recipeAllergenHitsLive };";
  try { mirror = new Function(src)(); }
  catch (e) { check("index.html rules evaluate", "error: " + e.message, "no error"); }
}

if (mirror && runtime) {
  const cases = [
    "A 308-calorie start with 28g of fat. Creamy baked avocado with a soft egg.",
    "Roast at 400°F for 25 minutes, then rest 5 minutes.",
    "~450 cal, 35g protein",
    "Use 1/2 cup coconut milk and 2 Tbsp peanut butter.",
    "Day 1 starts with eggs.",
  ];
  cases.forEach((c, i) => check("mirror scrubText #" + (i + 1), mirror.scrubText(c), runtime.scrubText(c)));
  check("mirror slotsFor(rule_of_3s)", mirror.slotsFor("rule_of_3s"), runtime.slotsFor("rule_of_3s"));
  check("mirror slotsFor(TRE)", mirror.slotsFor("time_restricted_eating"), runtime.slotsFor("time_restricted_eating"));
  const snackPlan = { days: [{ day_label: "Day 1", meals: [{ slot: "Afternoon Snack" }] }] };
  check("mirror findSlotViolations", mirror.findSlotViolations(snackPlan, "rule_of_3s"), runtime.findSlotViolations(snackPlan, "rule_of_3s"));
  ["dairy", "soy", "nuts", "gluten"].forEach((a) => {
    const m = mirror.filterPoolByAllergies(corpus.recipes, [a]).map((r) => r.slug);
    const l = runtime.filterPoolByAllergies(corpus.recipes, [a]).map((r) => r.slug);
    check("mirror filterPoolByAllergies(" + a + ")", m, l);
  });
  const bad = { days: [{ day_label: "Day 1", meals: [{ slot: "Breakfast", title: "Toast and butter", source: "ai_generated", description: "Sourdough bread with butter." }] }], rationale: "" };
  check("mirror findMealPlanAllergenViolations",
    mirror.findMealPlanAllergenViolations(bad, ["gluten"], corpus.recipes),
    runtime.findMealPlanAllergenViolations(bad, ["gluten"], corpus.recipes));
  const plan2 = { days: [{ day_label: "Day 1", meals: [{ slot: "Breakfast", title: "X", description: "A 308-calorie start.", macros_note: "x", macros: {} }] }], rationale: "1,800 calories." };
  check("mirror scrubNumbersIfFlagged",
    mirror.scrubNumbersIfFlagged(plan2, true), runtime.scrubNumbersIfFlagged(plan2, true));
  check("mirror swapInstructionsFor(soy)",
    mirror.swapInstructionsFor(bySlug["beef-and-broccoli"], ["soy"]),
    runtime.swapInstructionsFor(bySlug["beef-and-broccoli"], ["soy"]));

  section("8. \"Does this recipe fit?\" — the hard no is decided in code");

  // Hard no, computed live from the ingredient list, so it works before the
  // tags are confirmed and stays right afterwards.
  const hitsDairy = mirror.recipeAllergenHitsLive(bySlug["greek-salad"], ["dairy"]);
  check("fit: greek salad is a hard no for a dairy allergy", hitsDairy.length > 0, true);
  check("fit: it names the term that decided it", typeof (hitsDairy[0] || {}).term === "string", true);

  check("fit: thai panang is NOT a dairy no (peanut butter is not dairy)",
    mirror.recipeAllergenHitsLive(bySlug["thai-panang-chicken-curry"], ["dairy"]).length, 0);
  check("fit: thai panang IS a nut no",
    mirror.recipeAllergenHitsLive(bySlug["thai-panang-chicken-curry"], ["nuts"]).length > 0, true);
  check("fit: coconut chia pudding is not a dairy no (coconut milk)",
    mirror.recipeAllergenHitsLive(bySlug["coconut-chia-pudding"], ["dairy"]).length, 0);
  check("fit: keto chicken parmesan is not a gluten no (almond flour)",
    mirror.recipeAllergenHitsLive(bySlug["keto-chicken-parmesan"], ["gluten"]).length, 0);
  check("fit: an unlisted allergy cannot produce a no",
    mirror.recipeAllergenHitsLive(bySlug["greek-salad"], ["other"]).length, 0);
  check("fit: no allergies means no hits",
    mirror.recipeAllergenHitsLive(bySlug["greek-salad"], []).length, 0);

  // The soy carve-out: available, with the instruction attached.
  const soyPool = mirror.filterPoolByAllergies(corpus.recipes, ["soy"]);
  const bb = soyPool.find((r) => r.slug === "beef-and-broccoli");
  check("fit: beef-and-broccoli survives a soy allergy", !!bb, true);
  const swaps = mirror.swapInstructionsFor(bb, ["soy"]);
  check("fit: and carries exactly one swap instruction", swaps.length, 1);
  check("fit: the instruction names coconut aminos", /coconut aminos/.test(swaps[0] || ""), true);
  check("fit: the instruction names what to avoid", /tamari/.test(swaps[0] || ""), true);
  check("fit: worcestershire recipe warns to check the label",
    mirror.swapInstructionsFor(bySlug["keto-carolina-mustard-bbq-sauce"], ["soy"])
      .some((s) => /label/i.test(s)), true);

  // getDeclaredAllergies must not silently lose a string-shaped list.
  check("fit: allergies as an array", mirror.getDeclaredAllergies(
    { health_history: { physical: { food_allergies: ["dairy", "nuts"] } } }), ["dairy", "nuts"]);
  check("fit: allergies as a string still parse", mirror.getDeclaredAllergies(
    { health_history: { physical: { food_allergies: "dairy, nuts" } } }), ["dairy", "nuts"]);
  check("fit: missing profile yields none", mirror.getDeclaredAllergies(null), []);
}

// ---------------------------------------------------------------------------
console.log("\n" + "=".repeat(64));
console.log(pass + " passed, " + failures.length + " failed");
if (failures.length) {
  console.log("\nFAILURES:");
  failures.forEach((f) => {
    console.log("\n  " + f.name);
    console.log("    expected: " + f.expected);
    console.log("    actual:   " + f.actual);
  });
  process.exit(1);
}
console.log("all green");
