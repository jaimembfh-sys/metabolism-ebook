/* Third and final batch of verified mappings.
 *
 * Same discipline as the first two: every fdc_id was found by searching the SR
 * Legacy dataset and then read to confirm it is the right food, and report.js
 * asserts each one at load.
 *
 * EXTRA_NEGLIGIBLE covers the sweetener, herb and salt variants that kept
 * flagging only because the negligible test is an exact match (deliberately -
 * a substring test previously zeroed "bell pepper" on the word "pepper").
 *
 * STILL_FLAGGED are foods with no SR Legacy entry. They stay flagged and
 * excluded rather than being approximated by a near neighbour.
 */

const EXTRA_NEGLIGIBLE = [
  // sweeteners - no SR Legacy entry, treated as inert per Jaime's course
  "monk fruit/allulose blend", "allulose/monk fruit blend", "powdered sweetener",
  "sugar-free powdered sweetener", "so nourished monk fruit sweetener with allulose",
  "granulated sweetener", "brown sweetener", "confectioners sweetener",
  // Jaime, 2026-09-21: xanthan gum is used in teaspoon amounts, count as zero.
  "xanthan gum",
  // herbs, aromatics and seasonings at recipe quantities
  // norm() strips "chopped"/"fresh" qualifiers before the negligible test,
  // which is an exact match, so the post-norm forms are the ones that have to
  // be listed. "chopped parsley" alone never matched and was being flagged.
  "chopped parsley", "chopped fresh parsley leaves", "fresh parsley or dill",
  "parsley", "fresh parsley leaves", "parsley leaves",
  "sprig fresh rosemary", "fresh rosemary sprigs", "whole cloves",
  "ground black pepper", "pinch of sea salt", "seasoned salt",
  "kosher salt and freshly ground black pepper", "real vanilla extract",
  // Post-norm forms. norm() strips "freshly ground", so the key above could
  // never be reached on its own.
  "kosher salt and black pepper", "salt and pepper", "black pepper",
  // 1/3 cup of chopped cilantro is about 5 kcal and no measurable macro.
  "cilantro", "fresh cilantro", "chopped cilantro", "chopped fresh cilantro",
  "zest of 1 lemon", "zest of 1/2 lemon", "lemon zest", "avocado oil spray",
  "cold water or aquafaba", "ice", "fresh thyme sprigs",
  /* Kaffir lime LEAVES are an aromatic, crushed into the pan and fished out
   * before serving - they weigh well under a gram each. They were matching the
   * "lime" key and being costed as twelve whole limes: 804 g, contributing
   * 84.7 g of the Thai Panang curry's 130.7 g of carbs, from a leaf nobody
   * eats. NEGLIGIBLE is tested after the map lookup, so listing them here
   * overrides that match.
   */
  "kaffir lime leaves", "kaffir lime leaves if using", "lime leaves",
  // A dash, and the only flagged item left in the guacamole.
  "dash of tapatío hot sauce", "tapatío hot sauce",
];

// No SR Legacy entry. Excluded from totals and reported per recipe.
/* Nothing is permanently flagged any more.
 *
 * "mixed vegetables of choice" became a composite, then an exclusion, on
 * Jaime's instruction - see assumptions.js. "the soaked and drained macadamia
 * nuts" is a back-reference and is now detected as one by isBackRef rather
 * than being reported as a missing match.
 *
 * The only ingredient still unresolved is the Mae Ploy panang curry paste,
 * which is a branded product neither dataset carries, and it flags through the
 * ordinary "no confident USDA match" path rather than being listed here.
 */
const STILL_FLAGGED = {};

