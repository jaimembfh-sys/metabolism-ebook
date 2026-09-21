/* Additional verified mappings, plus the two Branded Foods entries.
 *
 * SR Legacy ids here were found with find-usda.js and read to confirm, same as
 * usda-map.js. The BRANDED entries carry their nutrient values inline because
 * they are not in the SR Legacy index - FDC's Branded database is separate and
 * far too large to download for two ingredients.
 *
 * Both branded values were checked against several brands before being used:
 *   coconut flour   5 brands, fat 11.5-20 g/100g, carb 53-62, fiber 33-47
 *   coconut aminos  5 brands, fat 0 across all, carb 26.7-100 (see note)
 *
 * The coconut aminos carb spread is too wide to treat as one food, so it is
 * NOT used as a default anywhere - see AMBIGUOUS below.
 */

// SR Legacy, verified against the local index.
const EXTRA_MAP = {
  "chicken broth":        { fdc: 174536, expect: "Soup, chicken broth, ready-to-serve", grams: { cup: 240, tbsp: 15 } },
  "oyster sauce":         { fdc: 174529, expect: "Sauce, oyster, ready-to-serve", grams: { tbsp: 18, tsp: 6 } },
  "fish sauce":           { fdc: 174531, expect: "Sauce, fish, ready-to-serve", grams: { tbsp: 18, tsp: 6 } },
  "yellow onion":         { fdc: 170000, expect: "Onions, raw", grams: { each: 110, small: 70, medium: 110, large: 150, cup: 160 } },
  "bell pepper":          { fdc: 170108, expect: "Peppers, sweet, red, raw", grams: { each: 119, medium: 119, cup: 149 } },
  "thai chilies":         { fdc: 170106, expect: "Peppers, hot chili, red, raw", grams: { each: 2 } },
  "holy basil":           { fdc: 172232, expect: "Basil, fresh", grams: { cup: 24, tbsp: 1.5 } },
  "basil":                { fdc: 172232, expect: "Basil, fresh", grams: { cup: 24, tbsp: 1.5 } },
  // "boneless, skinless chicken" with no cut named. Mapped to BREAST on
  // Jaime's explicit instruction not to substitute a fattier cut, and flagged
  // as an assumption in every breakdown that uses it.
  "boneless": { fdc: 171077, expect: "Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw", grams: { lb: 453.6, oz: 28.35, cup: 140, each: 174 } },
  "boneless skinless chicken": { fdc: 171077, expect: "Chicken, broiler or fryers, breast, skinless, boneless, meat only, raw", grams: { lb: 453.6, oz: 28.35, cup: 140 } },
};

// FDC Branded Foods. Values are per 100 g, taken from the named product.
const BRANDED = {
  "coconut flour": {
    fdc: 2339682, source: "FDC Branded Foods",
    expect: "COCONUT FLOUR — Whole Foods Market",
    per100g: { kcal: 400, fat: 13.3, protein: 13.3, carb: 60, fiber: 33.3 },
    grams: { tbsp: 7, cup: 112 },
    note: "Branded Foods, not SR Legacy. 5 brands checked: fat 11.5–20 g/100g.",
  },
};

/* Ingredients where the recipe itself offers a choice, or names a food loosely
 * enough that two real answers exist. Flagged rather than resolved: picking one
 * silently would put a number in front of a reader that the recipe does not
 * actually support.
 */
const AMBIGUOUS = {
  "tamari or coconut aminos":
    "recipe offers a choice. Tamari (SR Legacy 174278) is 5.6 g carb/100g; coconut aminos run 26.7–100 g carb/100g across 5 brands. Calculated with tamari; coconut aminos would raise net carbs.",
  "beef tallow or avocado oil":
    "recipe offers a choice. Both are ~100% fat and within 1 kcal/g of each other, so the macro effect is negligible. Calculated with beef tallow.",
  "pecans or walnuts":
    "recipe offers a choice. Pecans 72 g fat/100g, walnuts 65 g. Calculated with pecans.",
  "cauliflower rice":
    "recipe lists it 'for serving' with no amount, and the recipe's own nutrition line excludes it.",
  "fried eggs":
    "optional, no amount given; excluded by the recipe's own nutrition line.",
};

module.exports = { EXTRA_MAP, BRANDED, AMBIGUOUS };
