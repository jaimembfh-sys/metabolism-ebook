/**
 * The allergen vocabulary, in one place.
 *
 * These regexes back two things: the Protocol Builder's detect-and-regenerate
 * gate in index.html, and the recipe corpus tagging in
 * knowledge-base/build-recipes-corpus.js. Two copies that drift apart would be
 * worse than either - a recipe passed as clean by a looser copy would sail
 * through a stricter check - so this file is the definition. index.html keeps
 * an inline copy because it cannot require(), and tools/recipes/test-rules.js
 * asserts the two are character-identical.
 *
 * ---------------------------------------------------------------------------
 * JAIME'S DECISIONS, 2026-09-22. Each of these changes the live Protocol
 * Builder gate as well as the recipe tags.
 *
 * 1. tamari joins soy. A recipe line that offers "tamari OR coconut aminos"
 *    is tagged soy_swappable rather than soy: the recipe stays available to a
 *    soy-allergic user, and the coach must tell them to use coconut aminos.
 * 2. worcestershire joins soy, brand-dependent - most brands contain soy, not
 *    all. Most also contain anchovies, which the intake form has no category
 *    for; those recipes are listed in the report instead.
 * 3. peanut joins PLANT_PREFIX, so "peanut butter" stops reading as dairy.
 * 4. The flour rule narrows: coconut and almond flour are not gluten. Only
 *    wheat flour, or flour with nothing said about it, tags gluten. Almond
 *    flour still tags nuts.
 * 5. peanut stays under nuts.
 * ---------------------------------------------------------------------------
 *
 * Plant-milk exclusions matter: "almond milk" and "coconut cream" are correct
 * dairy-free recommendations and must not trip the dairy rule. As of decision
 * 3 the same is true of "peanut butter" and the other nut and seed butters.
 */
const PLANT_PREFIX = "(?<!coconut |almond |oat |soy |soya |cashew |rice |hemp |flax |pea |peanut |sunflower |seed |cocoa |plant-based |plant )";

/* Flours that are not gluten. Decision 4: named so that "coconut flour" and
 * "almond flour" pass, while "flour" on its own - which in a recipe means
 * wheat - still tags. */
const NON_GLUTEN_FLOUR = "(?<!coconut |almond |cassava |tapioca |arrowroot |chickpea |flaxseed |sesame |sunflower |hazelnut |pecan )";

const ALLERGEN_TERMS = {
  gluten: new RegExp("\\b(?<!gluten-free )(bread|pasta|couscous|wheat|barley|rye|bagel|toast|cracker|cereal|tortilla|breadcrumb|oats|oatmeal|pita|naan|seitan|" + NON_GLUTEN_FLOUR + "flour)\\b", "i"),
  dairy: new RegExp("\\b" + PLANT_PREFIX + "(milk|cheese|yoghurt|yogurt|butter|cream|whey|kefir|ghee)\\b", "i"),
  nuts: /\b(almond|walnut|pecan|cashew|pistachio|hazelnut|macadamia|nut butter|peanut)\b/i,
  soy: /\b(soy|soya|tofu|tempeh|edamame|miso|tamari|worcestershire)\b/i,
  shellfish: /\b(shrimp|prawn|crab|lobster|crayfish|scallop|mussel|clam|oyster)\b/i,
};

/* An ingredient line that offers a soy-free alternative in the same breath.
 * "6 Tbsp tamari or coconut aminos" is not a closed door to a soy-allergic
 * reader - it is a fork, and the coach's job is to point at the right branch. */
const SOY_SWAPPABLE = {
  test: /\b(tamari|soy sauce)\b[^.]{0,40}\bor\b[^.]{0,40}\bcoconut aminos\b|\bcoconut aminos\b[^.]{0,40}\bor\b[^.]{0,40}\b(tamari|soy sauce)\b/i,
  swap: "coconut aminos",
  instead_of: "tamari",
};

/* Brand-dependent, not certain. Kept as a separate signal so the coach can say
 * "check the label" rather than either hiding the recipe or promising it is
 * safe. */
const BRAND_DEPENDENT = [
  { allergen: "soy", test: /\bworcestershire\b/i, why: "most Worcestershire brands contain soy, some do not" },
];

/* Not an allergen the intake form offers, so it cannot be filtered on - but
 * worth naming in a report, because someone avoiding fish would want to know. */
const ANCHOVY = { test: /\b(worcestershire|fish sauce|anchov)/i, why: "usually contains anchovy" };