const MAP3 = {
  // Jaime, 2026-09-21: almond flour IS ground blanched almonds, so it maps to
  // the same food rather than staying flagged.
  "almond flour":         { fdc: 170568, expect: "Nuts, almonds, blanched", grams: { cup: 96, tbsp: 6, oz: 28.35, g: 1 } },
  // Keys WITHOUT the leading unit word. "cans tuna..." could never match,
  // because the unit is consumed before the food name is read.
  "tuna packed in water": { fdc: 171986, expect: "Fish, tuna, light, canned in water, without salt, drained solids", grams: { can: 142, each: 142, cup: 154, oz: 28.35 } },
  "diced green chilies":  { fdc: 168577, expect: "Peppers, chili, green, canned", grams: { can: 113, each: 113, cup: 139, oz: 28.35 } },
  "chickpeas":            { fdc: 173800, expect: "Chickpeas (garbanzo beans, bengal gram), mature seeds, canned", grams: { can: 425, each: 425, cup: 240, oz: 28.35 } },
  "black beans":          { fdc: 175188, expect: "Beans, black turtle, mature seeds, canned", grams: { can: 425, each: 425, cup: 240, oz: 28.35 } },
  "salmon fillet":        { fdc: 173686, expect: "Fish, salmon, Atlantic, wild, raw", grams: { each: 170, oz: 28.35, lb: 453.6, fillet: 170 } },
  "salmon":               { fdc: 173686, expect: "Fish, salmon, Atlantic, wild, raw", grams: { each: 170, oz: 28.35, lb: 453.6, fillet: 170 } },
  "large raw shrimp":     { fdc: 175179, expect: "Crustaceans, shrimp, raw", grams: { lb: 453.6, oz: 28.35, each: 11, cup: 145 } },
  "shrimp":               { fdc: 175179, expect: "Crustaceans, shrimp, raw", grams: { lb: 453.6, oz: 28.35, each: 11, cup: 145 } },
  "kielbasa smoked sausage": { fdc: 174577, expect: "Polish sausage, pork", grams: { lb: 453.6, oz: 28.35, each: 370, link: 370, cup: 150 } },
  "head red or green cabbage": { fdc: 169975, expect: "Cabbage, raw", grams: { head: 900, each: 900, cup: 89, lb: 453.6, oz: 28.35 } },
  "cabbage":              { fdc: 169975, expect: "Cabbage, raw", grams: { head: 900, each: 900, cup: 89, lb: 453.6, oz: 28.35 } },
  "zucchini or yellow summer squash": { fdc: 169291, expect: "Squash, summer, zucchini, includes skin, raw", grams: { each: 196, medium: 196, large: 320, cup: 124, lb: 453.6 } },
  "zucchini":             { fdc: 169291, expect: "Squash, summer, zucchini, includes skin, raw", grams: { each: 196, medium: 196, large: 320, cup: 124, lb: 453.6 } },
  "diced jarred jalapeños": { fdc: 168576, expect: "Peppers, jalapeno, raw", grams: { cup: 90, tbsp: 5.6, each: 14, oz: 28.35 } },
  "jalapeño":             { fdc: 168576, expect: "Peppers, jalapeno, raw", grams: { cup: 90, tbsp: 5.6, each: 14, oz: 28.35 } },
  "cans diced green chilies": { fdc: 168577, expect: "Peppers, chili, green, canned", grams: { can: 113, cup: 139, oz: 28.35 } },
  "60% ghirardelli dark chocolate": { fdc: 170272, expect: "Chocolate, dark, 60-69% cacao solids", grams: { cup: 170, oz: 28.35, tbsp: 11 } },
  "dark chocolate":       { fdc: 170272, expect: "Chocolate, dark, 60-69% cacao solids", grams: { cup: 170, oz: 28.35, tbsp: 11 } },
  "freshly grated parmesan": { fdc: 170848, expect: "Cheese, parmesan, hard", grams: { cup: 100, tbsp: 6.25, oz: 28.35 } },
  "corn":                 { fdc: 169998, expect: "Corn, sweet, yellow, raw", grams: { cup: 154, each: 90, oz: 28.35, can: 425 } },

  /* Collision fix, found while applying the Foundation rule. Neither of these
   * had a key of its own, so findKey matched the substring "butter" and costed
   * them as salted butter - 81 g fat per 100 g. Peanut butter is 51 and
   * buttermilk is 3.3. Same class of bug as "pepper" zeroing "bell pepper".
   * Affects keto-peanut-butter-balls, thai-slaw-with-peanut-dressing,
   * thai-panang-chicken-curry and homemade-greek-yogurt-ranch-dip.
   */
  "peanut butter":        { fdc: 172470, expect: "Peanut butter, smooth style, without salt", grams: { cup: 258, tbsp: 16, oz: 28.35 } },
  "natural creamy peanut butter": { fdc: 172470, expect: "Peanut butter, smooth style, without salt", grams: { cup: 258, tbsp: 16, oz: 28.35 } },
  "smooth peanut butter": { fdc: 172470, expect: "Peanut butter, smooth style, without salt", grams: { cup: 258, tbsp: 16, oz: 28.35 } },
  "buttermilk":           { fdc: 172225, expect: "Milk, buttermilk, fluid, whole", grams: { cup: 245, tbsp: 15.3, oz: 29.6 } },
  // Roma/plum tomato, 62 g each — USDA's standard weight for the variety.
  "roma tomato":          { fdc: 170457, expect: "Tomatoes, red, ripe, raw, year round average", grams: { each: 62, cup: 180, oz: 28.35 } },
  "grape tomatoes":       { fdc: 170457, expect: "Tomatoes, red, ripe, raw, year round average", grams: { cup: 149, each: 8, pint: 300, oz: 28.35 } },
  // "4 tsp peeled and finely minced ginger" reduces to "peeled and ginger",
  // which reached neither "fresh ginger" nor "peeled and fresh ginger".
  "ginger":               { fdc: 169231, expect: "Ginger root, raw", grams: { tsp: 2, tbsp: 6, cup: 96, each: 30, oz: 28.35 } },
  // "Juice of 1 lime", "Juice of 1/2 lime" — the line leads with the word
  // "Juice", so no quantity parses off the front and the row used to flag for
  // want of one. DEFAULT_QTY below supplies it.
  "juice of 1 lime":      { fdc: 168156, expect: "Lime juice, raw", grams: { each: 30, tbsp: 15, cup: 242 } },
  "juice of 1 lemon":     { fdc: 167747, expect: "Lemon juice, raw", grams: { each: 45, tbsp: 15, cup: 244 } },
  "buttermilk or milk":   { fdc: 172225, expect: "Milk, buttermilk, fluid, whole", grams: { cup: 245, tbsp: 15.3, oz: 29.6 } },

  /* Jaime, 2026-09-22: the pancakes call for "ghee or coconut oil" instead of
   * butter. Costed at ghee, the first option, the same way "beef tallow or
   * avocado oil" is costed at the first.
   *
   * Ghee is butter with the water and milk solids taken out, so it is denser
   * in every sense: 900 kcal and 100 g fat per 100 g against butter's 717 and
   * 81. Per tablespoon the gap is smaller than that sounds, because a Tbsp of
   * ghee weighs slightly less.
   *
   * SR Legacy has no portion entry for ghee, so the 14 g comes from FDC
   * Branded: 10 ghee products state a tablespoon serving, median 14 g, range
   * 13-15. Not a figure from memory.
   *
   * The key has to be longer than the existing "coconut oil" key for findKey
   * to prefer it - it sorts by length - which it is.
   */
  "ghee or coconut oil":  { fdc: 171314, expect: "Butter, Clarified butter (ghee)", grams: { tbsp: 14, tsp: 4.7, cup: 224 } },
};

