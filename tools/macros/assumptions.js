/* Stated assumptions — Jaime, 2026-09-21.
 *
 * Four things the recipes leave open. Each is resolved by an existing rule
 * rather than by picking a number, and each carries a note so a reader knows
 * what the figures assume.
 */

/* ---- 1a. Ground beef: Jaime buys 92/8 ------------------------------------
 *
 * Neither dataset carries a 92/8 entry, and the two nearest sit on opposite
 * sides of it in different datasets:
 *
 *   93% lean / 7% fat    7.0  g fat   fdc 173110    SR Legacy
 *   92% lean / 8% fat        the target
 *   90% lean / 10% fat  12.8  g fat   fdc 2514743   Foundation
 *
 * So the value is a blend weighted to 92% lean, the same construction used
 * for the salmon. 92 sits one point below 93 and two above 90, so the weight
 * falls two-thirds on the 93/7 entry and one-third on the 90/10:
 *
 *   w  = (93 - 92) / (93 - 90) = 1/3      measured from the leaner part
 *   fat = 7.0 + (1/3) * (12.8 - 7.0) = 8.93 g
 *
 * 8.93 g is close to the 8 g a 92/8 label implies, which the Foundation-only
 * pick was not - Foundation's 90/10 tests at 12.8 g, well above its own label.
 * This is the one place in the rebuild where the two datasets are mixed, and
 * it is mixed deliberately because neither one brackets 92% lean on its own.
 */

/* ---- 1b. Salmon: just above the midpoint of the two Foundation entries ---
 *
 * Jaime, 2026-09-21: not the fattiest entry, a value just above the midpoint.
 *
 *   sockeye, wild caught    4.94 g fat   fdc 2684440
 *   Atlantic, farm raised  13.1  g fat   fdc 2684441
 *   midpoint                9.02 g fat
 *
 * "Just above the midpoint" is taken as the 60th percentile by linear
 * interpolation - the same 0.6 that governs every other meat, but interpolated
 * rather than snapped to an index, because with two entries snapping can only
 * ever land on one end:
 *
 *   4.94 + 0.6 * (13.1 - 4.94) = 9.84 g fat
 *
 * which is 0.82 g above the midpoint. Equivalently it is a 40/60 blend of the
 * two entries, and that is how it is computed, so protein, carbs and calories
 * are blended on the same weighting instead of being taken from one entry
 * while fat comes from somewhere else. Both ids stay on the row.
 *
 * This is the one figure in the whole rebuild that is not a single USDA entry.
 * It is a stated blend of two, not an estimate.
 */
const BLENDS = {
  "ground beef": {
    leanTarget: 92,
    parts: [
      { fdc: 173110,  src: "SR Legacy",  lean: 93, expect: "Beef, ground, 93% lean meat / 7% fat, raw" },
      { fdc: 2514743, src: "Foundation", lean: 90, expect: "Beef, ground, 90% lean meat / 10% fat, raw" },
    ],
    assumes: "92/8 ground beef",
  },
  "salmon fillet": {
    w: 0.6,
    parts: [
      { fdc: 2684440, src: "Foundation", expect: "Fish, salmon, sockeye, wild caught, raw" },
      { fdc: 2684441, src: "Foundation", expect: "Fish, salmon, Atlantic, farm raised, raw" },
    ],
    assumes: "a mid-range salmon",
  },
};
BLENDS["salmon"] = BLENDS["salmon fillet"];

/* The blend weight, measured from the LOWER-fat part toward the higher-fat
 * one. Where a lean target is given it is derived from the lean percentages so
 * the weighting is a statement about the beef, not a hand-set number.
 */
function blendWeight(b) {
  if (b.w != null) return b.w;
  const sorted = b.parts.slice().sort((x, y) => y.lean - x.lean); // leanest first = lowest fat
  const [hi, lo] = sorted;                                        // hi.lean > lo.lean
  return (hi.lean - b.leanTarget) / (hi.lean - lo.lean);
}

/* ---- 2. Mixed vegetables of choice --------------------------------------
 *
 * Jaime, 2026-09-21: leave the optional vegetables OUT of the nutrition
 * numbers; the note says they are not included.
 *
 * They sit under the recipe's own "Optional: Roast or Grill Vegetables in the
 * Marinade" heading, so excluding them is consistent with how the guacamole
 * treats its dipping vegetables.
 *
 * The composite is kept, unused, because the earlier instruction was to resolve
 * it and this records what that resolution was: equal parts broccoli, red bell
 * pepper, zucchini and red onion at 900 g. Set EXCLUDE to false to count it.
 */
