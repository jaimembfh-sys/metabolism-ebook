/* One rule for every meat in every recipe.
 *
 * Jaime's rule, 2026-09-21: for each meat, find every matching RAW USDA entry
 * across SR Legacy and Foundation Foods, take the range, and use a value just
 * above the average - around the 60th percentile. The reasoning is that
 * overestimating slightly is safer than underestimating, because
 * underestimating makes people undereat.
 *
 * Where the recipe names a specific cut or lean percentage, the population is
 * restricted to that cut. Where the recipe does not specify, the meat is
 * FLAGGED with its range rather than averaged blindly.
 *
 * The picked entry is a REAL USDA food at the 60th percentile by fat, not a
 * synthesised number. That keeps a traceable FDC id and a coherent
 * fat/protein/carb profile rather than a fat figure invented on its own.
 *
 * Foundation Foods entries are listed inline with their fdc_id because the
 * Foundation dataset is not downloadable as a bundle; they were retrieved from
 * the FDC API and are marked source:"Foundation".
 *
 * Foundation values run notably HIGHER than SR Legacy for several cuts -
 * chicken thigh 7.92 vs 4.12, flank 9.4 vs 6.67, ribeye 20.0 vs a 5.8-18.4
 * SR range. Including both is what makes the 60th percentile meaningful.
 */

// Retrieved from the FDC API, dataType=Foundation, 2026-09-21.
const FOUNDATION = [
  { fdc_id: 2646170, desc: "Chicken, breast, boneless, skinless, raw", fat: 1.93, protein: 22.5, carb: 0, kcal: 114 },
  { fdc_id: 2646171, desc: "Chicken, thigh, boneless, skinless, raw", fat: 7.92, protein: 18.6, carb: 0, kcal: 149 },
  { fdc_id: 2646169, desc: "Pork, loin, tenderloin, boneless, raw", fat: 3.9, protein: 21.6, carb: 0, kcal: 126 },
  { fdc_id: 2646175, desc: "Beef, flank, steak, boneless, choice, raw", fat: 9.4, protein: 20.1, carb: 0, kcal: 167 },
  { fdc_id: 2646172, desc: "Beef, ribeye, steak, boneless, choice, raw", fat: 20.0, protein: 18.7, carb: 0, kcal: 253 },
  { fdc_id: 2514744, desc: "Beef, ground, 80% lean meat / 20% fat, raw", fat: 19.4, protein: 17.5, carb: 0, kcal: 247 },
  { fdc_id: 2514743, desc: "Beef, ground, 90% lean meat / 10% fat, raw", fat: 12.8, protein: 18.2, carb: 0, kcal: 190 },
];

// Which Foundation rows belong to which meat.
const FOUNDATION_FOR = {
  "chicken breast": [2646170],
  "chicken thigh": [2646171],
  "pork tenderloin": [2646169],
  "flank steak": [2646175],
  "ribeye steak": [2646172],
  "ground beef": [2514744, 2514743],
};

const RAW_EXCLUDE = ["cooked", "roasted", "braised", "broiled", "grilled", "fried", "baked",
  "stewed", "simmered", "canned", "smoked", "cured", "dried", "breaded", "battered"];

