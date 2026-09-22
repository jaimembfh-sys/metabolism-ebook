#!/usr/bin/env node
/**
 * Builds recipes-html/ — one page per recipe, plus an index — from
 * knowledge-base/recipes.json.
 *
 * Reads only. Writes nothing outside recipes-html/. Does not deploy.
 *
 * The format is manuscript/RECIPE_FORMAT_SPEC.md. The look is taken from the
 * existing PDFs in recipes/ rather than invented: their content streams were
 * decoded and the type and colour read straight off them, so a reader handed
 * one of these cannot tell which they are holding.
 *
 *   page          US Letter, 1 inch margins   (PDF: 612x792 pt, 70.8 pt left)
 *   title         Times Bold 22pt, uppercase, #1E4A5A
 *   description   Helvetica Oblique 11pt, #231F20
 *   section       Helvetica Bold 13pt, uppercase, #1E4A5A
 *   step          Helvetica Bold 11.5pt, #1E4A5A
 *   body          Helvetica 10.5pt, #231F20
 *   linked item   Helvetica 10.5pt, #1E4A5A
 *   footer        Helvetica 8.5pt, #1E4A5A
 *   logo          top right, 499x224 lifted out of the PDFs themselves
 *
 * Ingredients are NOT a section of their own. The PDFs list each step's
 * ingredients under that step, and the spec calls for the same, so a reader
 * working through the recipe sees only what the step in front of them needs.
 * Every ingredient group in all 43 recipes has a matching step; some steps
 * ("Bake", "Serve") have no ingredients, and simply render without any.
 *
 * Hero photo: a 2.5:1 box, 4 inches wide, per the spec. It holds its shape
 * whether or not the photograph exists yet, so nothing reflows when they land.
 * Drop a file at images/recipes/<slug>.(jpg|jpeg|png|webp) and it is picked up.
 *
 * Usage: node tools/recipes/build-pages.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..", "..");
const OUT = path.join(ROOT, "recipes-html");
const SITE = "https://www.mindbodyfunctionalhealth.com";

const R = JSON.parse(fs.readFileSync(path.join(ROOT, "knowledge-base", "recipes.json"), "utf8")).recipes;

// ---- markdown fragments -> html --------------------------------------------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* A linked product is marked in the source with an HTML comment that follows
 * the product name. The PDFs set that name in teal and leave the amount and
 * any trailing aside black - "1 to 2 Tbsp | Mae Ploy panang curry paste |
 * (start with 1 Tbsp...)" - so the split is at the end of the leading amount.
 */
const AMOUNT = /^((?:about\s+)?[\d¼-¾/.\s]*(?:to\s+[\d¼-¾/.\s]+)?(?:tsp|Tbsp|tbsp|teaspoons?|tablespoons?|cups?|oz|ounces?|lbs?|pounds?|g|ml|cans?|sticks?|cloves?|slices?|heads?|ribs?|stalks?)?\s*)/i;

function inline(text) {
  const parts = [];
  let rest = text;
  const re = /\s*<!--\s*linked_product:[^>]*-->/;
  let m;
  while ((m = rest.match(re))) {
    const before = rest.slice(0, m.index);
    const am = before.match(AMOUNT);
    const lead = am ? am[1] : "";
    const name = before.slice(lead.length);
    parts.push(esc(lead));
    if (name.trim()) parts.push('<span class="linked">' + esc(name.trim()) + "</span>");
    rest = rest.slice(m.index + m[0].length);
  }
  parts.push(esc(rest));
  return parts.join("")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
}