const COMPOSITES = {
  "mixed vegetables of choice": {
    exclude: true,
    excludeWhy: "optional in the recipe — Jaime's instruction is to leave these out of the nutrition numbers",
    total_g: 900,
    parts: [
      { fdc: 747447,  expect: "Broccoli, raw" },
      { fdc: 2258590, expect: "Peppers, bell, red, raw" },
      { fdc: 2685568, expect: "Squash, summer, green, zucchini, includes skin, raw" },
      { fdc: 790577,  expect: "Onions, red, raw" },
    ],
    assumes: "900 g of equal parts broccoli, red bell pepper, zucchini and red onion",
  },
};

/* ---- 3. Guacamole yield --------------------------------------------------
 *
 * The recipe states nutrition "per 3/4 cup serving" but no serving count, so
 * the count is the yield divided by 3/4. Volumes are the gram weights this
 * tool already assigns, converted at USDA cup weights.
 *
 *   4 large avocados       920 g mashed   / 230 g per cup   = 4.000 cups
 *   1/2 small yellow onion  35 g diced    / 160 g per cup   = 0.219
 *   1 Roma tomato           62 g diced    / 180 g per cup   = 0.344
 *   3 Tbsp cilantro, chopped                3/16 cup        = 0.188
 *   2.5 Tbsp diced jalapeno 14 g          /  90 g per cup   = 0.156
 *   2 garlic cloves, minced  6 g          / 136 g per cup   = 0.044
 *   1 lime, juiced          30 g juice    / 242 g per cup   = 0.124
 *                                                    total  = 5.075 cups
 *
 *   5.075 / 0.75 = 6.77 servings
 *
 * The dipping cucumber and bell pepper are excluded, as the recipe's own
 * nutrition line already says they are.
 */
/* ---- 1e. Three sauces were being reported a whole batch at a time --------
 *
 * Found 2026-09-21 while replacing the printed nutrition panels. These three
 * carry no servings count in their frontmatter, so the divisor fell back to 1
 * and the "per serving" line was the entire pot: marinara at 778 kcal and 86 g
 * of net carbs, which is eight cups of sauce, not a portion of it.
 *
 * Each recipe states its own yield and its own serving size in the nutrition
 * heading it already prints, so the divisor comes from the recipe rather than
 * from anything assumed here:
 *
 *   marinara          "Per 2/3 cup serving (makes about 8 cups)"
 *   bbq sauce         "Per tablespoon (makes about 1 3/4 cups)"
 *   teriyaki sauce    "Per tablespoon (makes about 1 1/2 cups)"
 *
 * The results land near the figures those recipes used to print - marinara
 * 65 kcal against 72, the two sauces 5 kcal against 10 - which is the check
 * that the divisor is the right one and not an order of magnitude out.
 */
const YIELD = {
  "traditional-guacamole-with-veggies": {
    servings: 6.77,
    cups: 5.075,
    why: "5.08 cups total yield ÷ 3/4 cup per serving = 6.77 servings",
    assumes: "a yield of about 5 cups, or roughly 6 3/4 servings of 3/4 cup each",
  },
  "marinara-sauce": {
    servings: 12,
    cups: 8,
    why: "8 cups yield ÷ 2/3 cup per serving = 12 servings",
    assumes: "the recipe's own yield of about 8 cups, in 2/3-cup servings",
  },
  "keto-carolina-mustard-bbq-sauce": {
    servings: 28,
    cups: 1.75,
    why: "1 3/4 cups yield × 16 Tbsp per cup = 28 tablespoons",
    assumes: "the recipe's own yield of about 1 3/4 cups, by the tablespoon",
  },
  "make-ahead-teriyaki-sauce": {
    servings: 24,
    cups: 1.5,
    why: "1 1/2 cups yield × 16 Tbsp per cup = 24 tablespoons",
    assumes: "the recipe's own yield of about 1 1/2 cups, by the tablespoon",
  },
  /* Jaime, 2026-09-21: give the mayo a panel by the tablespoon. The recipe
   * states no yield, so it is computed from the ingredients two ways, which
   * agree:
   *
   *   by volume     1 cup oil            16     Tbsp
   *                 2 large egg yolks     2.2   (17 g each, about 1.1 Tbsp)
   *                 1 Tbsp lemon juice    1
   *                 2 tsp Dijon           0.67
   *                 salt                  0     (dissolves)
   *                                      19.9   Tbsp
   *
   *   by weight     280 g total / 0.93 g per mL = 301 mL = 20.4 Tbsp
   *                 (0.91-0.95 g/mL spans 19.9 to 20.8)
   *
   * Call it 20 Tbsp, or 1 1/4 cups. The check that this is right: it puts the
   * mayo at 102 kcal and 11.4 g fat per tablespoon, and a commercial avocado
   * oil mayonnaise label reads 100 kcal and 11 g.
   */
  "homemade-avocado-oil-mayo": {
    servings: 20,
    cups: 1.25,
    why: "about 1 1/4 cups yield × 16 Tbsp per cup = 20 tablespoons",
    assumes: "a yield of about 1 1/4 cups, by the tablespoon",
  },
};