const MEATS = {
  "chicken breast": {
    ingredientKeys: ["boneless skinless chicken breasts", "chicken breasts", "boneless", "boneless skinless chicken", "chicken breast"],
    require: ["chicken", "breast", "raw"],
    exclude: [...RAW_EXCLUDE, "skin", "bone", "ground", "lunchmeat", "patty", "nugget", "stewing", "capon", "roasting"],
    keepWord: ["skinless", "boneless"],
    note: "recipes say 'boneless, skinless chicken breast'; Jaime confirmed breast throughout",
  },
  "chicken thigh": {
    ingredientKeys: ["boneless skinless chicken thighs", "chicken thighs"],
    require: ["chicken", "thigh", "raw"],
    exclude: [...RAW_EXCLUDE, "skin", "bone", "ground", "patty"],
    keepWord: ["skinless", "boneless"],
    note: "one recipe names thighs explicitly",
  },
  "ground beef": {
    ingredientKeys: ["ground beef"],
    require: ["beef", "ground", "raw"],
    exclude: [...RAW_EXCLUDE, "patty", "crumbles"],
    flagUnspecified: true,
    note: "5 recipes say only 'ground beef' with no lean percentage",
  },
  "flank steak": {
    ingredientKeys: ["flank steak"],
    require: ["beef", "flank", "raw"],
    exclude: [...RAW_EXCLUDE],
    note: "recipe names the cut exactly",
  },
  "ribeye steak": {
    ingredientKeys: ["boneless ribeye steaks", "ribeye steaks"],
    require: ["beef", "rib eye", "raw"],
    exclude: [...RAW_EXCLUDE],
    note: "recipe names the cut exactly",
  },
  "pork tenderloin": {
    ingredientKeys: ["pork tenderloin"],
    require: ["pork", "tenderloin", "raw"],
    exclude: [...RAW_EXCLUDE],
    note: "recipe names the cut exactly",
  },
  "salmon": {
    ingredientKeys: ["salmon fillet", "salmon"],
    // "fish" is required because "salmon" alone also matches Salmonberries,
    // a fruit, which sat at 0.33 g fat and pulled the mean down.
    require: ["fish", "salmon", "raw"],
    exclude: [...RAW_EXCLUDE, "roe", "cake", "salmonberr"],
    note: "recipe says 'salmon fillet', species unspecified",
    flagUnspecified: true,
  },
  "shrimp": {
    ingredientKeys: ["large raw shrimp", "shrimp"],
    require: ["shrimp", "raw"],
    exclude: [...RAW_EXCLUDE, "imitation", "breaded"],
    note: "recipe says 'large raw shrimp'",
  },
};

function hasWord(h, w) {
  return new RegExp("(^|[^a-z])" + w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "([^a-z]|$)", "i").test(h);
}

function matches(desc, spec) {
  const d = desc.toLowerCase();
  if (!spec.require.every((t) => d.includes(t))) return false;
  for (const x of spec.exclude) {
    if (!hasWord(d, x)) continue;
    // "skinless" must not be excluded by "skin", "boneless" by "bone".
    if ((spec.keepWord || []).some((k) => d.includes(k) && k.startsWith(x))) continue;
    return false;
  }
  // Country-specific imports are real entries but not what a US shopper buys.
  if (/\b(new zealand|australian|imported)\b/i.test(d)) return false;
  return true;
}

function analyse(byIdList) {
  const out = {};
  Object.entries(MEATS).forEach(([name, spec]) => {
    const sr = byIdList.filter((f) => matches(f.desc, spec)).map((f) => ({ ...f, source: "SR Legacy" }));
    const fdIds = FOUNDATION_FOR[name] || [];
    const fd = FOUNDATION.filter((f) => fdIds.includes(f.fdc_id)).map((f) => ({ ...f, source: "Foundation" }));
    const all = sr.concat(fd).sort((a, b) => a.fat - b.fat);
    if (!all.length) { out[name] = { spec, entries: [], err: "no match in either dataset" }; return; }
    const fats = all.map((x) => x.fat);
    const mean = fats.reduce((a, b) => a + b, 0) / fats.length;
    const idx = Math.min(all.length - 1, Math.max(0, Math.round(0.6 * (all.length - 1))));
    out[name] = {
      spec, entries: all,
      min: fats[0], max: fats[fats.length - 1],
      mean: +mean.toFixed(2),
      median: all[Math.round(0.5 * (all.length - 1))].fat,
      picked: all[idx],
      flagged: !!spec.flagUnspecified,
    };
  });
  return out;
}

module.exports = { MEATS, FOUNDATION, FOUNDATION_FOR, analyse, matches };
