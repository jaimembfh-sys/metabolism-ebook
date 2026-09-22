// Builds a compact per-100g nutrient index from the USDA SR Legacy CSVs.
// Every number in the rebuilt macros traces to an fdc_id in here.
//
// You do not normally need to run this. Its output, usda-index.json, is
// committed beside this file, and report.js reads that. Run it only to change
// what gets extracted - to pull a nutrient WANT does not currently carry, say.
//
// THE CSVs ARE NOT IN THE REPO. They are ~38 MB unpacked against a 1.3 MB
// derived index, so only the index is kept. To get them:
//
//   https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip
//
//   5.8 MB zip, last revised by USDA 2023-10-25. Listed as "SR Legacy" on
//   https://fdc.nal.usda.gov/download-datasets if that direct link moves.
//
// Unpack so the CSVs sit at the DIR below - tools/macros/sr/ is gitignored:
//
//   tools/macros/sr/FoodData_Central_sr_legacy_food_csv_2018-04/*.csv
//
// This script reads two of them, food.csv and food_nutrient.csv. A third is
// worth knowing about: food_portion.csv carries USDA's standard weights - the
// 164 g large bell pepper, the 72 g large carrot, the 50 g large egg. Those
// are the numbers behind the gram tables in usda-map-*.js, and reading them
// out of there rather than from memory is how the placeholder weights in
// 5eeb2a7 were caught.
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "sr", "FoodData_Central_sr_legacy_food_csv_2018-04");

// Minimal CSV reader: FDC quotes fields containing commas.
function readCsv(file, onRow) {
  const text = fs.readFileSync(path.join(DIR, file), "utf8");
  const lines = text.split(/\r?\n/);
  const head = splitLine(lines[0]);
  for (let i = 1; i < lines.length; i++) {
    if (!lines[i]) continue;
    const cells = splitLine(lines[i]);
    const row = {};
    head.forEach((h, j) => (row[h] = cells[j]));
    onRow(row);
  }
}

function splitLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === ",") { out.push(cur); cur = ""; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// Nutrient ids we need (SR Legacy nutrient table).
const WANT = {
  1008: "kcal",        // Energy (kcal)
  1004: "fat",         // Total lipid (fat)
  1003: "protein",     // Protein
  1005: "carb",        // Carbohydrate, by difference
  1079: "fiber",       // Fiber, total dietary
  1258: "satfat",      // Fatty acids, total saturated
};

console.error("reading food.csv…");
const foods = {};
readCsv("food.csv", (r) => {
  if (r.data_type !== "sr_legacy_food") return;
  foods[r.fdc_id] = { fdc_id: +r.fdc_id, desc: r.description, cat: r.food_category_id };
});
console.error("  sr_legacy foods:", Object.keys(foods).length);

console.error("reading food_nutrient.csv (35MB)…");
let n = 0;
readCsv("food_nutrient.csv", (r) => {
  const key = WANT[r.nutrient_id];
  if (!key) return;
  const f = foods[r.fdc_id];
  if (!f) return;
  const v = parseFloat(r.amount);
  if (!isFinite(v)) return;
  f[key] = v;
  n++;
});
console.error("  nutrient rows kept:", n);

// Keep only foods with the macros we need.
const index = Object.values(foods).filter(
  (f) => f.kcal != null && f.fat != null && f.protein != null && f.carb != null
);
console.error("  usable foods:", index.length);

fs.writeFileSync(
  __dirname + "/usda-index.json",
  JSON.stringify({ source: "USDA FoodData Central, SR Legacy (2018-04)", count: index.length, foods: index })
);
console.log("wrote usda-index.json with", index.length, "foods");
