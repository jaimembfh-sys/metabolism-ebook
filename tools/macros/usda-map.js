/* Curated ingredient -> USDA SR Legacy mapping.
 *
 * EVERY fdc_id here was found by searching the local SR Legacy dataset
 * (find-usda.js) and then read to confirm it is the right food. None were
 * written from memory.
 *
 * That distinction is not pedantic. The first version of this file WAS written
 * from memory and 14 of its 40 ids pointed at the wrong food: avocado oil
 * resolved to corn oil, sesame oil to safflower oil, flank steak to beef
 * pancreas, coconut flour to dark chocolate, blue cheese to cottage cheese.
 * Every number derived from it was wrong, and none of it was visible without
 * checking the ids back against the dataset.
 *
 * So `expect` below is a real assertion, not documentation. verifyMap() runs at
 * load and throws if an id no longer resolves to the description it was chosen
 * for. If the dataset is ever updated, that fails loudly instead of silently
 * changing the macros in 43 recipes.
 *
 * grams: how many grams one unit of the stated measure weighs. Volume-to-weight
 * for fats uses standard densities (olive oil 13.5 g/Tbsp, butter 14.2 g/Tbsp).
 */

const NEGLIGIBLE = [
  "salt", "sea salt", "kosher salt", "black pepper", "pepper", "salt and pepper",
  "freshly ground black pepper", "white vinegar", "red wine vinegar", "apple cider vinegar",
  "rice vinegar", "dill pickle juice or white vinegar", "vanilla extract", "almond extract",
  "baking powder", "baking soda", "cream of tartar",
  "paprika", "smoked paprika", "ground cumin", "chili powder", "chili flakes", "dried oregano",
  "dried basil", "dried thyme", "dried parsley", "garlic powder", "onion powder",
  "red pepper flakes", "cayenne", "ground cinnamon", "cinnamon", "nutmeg", "ground ginger",
  "italian seasoning", "bay leaf", "turmeric", "curry powder", "everything bagel seasoning",
  "fresh parsley", "fresh dill", "fresh basil", "fresh cilantro", "fresh chives", "fresh thyme",
  "fresh rosemary", "fresh mint", "green onions", "scallions",
  "tabasco sauce", "hot sauce", "lemon zest", "lime zest", "water", "hot water", "ice water",
  "fresh lemon juice", "fresh lime juice", "lemon juice", "lime juice",
  // Sugar alcohols and rare sugars. SR Legacy has no entry, and Jaime's course
  // treats them as metabolically inert. Zeroed, and listed here so the decision
  // is visible rather than buried.
  "monk fruit/allulose sweetener", "monk fruit allulose blend", "monk fruit sweetener",
  "allulose", "erythritol", "stevia", "monk fruit",
];

// No SR Legacy entry exists. Flagged per recipe, never approximated.
const FLAGGED = {
  "coconut flour": "no SR Legacy entry; desiccated coconut is NOT equivalent (~69% fat vs ~14%)",
  "almond flour": "no SR Legacy entry for the defatted flour",
  "psyllium husk": "no SR Legacy entry",
  "collagen peptides": "no SR Legacy entry",
  "protein powder": "brand-dependent, no generic entry",
  "coconut aminos": "no SR Legacy entry; tamari is a different product",
  "pork rinds": "no SR Legacy entry",
  "nutritional yeast": "no SR Legacy entry",
};

