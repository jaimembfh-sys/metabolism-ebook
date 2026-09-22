#!/usr/bin/env node
/**
 * Compile the shared recipe markdown files (knowledge-base/recipes/markdown)
 * into one static JSON file the Metabolic Meal Planner fetches at runtime
 * (index.html -> fetchRecipeCorpus()). Separate from build-corpus.js /
 * protocol-corpus.json (course + functional-medicine content) since these
 * are a different kind of source (individual recipes, not chunked lesson
 * text) and small enough to ship as full text, no chunking needed.
 *
 * Re-run this after adding/editing/removing a recipe markdown file.
 *
 * Usage: node build-recipes-corpus.js
 */

const fs = require("fs");
const path = require("path");
const { tagRecipe } = require(path.join(__dirname, "..", "tools", "allergens.js"));

const ROOT = path.resolve(__dirname, "..");
const RECIPES_DIR = path.join(__dirname, "recipes", "markdown");
const OUT_PATH = path.join(__dirname, "recipes.json");

/* Per-recipe fields the coach needs that the markdown does not state directly.
 *
 *   page       where the built recipe page lives, so anything the coach names
 *              can be linked rather than just mentioned
 *   allergens  computed from the ingredient lines by tools/allergens.js, using
 *              the same vocabulary as the Protocol Builder's live gate
 *   summary    the nutrition panel as numbers, so a compact index can be sent
 *              to the model instead of 77 KB of full text
 *
 * The allergen tags are DATA here, not yet a rule: index.html gates every use
 * of them behind ALLERGEN_TAGS_CONFIRMED, which stays false until Jaime has
 * read tools/recipes/allergen-table.js and said the tags are right.
 */
function recipePage(slug) {
  return "/recipes-html/" + slug + ".html";
}

/** First nutrition panel, as numbers. Two-panel recipes (with/without an
 *  optional component) report the first, which is the base dish. */
