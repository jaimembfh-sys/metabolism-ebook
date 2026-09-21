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
const YIELD = {
  "traditional-guacamole-with-veggies": {
    servings: 6.77,
    cups: 5.075,
    why: "5.08 cups total yield ÷ 3/4 cup per serving = 6.77 servings",
    assumes: "a yield of about 5 cups, or roughly 6 3/4 servings of 3/4 cup each",
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

module.exports = { BLENDS, COMPOSITES, YIELD, blendWeight, verifyAssumptions };