const MAP = {
  // ---- fats and oils ----
  "butter":                 { fdc: 173410, expect: "Butter, salted", grams: { tbsp: 14.2, cup: 227, tsp: 4.7 } },
  "beef tallow":            { fdc: 171400, expect: "Fat, beef tallow", grams: { tbsp: 12.8, cup: 205, tsp: 4.3 } },
  "olive oil":              { fdc: 171413, expect: "Oil, olive, salad or cooking", grams: { tbsp: 13.5, cup: 216, tsp: 4.5 } },
  "extra-virgin olive oil": { fdc: 171413, expect: "Oil, olive, salad or cooking", grams: { tbsp: 13.5, cup: 216, tsp: 4.5 } },
  "avocado oil":            { fdc: 173573, expect: "Oil, avocado", grams: { tbsp: 13.6, cup: 218, tsp: 4.5 } },
  "sesame oil":             { fdc: 171016, expect: "Oil, sesame, salad or cooking", grams: { tbsp: 13.6, cup: 218, tsp: 4.5 } },
  "coconut oil":            { fdc: 171412, expect: "Oil, coconut", grams: { tbsp: 13.6, cup: 218, tsp: 4.5 } },
  "mayonnaise":             { fdc: 171418, expect: "Salad dressing, mayonnaise, soybean oil, without salt", grams: { tbsp: 13.8, cup: 220, tsp: 4.6 } },
  "homemade mayo":          { fdc: 171418, expect: "Salad dressing, mayonnaise, soybean oil, without salt", grams: { tbsp: 13.8, cup: 220, tsp: 4.6 } },

  // ---- proteins ----
  "boneless ribeye steaks": { fdc: 173402, expect: "Beef, rib eye steak, boneless, lip off, separable lean and fat", grams: { each: 340, oz: 28.35, lb: 453.6 } },
  "ribeye steaks":          { fdc: 173402, expect: "Beef, rib eye steak, boneless, lip off, separable lean and fat", grams: { each: 340, oz: 28.35, lb: 453.6 } },
  "flank steak":            { fdc: 169563, expect: "Beef, flank, steak, separable lean and fat, trimmed to 0\" fat, all grades", grams: { lb: 453.6, oz: 28.35 } },
  "ground beef":            { fdc: 171796, expect: "Beef, ground, 85% lean meat / 15% fat, raw", grams: { lb: 453.6, oz: 28.35, cup: 225 } },
  "eggs":                   { fdc: 171287, expect: "Egg, whole, raw, fresh", grams: { each: 50, large: 50 } },
  "large eggs":             { fdc: 171287, expect: "Egg, whole, raw, fresh", grams: { each: 50, large: 50 } },
  "hard-boiled eggs":       { fdc: 173424, expect: "Egg, whole, cooked, hard-boiled", grams: { each: 50 } },
  "rotisserie chicken":     { fdc: 171054, expect: "Chicken, broilers or fryers, meat only, cooked, roasted", grams: { cup: 140, oz: 28.35, lb: 453.6 } },
  "cooked chicken":         { fdc: 171054, expect: "Chicken, broilers or fryers, meat only, cooked, roasted", grams: { cup: 140, oz: 28.35, lb: 453.6 } },
  "bacon":                  { fdc: 167914, expect: "Pork, cured, bacon, cooked, baked", grams: { slice: 8, cup: 60, oz: 28.35 } },

  // ---- dairy ----
  "blue cheese":            { fdc: 172175, expect: "Cheese, blue", grams: { cup: 135, oz: 28.35 } },
  "parmesan cheese":        { fdc: 171247, expect: "Cheese, parmesan, grated", grams: { cup: 100, tbsp: 6.25, oz: 28.35 } },
  "cream cheese":           { fdc: 173418, expect: "Cheese, cream", grams: { cup: 232, tbsp: 14.5, oz: 28.35 } },

  // ---- produce ----
  "avocado":                { fdc: 171705, expect: "Avocados, raw, all commercial varieties", grams: { each: 201, large: 230, medium: 201 } },
  "mushrooms":              { fdc: 169251, expect: "Mushrooms, white, raw", grams: { oz: 28.35, cup: 70, lb: 453.6 } },
  "garlic":                 { fdc: 169230, expect: "Garlic, raw", grams: { clove: 3, tsp: 2.8, each: 3 } },
  "garlic cloves":          { fdc: 169230, expect: "Garlic, raw", grams: { clove: 3, each: 3 } },
  "fresh broccoli":         { fdc: 170379, expect: "Broccoli, raw", grams: { lb: 453.6, cup: 91 } },
  "broccoli":               { fdc: 170379, expect: "Broccoli, raw", grams: { lb: 453.6, cup: 91 } },
  "green leaf or romaine lettuce": { fdc: 169247, expect: "Lettuce, cos or romaine, raw", grams: { cup: 47 } },
  "romaine lettuce":        { fdc: 169247, expect: "Lettuce, cos or romaine, raw", grams: { cup: 47 } },
  "cherry or grape tomatoes": { fdc: 170457, expect: "Tomatoes, red, ripe, raw, year round average", grams: { cup: 149, each: 17 } },
  "pickled red onion":      { fdc: 170000, expect: "Onions, raw", grams: { cup: 160 } },
  "red onion":              { fdc: 170000, expect: "Onions, raw", grams: { each: 110, cup: 160, medium: 110 } },
  "onion":                  { fdc: 170000, expect: "Onions, raw", grams: { each: 110, cup: 160, medium: 110 } },
  "fresh ginger":           { fdc: 169231, expect: "Ginger root, raw", grams: { tsp: 2, tbsp: 6 } },
  "celery":                 { fdc: 169988, expect: "Celery, raw", grams: { rib: 40, cup: 101 } },

  // ---- pantry ----
  "corn starch":            { fdc: 169698, expect: "Cornstarch", grams: { tbsp: 8, cup: 128 } },
  "tamari or coconut aminos": { fdc: 174278, expect: "Soy sauce made from soy (tamari)", grams: { tbsp: 18, cup: 288 } },
  "tamari":                 { fdc: 174278, expect: "Soy sauce made from soy (tamari)", grams: { tbsp: 18, cup: 288 } },
  "dijon mustard":          { fdc: 172234, expect: "Mustard, prepared, yellow", grams: { tbsp: 15, tsp: 5 } },
  "honey":                  { fdc: 169640, expect: "Honey", grams: { tbsp: 21, tsp: 7 } },
  "sesame seeds":           { fdc: 170150, expect: "Seeds, sesame seeds, whole, dried", grams: { tbsp: 9, tsp: 3 } },
  "pecans or walnuts":      { fdc: 170182, expect: "Nuts, pecans", grams: { cup: 99, tbsp: 6.2 } },
  "dill pickle":            { fdc: 168558, expect: "Pickles, cucumber, dill or kosher dill", grams: { slice: 6, cup: 143, each: 65 } },
  "coconut milk":           { fdc: 170173, expect: "Nuts, coconut milk, canned", grams: { cup: 226, tbsp: 14, oz: 28.35 } },
};

/** Throws if any id stopped resolving to the food it was chosen for. */
function verifyMap(byId) {
  const problems = [];
  Object.entries(MAP).forEach(([key, v]) => {
    const f = byId[v.fdc];
    if (!f) { problems.push(`${key}: fdc_id ${v.fdc} not in the index`); return; }
    const a = f.desc.toLowerCase();
    const b = v.expect.toLowerCase();
    if (!a.startsWith(b.slice(0, Math.min(b.length, 42)))) {
      problems.push(`${key}: fdc_id ${v.fdc}\n      expected "${v.expect}"\n      actual   "${f.desc}"`);
    }
  });
  if (problems.length) throw new Error("USDA map verification FAILED:\n  " + problems.join("\n  "));
  return Object.keys(MAP).length;
}

module.exports = { MAP, NEGLIGIBLE, FLAGGED, verifyMap };
