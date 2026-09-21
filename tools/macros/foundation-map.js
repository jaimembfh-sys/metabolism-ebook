/* Foundation Foods overrides — Jaime's rule, 2026-09-21:
 * use a Foundation entry wherever one exists for that food; fall back to
 * SR Legacy only when Foundation has nothing.
 *
 * HAND-CURATED, not auto-matched. An automatic matcher was tried first and
 * produced 88 "switches" of which most were wrong: beef tallow matched ground
 * beef 80/20 (100% fat vs 19%), coconut cream matched cashew nuts, fish sauce
 * matched salsa, hard-boiled eggs matched egg white, and every skinless
 * chicken entry matched a meat-and-skin one. Overlap scoring cannot tell that
 * "meat and skin" is disqualifying when the recipe says skinless.
 *
 * Foundation holds 321 foods with complete macros - the whole dataset, pulled
 * via /foods/list, not a sample. Most pantry items simply are not in it, which
 * is why the SR Legacy fallback list is long and that is not a defect.
 *
 * MEAT: where Foundation has several entries for one cut, the 60th percentile
 * applies as before. In practice Foundation carries exactly one entry per cut
 * in the forms these recipes use, so the percentile and the single entry
 * coincide.
 */

// key -> Foundation fdc_id. `expect` is asserted at load.
const FOUNDATION_MAP = {
  // ---- meat and fish: Foundation entry matches the recipe's wording exactly
  // No bare "boneless" key. It existed only because the matcher used to split
  // at the first comma, so "boneless, skinless chicken thighs" reduced to
  // "boneless" - and then matched CHICKEN BREAST, costing a thigh line at
  // 1.93 g fat instead of 7.92. The matcher now tries the whole line first, so
  // "chicken thighs" is reached directly and the catch-all is a liability.
  "boneless skinless chicken":        { fdc: 2646170, expect: "Chicken, breast, boneless, skinless, raw" },
  "boneless skinless chicken breasts":{ fdc: 2646170, expect: "Chicken, breast, boneless, skinless, raw" },
  "chicken breasts":                  { fdc: 2646170, expect: "Chicken, breast, boneless, skinless, raw" },
  "boneless skinless chicken thighs": { fdc: 2646171, expect: "Chicken, thigh, boneless, skinless, raw" },
  "chicken thighs":                   { fdc: 2646171, expect: "Chicken, thigh, boneless, skinless, raw" },
  "flank steak":                      { fdc: 2646175, expect: "Beef, flank, steak, boneless, choice, raw" },
  "boneless ribeye steaks":           { fdc: 2646172, expect: "Beef, ribeye, steak, boneless, choice, raw" },
  "ribeye steaks":                    { fdc: 2646172, expect: "Beef, ribeye, steak, boneless, choice, raw" },
  "pork tenderloin":                  { fdc: 2646169, expect: "Pork, loin, tenderloin, boneless, raw" },
  "large raw shrimp":                 { fdc: 2684443, expect: "Crustaceans, shrimp, farm raised, raw" },
  "shrimp":                           { fdc: 2684443, expect: "Crustaceans, shrimp, farm raised, raw" },
  "tuna packed in water":             { fdc: 334194,  expect: "Fish, tuna, light, canned in water, drained solids" },
  "cans tuna packed in water":        { fdc: 334194,  expect: "Fish, tuna, light, canned in water, drained solids" },

  // ---- eggs
  "eggs":                             { fdc: 748967, expect: "Eggs, Grade A, Large, egg whole" },
  "large eggs":                       { fdc: 748967, expect: "Eggs, Grade A, Large, egg whole" },
  "egg yolks":                        { fdc: 748236, expect: "Eggs, Grade A, Large, egg yolk" },
  "large egg yolks":                  { fdc: 748236, expect: "Eggs, Grade A, Large, egg yolk" },

  // ---- dairy
  "shredded cheddar cheese":          { fdc: 328637,  expect: "Cheese, cheddar" },
  "cheddar cheese":                   { fdc: 328637,  expect: "Cheese, cheddar" },
  "feta cheese":                      { fdc: 2259796, expect: "Cheese, feta, whole milk, crumbled" },
  "parmesan cheese":                  { fdc: 325036,  expect: "Cheese, parmesan, grated" },
  "freshly grated parmesan":          { fdc: 325036,  expect: "Cheese, parmesan, grated" },
  "cream cheese":                     { fdc: 2346385, expect: "Cream cheese, full fat, block" },
  "heavy whipping cream":             { fdc: 2346386, expect: "Cream, heavy" },
  "heavy cream":                      { fdc: 2346386, expect: "Cream, heavy" },

  // ---- produce
  // Bell pepper: Foundation has all four colours and the recipes name red,
  // yellow, orange, green and "red, yellow, or orange" across 9 lines. Red is
  // the most often named and sits at the high-carb end of the four (6.65 vs
  // green's 4.78), which is the side Jaime asked to err on.
  "bell pepper":                      { fdc: 2258590, expect: "Peppers, bell, red, raw" },
  "brussels sprouts":                 { fdc: 2685575, expect: "Brussels sprouts, raw" },
  "english cucumber":                 { fdc: 2346406, expect: "Cucumber, with peel, raw" },
  // Recipes say "green leaf or romaine" / "romaine". Foundation's own romaine
  // entry is the exact match; the older "cos or romaine" entry is the SR-style
  // combined one.
  "green leaf or romaine lettuce":    { fdc: 2346389, expect: "Lettuce, romaine, green, raw" },
  "leafy green or romaine lettuce":   { fdc: 2346389, expect: "Lettuce, romaine, green, raw" },
  "romaine lettuce":                  { fdc: 2346389, expect: "Lettuce, romaine, green, raw" },
  // Both recipes say "red or green"; green is used, and the two differ by
  // 0.014 g fat and 0.4 g carb per 100 g.
  "head red or green cabbage":        { fdc: 2346407, expect: "Cabbage, green, raw" },
  "cabbage":                          { fdc: 2346407, expect: "Cabbage, green, raw" },
  "corn":                             { fdc: 2710826, expect: "Corn, sweet, yellow and white kernels" },

  // ---- canned / pantry
  "diced tomatoes":                   { fdc: 333281,  expect: "Tomatoes, canned, red, ripe, diced" },
  "can diced tomatoes":               { fdc: 333281,  expect: "Tomatoes, canned, red, ripe, diced" },
  "canned crushed tomatoes":          { fdc: 2685581, expect: "Tomatoes, crushed, canned" },
  "tomato sauce":                     { fdc: 2685579, expect: "Tomato, sauce, canned, with salt added" },
  "can tomato sauce":                 { fdc: 2685579, expect: "Tomato, sauce, canned, with salt added" },
  "chickpeas":                        { fdc: 2644288, expect: "Chickpeas (garbanzo beans, bengal gram), canned" },
  "can chickpeas":                    { fdc: 2644288, expect: "Chickpeas (garbanzo beans, bengal gram), canned" },
  "black beans":                      { fdc: 2644285, expect: "Beans, black, canned" },
  "can black beans":                  { fdc: 2644285, expect: "Beans, black, canned" },
  "almonds":                          { fdc: 2346393, expect: "Nuts, almonds, whole, raw" },
  // Foundation carries almond flour as its own lab-measured food, so this no
  // longer has to stand in as ground blanched almonds the way SR Legacy did.
  "almond flour":                     { fdc: 2261420, expect: "Flour, almond" },
  "coconut oil":                      { fdc: 330458,  expect: "Oil, coconut" },
  // Foundation carries a real coconut flour, so this comes off the BRANDED
  // entry (2339682) it was on for want of anything better.
  "coconut flour":                    { fdc: 2515382, expect: "Flour, coconut" },

  // ---- vegetables and aromatics
  "asparagus":                        { fdc: 2710823, expect: "Asparagus, green, raw" },
  "broccoli":                         { fdc: 747447,  expect: "Broccoli, raw" },
  "fresh broccoli":                   { fdc: 747447,  expect: "Broccoli, raw" },
  "broccoli florets":                 { fdc: 747447,  expect: "Broccoli, raw" },
  // Recipes say "carrots", not baby carrots, so the mature entry is the match.
  "carrots":                          { fdc: 2258586, expect: "Carrots, mature, raw" },
  "celery":                           { fdc: 2346405, expect: "Celery, raw" },
  "celery ribs":                      { fdc: 2346405, expect: "Celery, raw" },
  "garlic":                           { fdc: 1104647, expect: "Garlic, raw" },
  "garlic cloves":                    { fdc: 1104647, expect: "Garlic, raw" },
  // Foundation splits onions by colour where SR Legacy had one "Onions, raw".
  "onion":                            { fdc: 790646,  expect: "Onions, yellow, raw" },
  "yellow onion":                     { fdc: 790646,  expect: "Onions, yellow, raw" },
  "red onion":                        { fdc: 790577,  expect: "Onions, red, raw" },
  "pickled red onion":                { fdc: 790577,  expect: "Onions, red, raw" },
  // Recipes say plain "mushrooms", which is the white button.
  "mushrooms":                        { fdc: 1999629, expect: "Mushrooms, white button" },
  "zucchini":                         { fdc: 2685568, expect: "Squash, summer, green, zucchini, includes skin, raw" },
  "zucchini or yellow summer squash": { fdc: 2685568, expect: "Squash, summer, green, zucchini, includes skin, raw" },
  // Foundation has only the Hass, which is the supermarket avocado these
  // recipes mean. It is markedly fattier than SR's all-varieties average
  // (20.3 vs 14.66 g/100 g), and avocado carries several of these recipes.
  "avocado":                          { fdc: 2710824, expect: "Avocado, Hass, peeled, raw" },
  // "tart apple" is a Granny Smith.
  "tart apple":                       { fdc: 1750342, expect: "Apples, granny smith, with skin, raw" },
  // Foundation carries the Roma as its own food, which is what the guacamole
  // names. This clears a flag rather than switching a source.
  "roma tomato":                      { fdc: 1999634, expect: "Tomato, roma" },
  "cherry or grape tomatoes":         { fdc: 321360,  expect: "Tomatoes, grape, raw" },
  "halved cherry tomatoes":           { fdc: 321360,  expect: "Tomatoes, grape, raw" },

  // ---- nuts and seeds
  "pecans":                           { fdc: 2346395, expect: "Nuts, pecans, halves, raw" },
  // Recipe offers either; pecans is named first and is the fattier of the two.
  "pecans or walnuts":                { fdc: 2346395, expect: "Nuts, pecans, halves, raw" },
  "walnuts":                          { fdc: 2346394, expect: "Nuts, walnuts, English, halves, raw" },
  "raw macadamia nuts":               { fdc: 2515378, expect: "Nuts, macadamia nuts, raw" },
  "macadamia nuts":                   { fdc: 2515378, expect: "Nuts, macadamia nuts, raw" },
  "peanuts":                          { fdc: 2515376, expect: "Peanuts, raw" },
  "pumpkin seeds":                    { fdc: 2515380, expect: "Seeds, pumpkin seeds (pepitas), raw" },
  "chia seeds":                       { fdc: 2710819, expect: "Chia seeds, dry, raw" },
  // Flaxseed meal is ground flaxseed, which Foundation carries as its own food.
  "flaxseed meal":                    { fdc: 2262075, expect: "Flaxseed, ground" },
  // Tahini is sesame butter.
  "well-stirred tahini":              { fdc: 2262073, expect: "Sesame butter, creamy" },
  "tahini":                           { fdc: 2262073, expect: "Sesame butter, creamy" },

  "peanut butter":                    { fdc: 2262072, expect: "Peanut butter, creamy" },
  "natural creamy peanut butter":     { fdc: 2262072, expect: "Peanut butter, creamy" },
  "smooth peanut butter":             { fdc: 2262072, expect: "Peanut butter, creamy" },

  // ---- remaining dairy
  "plain greek yogurt":               { fdc: 2259794, expect: "Yogurt, Greek, plain, whole milk" },
  // Foundation carries only low-fat buttermilk. It is 1-2 tbsp used to thin a
  // dip, so the difference from whole is under 0.4 g fat in the whole recipe.
  "buttermilk":                       { fdc: 2259792, expect: "Buttermilk, low fat" },
  "buttermilk or milk":               { fdc: 2259792, expect: "Buttermilk, low fat" },
  "sliced swiss cheese":              { fdc: 746767,  expect: "Cheese, swiss" },
  "swiss cheese":                     { fdc: 746767,  expect: "Cheese, swiss" },

  // ---- condiments
  "marinara sauce":                   { fdc: 332282,  expect: "Sauce, pasta, spaghetti/marinara, ready-to-serve" },
  "salsa":                            { fdc: 746777,  expect: "Sauce, salsa, ready-to-serve" },
  "dill pickle":                      { fdc: 324653,  expect: "Pickles, cucumber, dill or kosher dill" },
  "yellow mustard":                   { fdc: 326698,  expect: "Mustard, prepared, yellow" },
  // Neither dataset has Dijon; prepared yellow was already the stand-in under
  // SR Legacy, so this switches the same approximation onto Foundation rather
  // than introducing a new one.
  "dijon mustard":                    { fdc: 326698,  expect: "Mustard, prepared, yellow" },
};