/* Terms the regexes still get wrong often enough to be worth saying out loud.
 * Marks a tag as wanting a human eye; does not change the tag. */
const UNCERTAIN = [
  { allergen: "nuts", test: /\bpeanut/i, why: "peanut is a legume, not a tree nut — Jaime's decision 5 keeps it under nuts" },
  { allergen: "nuts", test: /\bcoconut\b/i, why: "coconut is a tree nut by FDA, tolerated by most" },
  { allergen: "dairy", test: /\bcream of tartar\b/i, why: '"cream of tartar" is not dairy' },
  { allergen: "dairy", test: /\b(ghee|clarified butter)\b/i, why: "ghee is near-zero lactose; some dairy-avoiders use it" },
];

/* Terms that ARE an allergen but that ALLERGEN_TERMS does not list, so the
 * tagger would pass the recipe as clean. Empty since Jaime's decisions closed
 * the tamari and worcestershire gaps; kept as the place the next one goes. */
const POSSIBLE_MISS = [];

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
 * Tag one recipe from its INGREDIENT LINES ONLY - instructions mention butter
 * knives and floured surfaces and would tag half the book.
 *
 * Returns:
 *   allergens        binding. Never includes soy where every soy hit on the
 *                    line was swappable.
 *   soy_swappable    { swap, instead_of, lines } when soy is avoidable by
 *                    taking the alternative the recipe already offers.
 *   brand_dependent  [{ allergen, term, line, why }] — say "check the label".
 *   anchovy          lines that usually contain anchovy. Not filterable.
 *   uncertain        doubtful hits, for the human-eye list.
 *   misses           terms known to be uncovered.
 */
function tagRecipe(fullText) {
  const lines = ingredientLines(fullText);
  const allergens = [];
  const hits = [];
  const uncertain = [];
  const brand_dependent = [];
  const anchovy = [];
  let soySwappableLines = [];

  for (const [allergen, re] of Object.entries(ALLERGEN_TERMS)) {
    const matched = [];
    for (const line of lines) {
      const m = line.match(re);
      if (m) matched.push({ term: m[0], line });
    }
    if (!matched.length) continue;

    if (allergen === "soy") {
      // A soy hit only counts as binding if at least one line has no
      // alternative offered on it.
      const binding = matched.filter((mm) => !SOY_SWAPPABLE.test.test(mm.line));
      soySwappableLines = matched.filter((mm) => SOY_SWAPPABLE.test.test(mm.line)).map((mm) => mm.line);
      for (const bd of BRAND_DEPENDENT) {
        for (const mm of matched) {
          if (bd.allergen === "soy" && bd.test.test(mm.line)) {
            brand_dependent.push({ allergen: "soy", term: mm.term, line: mm.line, why: bd.why });
          }
        }
      }
      // A brand-dependent hit is not enough on its own to close the recipe.
      const hard = binding.filter((mm) => !BRAND_DEPENDENT.some((bd) => bd.test.test(mm.line)));
      if (hard.length) { allergens.push("soy"); hits.push({ allergen, matched: hard }); }
      continue;
    }

    allergens.push(allergen);
    hits.push({ allergen, matched });
    for (const u of UNCERTAIN) {
      if (u.allergen !== allergen) continue;
      for (const mm of matched) {
        if (u.test.test(mm.line)) uncertain.push({ allergen, line: mm.line, term: mm.term, why: u.why });
      }
    }
  }

  for (const line of lines) if (ANCHOVY.test.test(line)) anchovy.push(line);

  const misses = [];
  for (const p of POSSIBLE_MISS) {
    if (allergens.includes(p.allergen)) continue;
    for (const line of lines) {
      const m = line.match(p.test);
      if (m) misses.push({ allergen: p.allergen, line, term: m[0], why: p.why });
    }
  }

  return {
    allergens: allergens.sort(),
    soy_swappable: soySwappableLines.length
      ? { swap: SOY_SWAPPABLE.swap, instead_of: SOY_SWAPPABLE.instead_of, lines: soySwappableLines }
      : null,
    brand_dependent,
    anchovy,
    hits,
    uncertain,
    misses,
  };
}

module.exports = {
  ALLERGEN_TERMS, PLANT_PREFIX, NON_GLUTEN_FLOUR, SOY_SWAPPABLE, BRAND_DEPENDENT,
  ANCHOVY, UNCERTAIN, POSSIBLE_MISS, ingredientLines, tagRecipe,
};
