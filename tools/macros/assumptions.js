/* Stated assumptions — Jaime, 2026-09-21.
 *
 * Four things the recipes leave open. Each is resolved by an existing rule
 * rather than by picking a number, and each carries a note so a reader knows
 * what the figures assume.
 */

/* ---- 1a. Ground beef: Jaime uses 92/8 -----------------------------------
 *
 * Neither dataset carries a 92/8 entry, so the rule is the nearest lean
 * percentage, Foundation preferred. Foundation holds two raw ground beefs:
 *
 *   90% lean / 10% fat   12.8 g fat   fdc 2514743   <- nearest to 92
 *   80% lean / 20% fat   19.4 g fat   fdc 2514744
 *
 * WORTH KNOWING: 12.8 g fat is what Foundation measured for beef LABELLED
 * 10% fat, so it runs well above its own label. Against a 92/8 label the
 * implied figure is about 8 g. SR Legacy's 93/7 (fdc 173110, 7.0 g fat) is
 * both nearer to 92% lean and nearer to what 92/8 beef should test at, but it
 * is SR Legacy and this pick prefers Foundation as instructed.
 */
const MEAT_PICKS = {
  "ground beef": {
    fdc: 2514743, expect: "Beef, ground, 90% lean meat / 10% fat, raw",
    population: [
      { fdc: 2514743, fat: 12.8, lean: 90, desc: "Beef, ground, 90% lean meat / 10% fat, raw" },
      { fdc: 2514744, fat: 19.4, lean: 80, desc: "Beef, ground, 80% lean meat / 20% fat, raw" },
    ],
    nearestLean: 92,
    assumes: "92/8 ground beef",
  },
};

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
  "salmon fillet": {
    w: 0.6,
    parts: [
      { fdc: 2684440, expect: "Fish, salmon, sockeye, wild caught, raw" },
      { fdc: 2684441, expect: "Fish, salmon, Atlantic, farm raised, raw" },
    ],
    assumes: "a mid-range salmon",
  },
};
BLENDS["salmon"] = BLENDS["salmon fillet"];

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
const YIELD = {
  "traditional-guacamole-with-veggies": {
    servings: 6.77,
    cups: 5.075,
    why: "5.08 cups total yield ÷ 3/4 cup per serving = 6.77 servings",
    assumes: "a yield of about 5 cups, or roughly 6 3/4 servings of 3/4 cup each",
  },
};

function verifyAssumptions(fndById) {
  const problems = [];
  const check = (what, fdc, expect) => {
    const f = fndById[fdc];
    if (!f) { problems.push(`${what}: Foundation fdc ${fdc} not in index`); return; }
    if (!f.desc.toLowerCase().startsWith(expect.toLowerCase().slice(0, 30)))
      problems.push(`${what}: fdc ${fdc}\n      expected "${expect}"\n      actual   "${f.desc}"`);
  };
  Object.entries(MEAT_PICKS).forEach(([k, v]) => {
    check("MEAT_PICKS " + k, v.fdc, v.expect);
    // The picked entry must be the one nearest the lean percentage Jaime buys.
    const near = v.population.slice()
      .sort((a, b) => Math.abs(a.lean - v.nearestLean) - Math.abs(b.lean - v.nearestLean))[0];
    if (near.fdc !== v.fdc)
      problems.push(`MEAT_PICKS ${k}: nearest to ${v.nearestLean}% lean is ${near.fdc} (${near.lean}%), not the picked ${v.fdc}`);
  });
  Object.entries(BLENDS).forEach(([k, v]) => {
    v.parts.forEach((p) => check("BLENDS " + k, p.fdc, p.expect));
    // A blend must sit strictly above the midpoint of its parts, or it is not
    // doing what it was asked to do.
    const fats = v.parts.map((p) => fndById[p.fdc]).filter(Boolean).map((f) => f.fat).sort((a, b) => a - b);
    if (fats.length === 2) {
      const mid = (fats[0] + fats[1]) / 2;
      const val = fats[0] + v.w * (fats[1] - fats[0]);
      if (!(val > mid)) problems.push(`BLENDS ${k}: ${val.toFixed(2)} g fat is not above the midpoint ${mid.toFixed(2)}`);
    }
  });
  Object.entries(COMPOSITES).forEach(([k, v]) =>
    v.parts.forEach((p) => check("COMPOSITES " + k, p.fdc, p.expect)));
  if (problems.length) throw new Error("Assumption verification FAILED:\n  " + problems.join("\n  "));
  return Object.keys(MEAT_PICKS).length + Object.keys(BLENDS).length + Object.keys(COMPOSITES).length;
}

module.exports = { MEAT_PICKS, BLENDS, COMPOSITES, YIELD, verifyAssumptions };