/* Deliberately NOT switched, with the reason. These are the cases where a
 * Foundation entry exists but describes a different food from the one the
 * recipe names.
 */
const FOUNDATION_REJECTED = {
  "bacon": "Foundation has only 'Pork, cured, bacon, cooked, restaurant'. Recipes weigh raw bacon, so SR Legacy 'unprepared' is the right food.",
  "italian sausage": "Foundation has only the cooked, pan-fried entry. Recipes use it raw.",
  "kielbasa smoked sausage": "Foundation has no Polish/kielbasa sausage.",
  "mozzarella cheese": "Foundation has only low-moisture part-skim. The recipes do not specify, and part-skim is a different product from whole milk.",
  "diced jarred jalapeños": "Foundation has raw and seeded-raw jalapeno; the recipe says jarred, which is neither.",
  "hard-boiled eggs": "Foundation has no cooked whole egg - only dried, frozen and separated forms.",
  "blue cheese": "Foundation has no blue cheese; the nearest is processed American.",
  "sliced ham": "Foundation's only ham is 'sliced, pre-packaged, deli meat (96% fat free, water added)' at 3.73 g fat. The recipe says plain sliced ham, which SR Legacy carries at approximately 11% fat. Taking the Foundation entry would have cut the ham fat by more than half by switching to a leaner product, not by measuring the same one better.",
  "coconut cream": "Foundation has no coconut cream.",
  "coconut milk": "Foundation has no coconut milk (the almond and oat milks are different foods).",
  "fish sauce": "Foundation has no fish sauce.",
  "oyster sauce": "Foundation has no oyster sauce.",
  "pitted kalamata olives": "Foundation has only green Manzanilla stuffed with pimiento, which is a different olive and a different preparation.",
  "low sugar ketchup": "Foundation has only 'Ketchup, restaurant' - a foodservice packet. The recipe specifies low-sugar bottled, and neither dataset carries it; SR's generic catsup is the nearer product.",
  "spaghetti squash": "Foundation carries acorn and butternut winter squash but not spaghetti squash.",
  "sesame seeds": "Foundation has sesame butter but not the whole seed.",
  "unsweetened coconut flakes": "Foundation's only coconut foods are flour and oil.",
  "rotisserie chicken": "Foundation has no cooked whole-bird chicken; its cooked entries are single cuts, braised.",
  "cooked chicken": "Foundation has no cooked whole-bird chicken; its cooked entries are single cuts, braised.",
  "salmon fillet": "FLAGGED pending Jaime's choice - Foundation carries farmed Atlantic at 13.1 g fat and wild sockeye at 4.94 g, a 2.6x spread.",
  "ground beef": "FLAGGED pending Jaime's choice - Foundation carries 80/20 at 19.4 g and 90/10 at 12.8 g.",
};

function verifyFoundation(byId) {
  const problems = [];
  Object.entries(FOUNDATION_MAP).forEach(([k, v]) => {
    const f = byId[v.fdc];
    if (!f) { problems.push(`${k}: Foundation fdc_id ${v.fdc} not in index`); return; }
    const want = v.expect.toLowerCase().slice(0, 30);
    if (!f.desc.toLowerCase().startsWith(want)) {
      problems.push(`${k}: fdc ${v.fdc}\n      expected "${v.expect}"\n      actual   "${f.desc}"`);
    }
  });
  if (problems.length) throw new Error("Foundation map verification FAILED:\n  " + problems.join("\n  "));
  return Object.keys(FOUNDATION_MAP).length;
}

module.exports = { FOUNDATION_MAP, FOUNDATION_REJECTED, verifyFoundation };
