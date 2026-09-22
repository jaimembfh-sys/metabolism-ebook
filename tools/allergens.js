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

/* JAIME'S RECOMMENDATION, NOT AN ALLERGY ACCOMMODATION. 2026-09-22.
 *
 * An earlier version of this file treated "tamari or coconut aminos" as a way
 * for a soy-allergic reader to keep the recipe. That was wrong twice over.
 *
 * It is not why the swap exists: Jaime recommends coconut aminos to EVERYONE,
 * because processed soy has downsides, often carries gluten, and is hard on
 * digestion. And it is not safe to use that way — a soy-allergic reader must
 * never be told one of these recipes is fine for them. They are tagged soy and
 * excluded like any other soy recipe.
 *
 * So this is surfaced to every reader regardless of allergies, and plays no
 * part in filtering.
 */
const RECOMMENDED_SWAP = {
  test: /\b(tamari|soy sauce)\b[^.]{0,40}\bor\b[^.]{0,40}\bcoconut aminos\b|\bcoconut aminos\b[^.]{0,40}\bor\b[^.]{0,40}\b(tamari|soy sauce)\b/i,
  use: "coconut aminos",
  instead_of: "tamari",
  why: "processed soy has downsides, often contains gluten, and is hard on digestion",
};

/* A DIFFERENT THING: an allergen the recipe itself offers a first-class
 * alternative to, in the ingredient line, put there for that purpose.
 *
 * The pancakes read "ghee or coconut oil". Jaime's call, 2026-09-22: keep the
 * dairy tag, but tell a dairy-avoiding reader it works with coconut oil rather
 * than hiding the recipe from them.
 *
 * Note this is the opposite treatment to the tamari case above, deliberately.
 * See OVERNIGHT_REPORT_4 follow-up / NEEDS_JAIME N-15 — the asymmetry is
 * flagged there, because a dairy allergy is as serious as a soy one and this
 * keeps the recipe in front of a dairy-allergic reader with an instruction
 * attached, which is exactly the arrangement the tamari case rejects.
 */
const ALLERGEN_ALTERNATIVES = [
  {
    allergen: "dairy",
    test: /\bghee\b[^.]{0,30}\bor\b[^.]{0,30}\bcoconut oil\b|\bcoconut oil\b[^.]{0,30}\bor\b[^.]{0,30}\bghee\b/i,
    use: "coconut oil",
    instead_of: "ghee",
  },
];

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

  for (const [allergen, re] of Object.entries(ALLERGEN_TERMS)) {
    const matched = [];
    for (const line of lines) {
      const m = line.match(re);
      if (m) matched.push({ term: m[0], line });
    }
    if (!matched.length) continue;

    if (allergen === "soy") {
      /* Soy is now binding whenever it appears. The "tamari or coconut aminos"
       * line no longer softens it — that swap is a recommendation for
       * everyone, not a safety mechanism, and a soy-allergic reader gets the
       * recipe excluded like any other soy recipe. */
      for (const bd of BRAND_DEPENDENT) {
        for (const mm of matched) {
          if (bd.allergen === "soy" && bd.test.test(mm.line)) {
            brand_dependent.push({ allergen: "soy", term: mm.term, line: mm.line, why: bd.why });
          }
        }
      }
      // Worcestershire alone is a "check the label", not a closed door.
      const hard = matched.filter((mm) => !BRAND_DEPENDENT.some((bd) => bd.test.test(mm.line)));
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

  // Jaime's swap, for everyone, whatever they are or are not allergic to.
  const swapLines = lines.filter((l) => RECOMMENDED_SWAP.test.test(l));

  // An allergen the recipe itself offers a way around, in the ingredient line.
  const alternatives = [];
  for (const alt of ALLERGEN_ALTERNATIVES) {
    const hit = lines.find((l) => alt.test.test(l));
    if (hit && allergens.includes(alt.allergen)) {
      alternatives.push({ allergen: alt.allergen, use: alt.use, instead_of: alt.instead_of, line: hit });
    }
  }

  return {
    allergens: allergens.sort(),
    recommended_swap: swapLines.length
      ? { use: RECOMMENDED_SWAP.use, instead_of: RECOMMENDED_SWAP.instead_of, why: RECOMMENDED_SWAP.why, lines: swapLines }
      : null,
    allergen_alternatives: alternatives.length ? alternatives : null,
    brand_dependent,
    anchovy,
    hits,
    uncertain,
    misses,
  };
}

module.exports = {
  ALLERGEN_TERMS, PLANT_PREFIX, NON_GLUTEN_FLOUR, RECOMMENDED_SWAP, ALLERGEN_ALTERNATIVES,
  BRAND_DEPENDENT, ANCHOVY, UNCERTAIN, POSSIBLE_MISS, ingredientLines, tagRecipe,
};