/* ---- 2. Cooking yield: bought raw, eaten cooked ------------------------
 *
 * Bacon is the one ingredient here where costing the raw weight is wrong in
 * the reader's direction. A pound goes in the oven, a great deal of fat
 * renders out, and it is poured off - it never reaches the plate. Costing the
 * raw pound counts that fat as eaten.
 *
 * The yield is USDA's own, taken from the portion weights it publishes for
 * the same food either side of the pan:
 *
 *   Pork, cured, bacon, unprepared      (168277)   1 slice raw    = 28   g
 *   Pork, cured, bacon, cooked, baked   (167914)   1 slice cooked =  8.1 g
 *
 *   8.1 / 28 = 0.289
 *
 * So the line's raw weight is multiplied by 0.289 and priced against the
 * COOKED entry. Both halves have to move together: cooked density on a raw
 * weight is the error this replaces, and raw density on a cooked weight would
 * be the same error the other way.
 *
 * A pound of bacon is then 131 g cooked at 548 kcal per 100 g = 719 kcal,
 * against 1,783 kcal for the raw pound priced raw. The difference is the fat
 * in the bottom of the pan.
 *
 * Keyed on the RESOLVED map key, exactly, not by substring - "crumbled bacon"
 * is bought already cooked and measured by the cup, so it takes no yield and
 * must not inherit this one.
 */
const COOK_YIELD = {
  "bacon": {
    factor: 8.1 / 28,
    raw_fdc: 168277,
    cooked_fdc: 167914,
    why: "USDA slice weights, 28 g raw to 8.1 g cooked",
  },
};

function verifyAssumptions(fndById, srById) {
  const problems = [];
  const idx = (p) => (p.src === "SR Legacy" ? srById : fndById);
  const check = (what, p) => {
    const f = idx(p)[p.fdc];
    if (!f) { problems.push(`${what}: ${p.src || "Foundation"} fdc ${p.fdc} not in index`); return; }
    if (!f.desc.toLowerCase().startsWith(p.expect.toLowerCase().slice(0, 30)))
      problems.push(`${what}: fdc ${p.fdc}\n      expected "${p.expect}"\n      actual   "${f.desc}"`);
  };
  Object.entries(BLENDS).forEach(([k, v]) => {
    v.parts.forEach((p) => check("BLENDS " + k, p));
    const fats = v.parts.map((p) => idx(p)[p.fdc]).filter(Boolean).map((f) => f.fat).sort((a, b) => a - b);
    if (fats.length !== 2) return;
    const w = blendWeight(v);
    if (!(w > 0 && w < 1)) { problems.push(`BLENDS ${k}: weight ${w} is not strictly between the two parts`); return; }
    const val = fats[0] + w * (fats[1] - fats[0]);
    if (v.leanTarget != null) {
      // The blend must land between the two entries and, for a lean target,
      // near the fat the label implies - within 1.5 g of (100 - lean).
      const implied = 100 - v.leanTarget;
      if (Math.abs(val - implied) > 1.5)
        problems.push(`BLENDS ${k}: ${val.toFixed(2)} g fat is more than 1.5 g from the ${implied} g a ${v.leanTarget}/${implied} label implies`);
    } else {
      const mid = (fats[0] + fats[1]) / 2;
      if (!(val > mid)) problems.push(`BLENDS ${k}: ${val.toFixed(2)} g fat is not above the midpoint ${mid.toFixed(2)}`);
    }
  });
  Object.entries(COMPOSITES).forEach(([k, v]) =>
    v.parts.forEach((p) => check("COMPOSITES " + k, p)));
  if (problems.length) throw new Error("Assumption verification FAILED:\n  " + problems.join("\n  "));
  return Object.keys(BLENDS).length + Object.keys(COMPOSITES).length;
}

module.exports = { BLENDS, COMPOSITES, YIELD, COOK_YIELD, blendWeight, verifyAssumptions };
