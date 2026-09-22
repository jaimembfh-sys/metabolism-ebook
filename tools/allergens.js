/**
 * The allergen vocabulary, in one place.
 *
 * These regexes already existed inline in index.html as ALLERGEN_TERMS, where
 * they back the Protocol Builder's detect-and-regenerate gate. They are needed
 * in Node too now, to tag the recipe corpus at build time, and two copies that
 * drift apart would be worse than either - a recipe tagged "dairy-free" by a
 * looser Node copy would sail through a stricter browser check, or vice versa.
 *
 * So: this file is the definition. index.html keeps an inline copy because it
 * cannot require() anything, and tools/recipes/test-rules.js asserts the two
 * are character-identical. Change them here, then paste into index.html, and
 * the test tells you if you missed one.
 *
 * Plant-milk exclusions matter: "almond milk" and "coconut cream" are correct
 * dairy-free recommendations and must not trip the dairy rule.
 */
const PLANT_PREFIX = "(?<!coconut |almond |oat |soy |soya |cashew |rice |hemp |flax |pea |plant-based |plant )";

const ALLERGEN_TERMS = {
  gluten: new RegExp("\\b(?<!gluten-free )(bread|pasta|couscous|wheat|barley|rye|bagel|toast|cracker|cereal|tortilla|breadcrumb|flour|oats|oatmeal|pita|naan|seitan)\\b", "i"),
  dairy: new RegExp("\\b" + PLANT_PREFIX + "(milk|cheese|yoghurt|yogurt|butter|cream|whey|kefir|ghee)\\b", "i"),
  nuts: /\b(almond|walnut|pecan|cashew|pistachio|hazelnut|macadamia|nut butter|peanut)\b/i,
  soy: /\b(soy|soya|tofu|tempeh|edamame|miso)\b/i,
  shellfish: /\b(shrimp|prawn|crab|lobster|crayfish|scallop|mussel|clam|oyster)\b/i,
};

/* Terms the regexes get wrong often enough to be worth saying out loud, used
 * to mark a tag as needing a human eye rather than to change the tag itself.
 *
 *   "coconut flour" / "almond flour"  -> gluten fires on "flour", but neither
 *                                        is a gluten grain
 *   "coconut milk" / "coconut cream"  -> the lookbehind already clears these,
 *                                        but "cream of tartar" and "creamy"
 *                                        are near misses worth flagging
 *   "peanut" under nuts               -> a legume, not a tree nut; some people
 *                                        who avoid tree nuts eat peanuts and
 *                                        the other way round
 *   "coconut" under nuts              -> FDA calls it a tree nut, most people
 *                                        avoiding nuts tolerate it
 */
const UNCERTAIN = [
  { allergen: "gluten", test: /\b(coconut|almond|cassava|tapioca|arrowroot|chickpea)\s+flour\b/i, why: "flour, but not a gluten grain" },
  { allergen: "gluten", test: /\bgluten-free\b/i, why: "line says gluten-free" },
  { allergen: "dairy", test: /\b(peanut|sunflower|seed|cocoa|shea) butter\b/i, why: 'FALSE POSITIVE: "butter" fires because PLANT_PREFIX lists coconut/almond/oat/soy but not peanut. Nut and seed butters are not dairy' },
  { allergen: "dairy", test: /\bcream of tartar\b/i, why: '"cream of tartar" is not dairy' },
  { allergen: "dairy", test: /\bcoconut (milk|cream)\b/i, why: "coconut, not dairy" },
  { allergen: "dairy", test: /\b(ghee|clarified butter)\b/i, why: "ghee is near-zero lactose; some dairy-avoiders use it" },
  { allergen: "nuts", test: /\bpeanut/i, why: "peanut is a legume, not a tree nut" },
  { allergen: "nuts", test: /\bcoconut\b/i, why: "coconut is a tree nut by FDA, tolerated by most" },
  { allergen: "soy", test: /\b(soy sauce|tamari)\b/i, why: "tamari is the usual gluten-free soy sauce; still soy" },
  { allergen: "soy", test: /\bcoconut aminos\b/i, why: "coconut aminos is the soy-free substitute" },
];

/* Terms that ARE an allergen but that ALLERGEN_TERMS does not currently list,
 * so the tagger would pass the recipe as clean. Reported as "possible miss"
 * rather than silently tagged: adding a word to ALLERGEN_TERMS also changes
 * the Protocol Builder's live gate, and that is Jaime's call, not a side
 * effect of building a recipe table.
 *
 * The intake form offers exactly gluten / dairy / soy / nuts / shellfish /
 * other, so there is no fish category to miss - anchovy in fish sauce and
 * Worcestershire lands under "other", which already triggers the honest
 * "we could not filter this" note.
 */
const POSSIBLE_MISS = [
  { allergen: "soy", test: /\btamari\b/i, why: "tamari is soy sauce; ALLERGEN_TERMS lists soy/soya/tofu/tempeh/edamame/miso but not tamari" },
  { allergen: "soy", test: /\bworcestershire\b/i, why: "most Worcestershire brands contain soy" },
];

/** Ingredient lines from a recipe's markdown body. Mirrors
 *  parseSharedRecipeIngredientLines in index.html. */
function ingredientLines(fullText) {
  if (!fullText) return [];
  const m = fullText.match(/## Ingredients\n([\s\S]*?)(\n## |$)/);
  if (!m) return [];
  return m[1].split("\n").map((l) => l.trim())
    .filter((l) => l.indexOf("- ") === 0)
    .map((l) => l.slice(2).trim());
}

/**
 * Tag one recipe. Returns { allergens: [...], hits: [...], uncertain: [...] }.
 * Scans INGREDIENT LINES ONLY - instructions mention pans and butter knives
 * and would tag half the book.
 */
function tagRecipe(fullText) {
  const lines = ingredientLines(fullText);
  const allergens = [];
  const hits = [];
  const uncertain = [];
  for (const [allergen, re] of Object.entries(ALLERGEN_TERMS)) {
    const matched = [];
    for (const line of lines) {
      const m = line.match(re);
      if (m) matched.push({ term: m[0], line });
    }
    if (!matched.length) continue;
    allergens.push(allergen);
    hits.push({ allergen, matched });
    for (const u of UNCERTAIN) {
      if (u.allergen !== allergen) continue;
      for (const mm of matched) {
        if (u.test.test(mm.line)) uncertain.push({ allergen, line: mm.line, term: mm.term, why: u.why });
      }
    }
  }
  const misses = [];
  for (const p of POSSIBLE_MISS) {
    if (allergens.includes(p.allergen)) continue;   // already caught another way
    for (const line of lines) {
      const m = line.match(p.test);
      if (m) misses.push({ allergen: p.allergen, line, term: m[0], why: p.why });
    }
  }
  return { allergens: allergens.sort(), hits, uncertain, misses };
}

module.exports = { ALLERGEN_TERMS, PLANT_PREFIX, UNCERTAIN, POSSIBLE_MISS, ingredientLines, tagRecipe };