// ---- split the markdown body -----------------------------------------------
function sections(text) {
  const out = {};
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  let cur = null;
  for (const l of lines) {
    const h = l.match(/^## (.+?)\s*$/);
    if (h) { cur = h[1].trim(); out[cur] = []; continue; }
    if (cur) out[cur].push(l);
  }
  for (const k of Object.keys(out)) out[k] = out[k].join("\n");
  return out;
}

/* "### Heading" then the lines under it, in order. */
function groups(block) {
  const out = [];
  if (!block) return out;
  let cur = null;
  for (const l of block.split("\n")) {
    const h = l.match(/^### (.+?)\s*$/);
    if (h) { cur = { title: h[1].trim(), lines: [] }; out.push(cur); continue; }
    if (cur) cur.lines.push(l);
  }
  return out;
}

const bullets = (lines) => lines.filter((l) => /^-\s+/.test(l)).map((l) => l.replace(/^-\s+/, "").trim());
const paras = (lines) => lines.join("\n").split(/\n\s*\n/).map((s) => s.trim()).filter((s) => s && !/^-\s+/.test(s));

// ---- assets ----------------------------------------------------------------
const QR = fs.readFileSync(path.join(__dirname, "qr.svg"), "utf8")
  .replace(/<\?xml[^>]*\?>/, "")
  .replace(/fill="white"/g, 'fill="#FFFFFF"')
  .replace(/fill="black"/g, 'fill="#1E4A5A"')
  .replace("<svg ", '<svg class="qr" role="img" aria-label="QR code linking to mindbodyfunctionalhealth.com" ');

function heroFor(slug) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const rel = path.join("images", "recipes", slug + "." + ext);
    if (fs.existsSync(path.join(ROOT, rel))) return "../" + rel.replace(/\\/g, "/");
  }
  return null;
}

// ---- one page --------------------------------------------------------------
function page(r) {
  const S = sections(r.full_text);
  const ingGroups = groups(S["Ingredients"]);
  const stepGroups = groups(S["Instructions"]);
  const ingBy = {};
  ingGroups.forEach((g) => (ingBy[g.title.toLowerCase()] = bullets(g.lines)));

  const L = [];
  L.push("<!DOCTYPE html>");
  L.push('<html lang="en">');
  L.push("<head>");
  L.push('<meta charset="utf-8">');
  L.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  L.push("<title>" + esc(r.title) + " — Mind-Body Functional Health</title>");
  if (r.description) L.push('<meta name="description" content="' + esc(r.description) + '">');
  L.push('<link rel="stylesheet" href="recipe.css">');
  L.push("</head>");
  L.push('<body class="recipe">');
  L.push('<article class="sheet">');

  L.push('<header class="head">');
  L.push('<img class="logo" src="logo.png" alt="Mind-Body Functional Health" width="499" height="224">');
  L.push("<h1>" + esc(r.title) + "</h1>");
  if (r.description) L.push('<p class="lede">' + inline(r.description) + "</p>");
  L.push("</header>");

  const hero = heroFor(r.slug);
  L.push('<div class="hero' + (hero ? "" : " hero-empty") + '">' +
    (hero ? '<img src="' + hero + '" alt="' + esc(r.title) + '">' : "") + "</div>");

  // ---- instructions, each step carrying its own ingredients ----
  L.push('<section class="block">');
  L.push("<h2>Instructions</h2>");
  stepGroups.forEach((g, i) => {
    const key = g.title.replace(/^\d+\.\s*/, "").trim().toLowerCase();
    const items = ingBy[key] || [];
    L.push('<section class="step">');
    L.push("<h3>" + esc(/^\d+\./.test(g.title) ? g.title : i + 1 + ". " + g.title) + "</h3>");
    if (items.length) {
      L.push('<ul class="ing">');
      items.forEach((it) => L.push("<li>" + inline(it) + "</li>"));
      L.push("</ul>");
    }
    paras(g.lines).forEach((p) => L.push("<p>" + inline(p) + "</p>"));
    L.push("</section>");
  });
  L.push("</section>");

  // ---- nutrition ----
  const nut = groups(S["Nutrition"]);
  if (nut.length) {
    L.push('<section class="block nutrition">');
    L.push("<h2>Nutrition</h2>");
    nut.forEach((g) => {
      L.push('<div class="panel">');
      L.push('<p class="panel-for">' + inline(g.title) + "</p>");
      L.push("<ul>");
      bullets(g.lines).forEach((b) => {
        const m = b.match(/^([^:]+):\s*(.+)$/);
        L.push(m ? "<li><span>" + esc(m[1]) + "</span><b>" + esc(m[2]) + "</b></li>" : "<li>" + inline(b) + "</li>");
      });
      L.push("</ul>");
      paras(g.lines).forEach((p) => L.push('<p class="panel-note">' + inline(p) + "</p>"));
      L.push("</div>");
    });
    L.push("</section>");
  }

  // ---- notes ----
  const notes = groups(S["Notes"]);
  if (notes.length) {
    notes.forEach((g) => {
      L.push('<section class="block note">');
      L.push("<h2>" + esc(g.title) + "</h2>");
      const items = bullets(g.lines);
      paras(g.lines).forEach((p) => L.push("<p>" + inline(p) + "</p>"));
      if (items.length) {
        L.push("<ul>");
        items.forEach((it) => L.push("<li>" + inline(it) + "</li>"));
        L.push("</ul>");
      }
      L.push("</section>");
    });
  }

  L.push('<footer class="foot">');
  L.push('<div class="foot-text"><p>Recipe created by Mind-Body Functional Health.</p>');
  L.push('<p>Visit our website at <a href="' + SITE + '">www.mindbodyfunctionalhealth.com</a> or scan the QR code.</p></div>');
  L.push(QR);
  L.push("</footer>");

  L.push("</article>");
  L.push("</body>");
  L.push("</html>");
  return L.join("\n") + "\n";
}