function nutritionSummary(body) {
  const sec = body.split(/^## Nutrition\s*$/m)[1];
  if (!sec) return null;
  const block = sec.split(/^## /m)[0];
  const num = (label) => {
    const m = block.match(new RegExp("^- " + label + ":\\s*([\\d.]+)", "m"));
    return m ? Number(m[1]) : null;
  };
  const heading = (block.match(/^### (.+)$/m) || [])[1] || null;
  const out = {
    per: heading ? heading.replace(/\s*—.*$/, "").trim() : null,
    calories: num("Calories"),
    fat_g: num("Total Fat"),
    carbs_g: num("Total Carbs"),
    fiber_g: num("Fiber"),
    net_carbs_g: num("Net Carbs"),
    protein_g: num("Protein"),
  };
  return out.calories == null ? null : out;
}

/** The handful of words that say what a dish actually is, for the compact
 *  index. Quantities and preparation notes are dropped - "1 1/2 lbs boneless,
 *  skinless chicken thighs, chopped" becomes "chicken thighs". */
function keyIngredients(body, limit) {
  const m = body.match(/## Ingredients\n([\s\S]*?)(\n## |$)/);
  if (!m) return [];
  const seen = new Set();
  const out = [];
  for (const line of m[1].split("\n")) {
    const t = line.trim();
    if (t.indexOf("- ") !== 0) continue;
    let s = t.slice(2)
      .replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\([^)]*\)/g, "")
      // The unit needs a word boundary after it, or the "g" in the unit list
      // eats the "g" of "garlic" and the ingredient comes out as "arlic".
      .replace(/^[\d\s/.]+(?:to\s+[\d\s/.]+)?\s*(?:(?:tsp|Tbsp|cups?|oz|lbs?|g|cans?|cloves?|slices?|heads?|ribs?|stalks?|sticks?|large|small|medium|regular)\b\s*)?/i, "")
      .trim()
      .toLowerCase();
    /* Strip leading modifiers before taking the first clause, or
     * "boneless, skinless chicken thighs" reduces to "boneless" - the same
     * catch-all that once made the macro tool cost a thigh at breast's fat. */
    let prev;
    do {
      prev = s;
      s = s.replace(/^(boneless|skinless|fresh|raw|cooked|chopped|diced|minced|shredded|grated|sliced|halved|frozen|canned|jarred|dried|whole|natural|all natural|no sugar added|unsweetened|low sugar|extra-virgin|extra virgin|freshly|finely|roughly|thinly|ripe|smooth|creamy)\b[,\s]*/, "");
    } while (s !== prev && s);
    s = s.split(",")[0].trim();
    if (!s || s.length < 3 || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
    if (out.length >= (limit || 6)) break;
  }
  return out;
}

function parseFrontmatterValue(raw) {
  if (raw === "null") return null;
  if (/^\d+$/.test(raw)) return parseInt(raw, 10);
  return raw;
}

function parseRecipeFile(filePath) {
  const raw = fs.readFileSync(filePath, "utf-8");
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    console.warn(`Skipped (no frontmatter): ${path.relative(ROOT, filePath)}`);
    return null;
  }
  const [, frontmatterRaw, body] = match;
  const meta = {};
  frontmatterRaw.split(/\r?\n/).forEach((line) => {
    const idx = line.indexOf(":");
    if (idx === -1) return;
    const key = line.slice(0, idx).trim();
    const value = line.slice(idx + 1).trim();
    meta[key] = parseFrontmatterValue(value);
  });
  const slug = path.basename(filePath, ".md");
  const full = body.trim();
  const tagged = tagRecipe(full);
  return {
    slug: slug,
    title: meta.title || slug,
    description: meta.description || "",
    category: meta.category || "uncategorized",
    servings: meta.servings != null ? meta.servings : null,
    source_file: meta.source_file || null,
    page: recipePage(slug),
    allergens: tagged.allergens,
    /* Jaime's recommendation to EVERYONE, not an allergy accommodation:
     * coconut aminos over tamari, because processed soy has downsides, often
     * carries gluten and is hard on digestion. Surfaced to every reader and
     * plays no part in filtering — a soy-allergic reader still has these
     * recipes excluded, like any other soy recipe. */
    recommended_swap: tagged.recommended_swap,
    /* An allergen the recipe itself offers a way around in the ingredient
     * line — "ghee or coconut oil". Keeps the tag, keeps the recipe. */
    allergen_alternatives: tagged.allergen_alternatives,
    /* "Check the label" — most Worcestershire has soy, not all. */
    brand_dependent: tagged.brand_dependent.length ? tagged.brand_dependent : null,
    /* Usually contains anchovy. The intake form has no fish category, so this
     * cannot be filtered on; it is carried so the coach can mention it. */
    anchovy: tagged.anchovy.length ? tagged.anchovy : null,
    // True where the tagger itself is unsure - a doubtful hit or a term it
    // knows it does not cover. Surfaced so the coach can decline to promise
    // a recipe is safe on a tag nobody has checked.
    allergens_uncertain: (tagged.uncertain.length + tagged.misses.length) > 0,
    nutrition: nutritionSummary(full),
    key_ingredients: keyIngredients(full, 6),
    full_text: full,
  };
}

function main() {
  if (!fs.existsSync(RECIPES_DIR)) {
    console.error(`Missing recipes directory: ${path.relative(ROOT, RECIPES_DIR)}`);
    process.exit(1);
  }
  const files = fs.readdirSync(RECIPES_DIR).filter((f) => f.endsWith(".md"));
  const recipes = files
    .map((f) => parseRecipeFile(path.join(RECIPES_DIR, f)))
    .filter(Boolean)
    .sort((a, b) => a.title.localeCompare(b.title));

  const corpus = {
    generated_at: new Date().toISOString(),
    recipe_count: recipes.length,
    recipes,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(corpus), "utf-8");
  console.log(`${recipes.length} recipes -> ${path.relative(ROOT, OUT_PATH)}`);
}

main();