/* Unit additions for entries already mapped in earlier batches, where a recipe
 * used a measure the original table did not carry - "2 tbsp celery",
 * "1 can chickpeas", "8 oz romaine". Merged over the existing grams table.
 */
const UNIT_PATCH = {
  "celery":                  { tbsp: 7.5, stalk: 40, each: 40 },
  "celery ribs":             { tbsp: 7.5, stalk: 40, each: 40 },
  "can chickpeas":           { each: 425, can: 425 },
  "chickpeas":               { each: 425, can: 425 },
  "can black beans":         { each: 425, can: 425 },
  "can tomato sauce":        { each: 411, can: 411 },
  "can diced tomatoes":      { each: 411, can: 411 },
  "diced tomatoes":          { each: 411, can: 411 },
  "cans tuna packed in water": { each: 142, can: 142 },
  "cans diced green chilies": { each: 113, can: 113 },
  "romaine lettuce":         { oz: 28.35, head: 300, each: 300 },
  "leafy green or romaine lettuce": { oz: 28.35, head: 300, each: 300 },
  "bacon":                   { lb: 453.6, slice: 28, oz: 28.35, cup: 60 },
  "dijon mustard":           { each: 15 },        // "1 heaping Tbsp"
  "juice of 1/2 lime":       { each: 15 },
  "halved cherry tomatoes":  { cup: 149, each: 17, pint: 300 },
  "shredded cheddar cheese": { cup: 113, oz: 28.35, tbsp: 7, slice: 21 },
  "cooked chicken":          { cup: 140, each: 174, lb: 453.6, oz: 28.35 },
  "almond flour":            { cup: 96, tbsp: 6, oz: 28.35 },

  /* Four produce entries in usda-map-2.js carry an identical gram table -
   * {cup:150, oz:28.35, lb:453.6, each:120, medium:120, small:90, large:160}.
   * It is a stamped placeholder, not a reading of the dataset: the same table
   * sits on carrots and on cherry tomatoes, where "1 each = 120 g" is a whole
   * tomato's weight for a single cherry. The real portions below are read out
   * of food_portion.csv. Same class as the onion sizes fixed on 2026-09-21.
   *
   * Only two of the four changed a number in the book - carrots by size, and
   * carrots by the cup. Brussels sprouts and asparagus are both bought by the
   * pound in these recipes, so their placeholder never fired; it is corrected
   * here so it cannot fire later.
   */
  // Peppers, sweet, red, raw (170108). Table had each/medium only, so
  // "6 large bell peppers" was costed as six mediums.
  "bell pepper":             { small: 74, medium: 119, large: 164, each: 119, cup: 149 },
  // Carrots, raw (170393). Placeholder large was 160 g against USDA's 72.
  // cup is "strips or slices" (122 g) rather than chopped (128 g) because the
  // book's only carrot-by-the-cup line is matchsticks. Split the key if a
  // recipe ever calls for chopped carrots by volume.
  "carrots":                 { small: 50, medium: 61, large: 72, each: 61, cup: 122 },
  // Brussels sprouts, raw (170383) and Asparagus, raw (168389). Latent only.
  "brussels sprouts":        { each: 19, sprout: 19, cup: 88 },
  "asparagus":               { each: 16, spear: 16, cup: 134 },
};

