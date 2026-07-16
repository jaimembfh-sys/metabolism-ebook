#!/usr/bin/env node
/**
 * Extract the 18 course lessons embedded in index.html into the same
 * chunk-ready markdown convention used by
 * `Functional medicine content/processed/chunk_markdown.js`
 * (frontmatter + "<!-- chunk -->" / "## heading" / "<!-- page: ... -->").
 *
 * Structure of a lesson in index.html:
 *   <div id="lesson-N">
 *     ...hero image, logo (skipped)...
 *     <section id="chN" class="section-block"> <h3>Lesson N</h3> <h2>Title</h2> ...content... </section>
 *     ...boilerplate "Go to Your AI Coaching Suite" upsell CTA (sibling, skipped automatically
 *        since it lives outside section.section-block)...
 *     <div class="key-insight">...</div>          (real content, own chunk)
 *     <div class="lesson-summary">...3 bullets...</div>   (real content, own chunk)
 *   </div>
 * Lesson 1 additionally has a leading <section id="intro">; lesson 18 additionally
 * has a trailing <section id="conclusion"> — both picked up automatically since we
 * select all `section.section-block` elements inside the lesson div, not just "chN".
 *
 * Within a section, <h4> headings mark sub-topic boundaries (e.g. "The Combustible
 * Myth" callout box, or "The Lever: Carbohydrates and 'Metabolic Safety'" — which
 * may itself contain a nested callout like "Carb Back-Loading for Sleep and
 * Stress"). Content is split at each <h4> into its own chunk; any content before
 * the first <h4> becomes an "Overview" chunk.
 *
 * Usage: node extract-lessons.js
 */

const fs = require("fs");
const path = require("path");
const cheerio = require("cheerio");

const ROOT = path.resolve(__dirname, "..");
const INDEX_HTML = path.join(ROOT, "index.html");
const OUT_DIR = path.join(__dirname, "markdown");
const LESSON_COUNT = 18;

const SECTION_TITLE_OVERRIDES = {
  intro: "Introduction",
};

// Chunks that ground the Protocol Builder's "when to be conservative"
// decisions (high stress / disclosed health conditions -> safe starches,
// avoid aggressive fasting). Keyed by lesson number -> exact <h4> heading
// text. Applied here (not hand-edited into the generated markdown) so it
// survives re-running this script after future lesson-content edits.
const SAFETY_CRITICAL_HEADINGS = {
  8: ["Why Keto Can Fail the Chronically Ill"],
  13: ["Chronic Sleep Deprivation", "Chronic Stress and Cortisol", "A History of Chronic Dieting"],
  15: ["Meal Timing for Metabolic Safety"],
};

// index.html has a pre-existing mojibake artifact where em-dashes were
// mangled into a quote + right-double-quote sequence (57 occurrences
// file-wide). Normalized here so the retrieval corpus doesn't propagate the
// corruption; the underlying site content itself is a separate, unrelated
// display bug worth fixing later.
function normalizeMojibake(text) {
  return text
    .split('"”')
    .join(" — ")
    .replace(/[ \t]+/g, " ");
}