// ---- index -----------------------------------------------------------------
function index(list) {
  const byCat = {};
  list.forEach((r) => (byCat[r.category || "uncategorized"] = byCat[r.category || "uncategorized"] || []).push(r));
  const nice = (c) => c.replace(/_/g, " & ").replace(/\b\w/g, (m) => m.toUpperCase());
  const L = [];
  L.push("<!DOCTYPE html>");
  L.push('<html lang="en">');
  L.push("<head>");
  L.push('<meta charset="utf-8">');
  L.push('<meta name="viewport" content="width=device-width, initial-scale=1">');
  L.push("<title>Recipes — Mind-Body Functional Health</title>");
  L.push('<link rel="stylesheet" href="recipe.css">');
  L.push("</head>");
  L.push('<body class="index">');
  L.push('<article class="sheet">');
  L.push('<header class="head">');
  L.push('<img class="logo" src="logo.png" alt="Mind-Body Functional Health" width="499" height="224">');
  L.push("<h1>Recipes</h1>");
  L.push('<p class="lede">' + list.length + " recipes. Every nutrition panel is built from USDA FoodData Central, ingredient by ingredient.</p>");
  L.push("</header>");
  Object.keys(byCat).sort().forEach((c) => {
    L.push('<section class="block">');
    L.push("<h2>" + esc(nice(c)) + "</h2>");
    L.push('<ul class="toc">');
    byCat[c].sort((a, b) => a.title.localeCompare(b.title)).forEach((r) => {
      L.push('<li><a href="' + r.slug + '.html">' + esc(r.title) + "</a>" +
        (r.description ? '<span class="toc-d">' + esc(r.description) + "</span>" : "") + "</li>");
    });
    L.push("</ul>");
    L.push("</section>");
  });
  L.push("</article>");
  L.push("</body>");
  L.push("</html>");
  return L.join("\n") + "\n";
}

// ---- write -----------------------------------------------------------------
fs.mkdirSync(OUT, { recursive: true });
fs.copyFileSync(path.join(__dirname, "logo.png"), path.join(OUT, "logo.png"));
fs.writeFileSync(path.join(OUT, "recipe.css"), fs.readFileSync(path.join(__dirname, "recipe.css"), "utf8"), "utf8");
let withHero = 0;
R.forEach((r) => {
  if (heroFor(r.slug)) withHero++;
  fs.writeFileSync(path.join(OUT, r.slug + ".html"), page(r), "utf8");
});
fs.writeFileSync(path.join(OUT, "index.html"), index(R), "utf8");
console.log("wrote recipes-html/ — " + R.length + " recipes + index");
console.log("  hero photographs found: " + withHero + " of " + R.length +
  (withHero < R.length ? "  (the rest hold an empty 2.5:1 box)" : ""));
