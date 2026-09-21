/* Stated assumptions — Jaime, 2026-09-21.
 *
 * Four things the recipes leave open. Each is resolved by an existing rule
 * rather than by picking a number, and each carries a note so a reader knows
 * what the figures assume.
 */

/* ---- 1. Ground beef and salmon: the 60th-percentile meat rule ------------
 *
 * Under the Foundation-first rule the population is the Foundation entries for
 * that meat, so SR Legacy's 85/15 ground beef (15.0 g fat) and its sockeye
 * (7.28 g) drop out of the running.
 *
 * Foundation carries exactly TWO entries for each:
 *
 *   ground beef   12.8 g fat  90% lean / 10% fat, raw   fdc 2514743
 *                 19.4 g fat  80% lean / 20% fat, raw   fdc 2514744
 *
 *   salmon         4.94 g fat  sockeye, wild caught     fdc 2684440
 *                 13.1  g fat  Atlantic, farm raised    fdc 2684441
 *
 * The rule picks a REAL entry at the 60th percentile by fat, not an
 * interpolated figure, so the id, the protein and the carbs stay coherent:
 *
 *   idx = round(0.6 * (n - 1)) = round(0.6 * 1) = 1  ->  the upper entry
 *
 * CAVEAT, and it is a real one: with n = 2 the 60th percentile is degenerate.
 * It can only return one of the two entries, and any percentile above the 50th
 * returns the fattier one. So this is not "slightly above the average" the way
 * it was for chicken breast, where 14 entries made the percentile meaningful -
 * it is the top of a two-entry range. For ground beef that is 19.4 g against a
 * 12.8-19.4 range; the midpoint would be 16.1 g.
 */
const MEAT_PICKS = {
  "ground beef": {
    fdc: 2514744, expect: "Beef, ground, 80% lean meat / 20% fat, raw",
    population: [
      { fdc: 2514743, fat: 12.8, desc: "Beef, ground, 90% lean meat / 10% fat, raw" },
      { fdc: 2514744, fat: 19.4, desc: "Beef, ground, 80% lean meat / 20% fat, raw" },
    ],
    assumes: "80/20 ground beef",
  },
  "salmon fillet": {
    fdc: 2684441, expect: "Fish, salmon, Atlantic, farm raised, raw",
    population: [
      { fdc: 2684440, fat: 4.94, desc: "Fish, salmon, sockeye, wild caught, raw" },
      { fdc: 2684441, fat: 13.1, desc: "Fish, salmon, Atlantic, farm raised, raw" },
    ],
    assumes: "farmed Atlantic salmon",
  },
};
MEAT_PICKS["salmon"] = MEAT_PICKS["salmon fillet"];

/* ---- 2. Mixed vegetables of choice --------------------------------------
 *
 * Jaime: use a common non-starchy mix - broccoli, bell pepper, zucchini and
 * onion in equal parts - rather than leaving the recipe as a floor.
 *
 * The recipe gives no quantity, so one is assumed: 900 g raw across the four,
 * 225 g each. That is 113 g (about 4 oz) of raw vegetables per serving across
 * the recipe's 8 servings - a normal side portion.
 *
 * Equal parts by weight means the blended per-100 g profile is the plain mean
 * of the four, which is what is computed here. All four ids stay on the row.
 */
const COMPOSITES = {
  "mixed vegetables of choice": {
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
    // The picked entry must actually be the 60th percentile of its population.
    const sorted = v.population.slice().sort((a, b) => a.fat - b.fat);
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.round(0.6 * (sorted.length - 1))));
    if (sorted[idx].fdc !== v.fdc)
      problems.push(`MEAT_PICKS ${k}: 60th percentile is ${sorted[idx].fdc}, not the picked ${v.fdc}`);
  });
  Object.entries(COMPOSITES).forEach(([k, v]) =>
    v.parts.forEach((p) => check("COMPOSITES " + k, p.fdc, p.expect)));
  if (problems.length) throw new Error("Assumption verification FAILED:\n  " + problems.join("\n  "));
  return Object.keys(MEAT_PICKS).length + Object.keys(COMPOSITES).length;
}

module.exports = { MEAT_PICKS, COMPOSITES, YIELD, verifyAssumptions };