/* Lines that name their own quantity in words rather than as a leading
 * numeral, so nothing parses off the front. "Juice of 1 lime" is one lime's
 * worth of juice; the gram weight then comes from the entry's "each".
 */
const DEFAULT_QTY = {
  "juice of 1 lime": 1,
  "juice of 1/2 lime": 1,
  "juice of 1 lemon": 1,
};

/* Ingredients written as a range are costed at their MIDPOINT by default -
 * "2 to 3 Tbsp jalapeño" is calculated at 2.5. These take the upper bound
 * instead, on Jaime's instruction.
 */
const RANGE_UPPER = {
  // Jaime, 2026-09-21: calculate the panang curry paste at 2 Tbsp.
  "mae ploy panang curry paste": true,
  "panang curry paste": true,
};

module.exports = { MAP3, EXTRA_NEGLIGIBLE, STILL_FLAGGED, UNIT_PATCH, DEFAULT_QTY, RANGE_UPPER };

/* ---- Meat rule overrides, 2026-09-21 ----
 * Applied after the 60th-percentile analysis in meat-rule.js. Four picks
 * changed; chicken breast, ground beef, flank steak and ribeye were already
 * sitting at their 60th percentile and are unchanged.
 */
module.exports.MEAT_OVERRIDE = {
  "boneless skinless chicken thighs": { fdc: 173627, expect: "Chicken, broilers or fryers, dark meat, thigh, meat only, raw", grams: { lb: 453.6, oz: 28.35, each: 75, cup: 140 } },
  "chicken thighs":                   { fdc: 173627, expect: "Chicken, broilers or fryers, dark meat, thigh, meat only, raw", grams: { lb: 453.6, oz: 28.35, each: 75, cup: 140 } },
  "pork tenderloin":                  { fdc: 169184, expect: "Pork, fresh, loin, tenderloin, separable lean and fat, raw", grams: { lb: 453.6, oz: 28.35, each: 450 } },
  "large raw shrimp":                 { fdc: 174210, expect: "Crustaceans, shrimp, mixed species, raw", grams: { lb: 453.6, oz: 28.35, each: 11, cup: 145 } },
  "shrimp":                           { fdc: 174210, expect: "Crustaceans, shrimp, mixed species, raw", grams: { lb: 453.6, oz: 28.35, each: 11, cup: 145 } },
  "salmon fillet":                    { fdc: 168045, expect: "Fish, salmon, sockeye (red), raw", grams: { each: 170, oz: 28.35, lb: 453.6, fillet: 170 } },
  "salmon":                           { fdc: 168045, expect: "Fish, salmon, sockeye (red), raw", grams: { each: 170, oz: 28.35, lb: 453.6, fillet: 170 } },
};
