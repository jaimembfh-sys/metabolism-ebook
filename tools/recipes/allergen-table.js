#!/usr/bin/env node
/**
 * Prints the allergen tag for every recipe, one line each, and marks the ones
 * that want a human eye.
 *
 * Nothing binds to these tags until Jaime confirms them - see
 * ALLERGEN_TAGS_CONFIRMED in index.html. This script exists to produce the
 * list he checks.
 *
 * Usage: node tools/recipes/allergen-table.js [--detail]
 */
const fs = require("fs");
const path = require("path");
const { tagRecipe } = require(path.resolve(__dirname, "..", "allergens.js"));

const ROOT = path.resolve(__dirname, "..", "..");
const R = JSON.parse(fs.readFileSync(path.join(ROOT, "knowledge-base", "recipes.json"), "utf8")).recipes;
const detail = process.argv.includes("--detail");

const rows = R.map((r) => ({ r, ...tagRecipe(r.full_text) }));

const w = Math.min(46, Math.max(...rows.map((x) => x.r.title.length)));
console.log("recipe".padEnd(w) + "  allergens tagged");
console.log("-".repeat(w + 2 + 34));
for (const x of rows) {
  const flag = x.misses.length ? "  <-- CHECK (possible miss)"
    : x.uncertain.length ? "  <-- CHECK" : "";
  console.log(x.r.title.slice(0, w).padEnd(w) + "  " + (x.allergens.join(", ") || "(none)") + flag);
}

const flagged = rows.filter((x) => x.uncertain.length || x.misses.length);
console.log("\n" + rows.length + " recipes  ·  " +
  rows.filter((x) => x.allergens.length).length + " carry at least one allergen  ·  " +
  flagged.length + " need checking");

if (flagged.length) {
  console.log("\n\nTHE ONES TO CHECK\n");
  for (const x of flagged) {
    console.log("  " + x.r.title);
    for (const u of x.uncertain) {
      console.log("      TAGGED " + u.allergen + ' on "' + u.term + '" — may be wrong');
      console.log("          in: " + u.line);
      console.log("          " + u.why);
    }
    for (const m of x.misses) {
      console.log("      NOT tagged " + m.allergen + ' but contains "' + m.term + '"');
      console.log("          in: " + m.line);
      console.log("          " + m.why);
    }
    console.log("");
  }
}

if (detail) {
  console.log("\n\nEVERY MATCH, for reference:\n");
  for (const x of rows) {
    if (!x.hits.length) continue;
    console.log("  " + x.r.title);
    x.hits.forEach((h) => h.matched.forEach((m) =>
      console.log("      " + h.allergen.padEnd(10) + '"' + m.term + '"  in: ' + m.line)));
    console.log("");
  }
}
