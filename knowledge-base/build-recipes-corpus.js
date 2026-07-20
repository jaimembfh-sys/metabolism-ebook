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

const ROOT = path.resolve(__dirname, "..");
const RECIPES_DIR = path.join(__dirname, "recipes", "markdown");
const OUT_PATH = path.join(__dirname, "recipes.json");

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
  return Object.assign(
    {
      slug: path.basename(filePath, ".md"),
      title: meta.title || path.basename(filePath, ".md"),
      description: meta.description || "",
      category: meta.category || "uncategorized",
      servings: meta.servings != null ? meta.servings : null,
      source_file: meta.source_file || null,
      full_text: body.trim(),
    },
    {}
  );
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