function htmlToText(html) {
  if (!html || !html.trim()) return "";
  const $ = cheerio.load(`<div id="root">${html}</div>`);
  $("p, li, h4, div").each((_, el) => {
    $(el).before("\n\n").after("\n\n");
  });
  let text = $("#root").text();
  text = normalizeMojibake(text)
    .replace(/ /g, " ")
    .replace(/[ \t]+/g, " ")
    .split("\n")
    .map((l) => l.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text;
}

function stripBoilerplate($section) {
  $section.find("img, svg").remove();
  // .key-insight / .lesson-summary are sometimes nested inside the section
  // and sometimes siblings after it (inconsistent in the source) — always
  // strip them here since they're extracted separately via
  // extractKeyInsight / extractLessonSummary and would otherwise get
  // duplicated into whichever <h4> block happens to precede them.
  $section.find(".key-insight, .lesson-summary").remove();
  $section.find('button[onclick*="switchTab"]').each((_, btn) => {
    $section.find(btn).closest("div").remove();
  });
  $section.find("button").remove();
}

// Splits a section's inner HTML at each <h4>...</h4> boundary. Returns
// [{ heading: string|null, html: string }] — the first entry has
// heading === null when there's content before the first <h4>.
function splitByH4(sectionHtml) {
  const parts = sectionHtml.split(/(<h4[\s\S]*?<\/h4>)/i);
  const blocks = [];
  let current = { heading: null, html: "" };
  for (const part of parts) {
    if (/^<h4/i.test(part)) {
      if (current.html.trim() || current.heading) blocks.push(current);
      const heading = cheerio.load(part).text().trim();
      current = { heading, html: "" };
    } else {
      current.html += part;
    }
  }
  if (current.html.trim() || current.heading) blocks.push(current);
  return blocks;
}

function extractKeyInsight($, $lessonDiv) {
  const $ki = $lessonDiv.find(".key-insight").first();
  if ($ki.length === 0) return null;
  const fact = normalizeMojibake($ki.find(".key-insight-fact").first().text().trim());
  return fact || null;
}

function extractLessonSummary($, $lessonDiv) {
  const $summary = $lessonDiv.find(".lesson-summary").first().clone();
  if ($summary.length === 0) return null;
  $summary.find(".lesson-summary-diamond").remove();
  const items = $summary
    .find(".lesson-summary-item")
    .map((_, el) => normalizeMojibake($(el).text().trim()))
    .get()
    .filter(Boolean);
  return items.length ? items.map((t) => `- ${t}`).join("\n") : null;
}

function buildLessonMarkdown(n, $) {
  const $lessonDiv = $(`#lesson-${n}`);
  const sections = $lessonDiv.find("section.section-block").toArray();
  const lines = [];
  let lessonTitle = null;

  for (const sectionEl of sections) {
    const $section = $(sectionEl).clone();
    stripBoilerplate($section);

    const sectionId = $(sectionEl).attr("id") || "";
    const $h2 = $section.find("h2").first();
    const h2Text = $h2.text().trim();
    const title = h2Text || SECTION_TITLE_OVERRIDES[sectionId] || sectionId || `Lesson ${n}`;
    if (sectionId.startsWith("ch") && h2Text) lessonTitle = h2Text;

    $section.find("h3").first().remove();
    $h2.remove();

    lines.push(`# ${title}`, "");

    const blocks = splitByH4($section.html() || "");
    for (const block of blocks) {
      const text = htmlToText(block.html);
      if (!text) continue;
      const heading = block.heading || "Overview";
      lines.push("<!-- chunk -->", `## ${heading}`, `<!-- page: Lesson ${n} -->`);
      if ((SAFETY_CRITICAL_HEADINGS[n] || []).includes(heading)) {
        lines.push("<!-- tags: safety_critical -->");
      }
      lines.push("", text, "");
    }
  }

  const keyInsight = extractKeyInsight($, $lessonDiv);
  if (keyInsight) {
    lines.push(
      "# Key Insight",
      "",
      "<!-- chunk -->",
      "## Key Insight",
      `<!-- page: Lesson ${n} -->`,
      "",
      keyInsight,
      ""
    );
  }

  const summary = extractLessonSummary($, $lessonDiv);
  if (summary) {
    lines.push(
      "# What You Just Learned",
      "",
      "<!-- chunk -->",
      "## What You Just Learned",
      `<!-- page: Lesson ${n} -->`,
      "",
      summary,
      ""
    );
  }

  const frontmatter = [
    "---",
    `title: Lesson ${n}: ${lessonTitle || "Untitled"}`,
    "subtitle: How Your Body Burns (course)",
    "byline: Mind-Body Functional Health",
    `source_file: index.html#lesson-${n}`,
    "---",
    "",
  ].join("\n");

  return frontmatter + lines.join("\n") + "\n";
}

function main() {
  const html = fs.readFileSync(INDEX_HTML, "utf-8");
  const $ = cheerio.load(html);
  fs.mkdirSync(OUT_DIR, { recursive: true });

  let written = 0;
  for (let n = 1; n <= LESSON_COUNT; n += 1) {
    if ($(`#lesson-${n}`).length === 0) {
      console.warn(`#lesson-${n} not found in index.html — skipping`);
      continue;
    }
    const md = buildLessonMarkdown(n, $);
    const fileName = `lesson-${String(n).padStart(2, "0")}.md`;
    fs.writeFileSync(path.join(OUT_DIR, fileName), md, "utf-8");
    written += 1;
  }
  console.log(`Wrote ${written} lesson markdown files -> ${path.relative(ROOT, OUT_DIR)}`);
}

main();
