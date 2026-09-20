#!/usr/bin/env node
/**
 * Chunk `coach-reference/` into JSONL for build-corpus.js.
 *
 * Why this exists instead of reusing chunk_markdown.js: that chunker requires
 * explicit "<!-- chunk -->" markers before every "## Heading", and the coach
 * documents are hand-written prose with no markers. Adding markers would mean
 * editing 20 of Jaime's source documents. This reads their natural heading
 * structure instead and leaves the sources untouched.
 *
 * Structure the coach files actually use:
 *   "# B4 - SALT AND THE ADIPOSE RAAS"   -> section (major topic block)
 *   "## 15.3 Fasting and cortisol"       -> heading (entry within the block)
 *
 * Output schema matches chunk_markdown.js exactly so build-corpus.js can merge
 * the three sources without special-casing.
 *
 * Usage: node chunk-coach-reference.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SRC_DIR = path.join(ROOT, "coach-reference");
const OUT_DIR = path.join(__dirname, "coach-chunks");

// Files deliberately kept out of the corpus. Each needs a reason — a file
// excluded without one will be re-added by whoever reads this next.
const EXCLUDE = {
  // Explicitly superseded by manuscript/Chapter_04_Complete.md:5. Ingesting it
  // would put retired mitochondria guidance back in front of the coach.
  "Lesson_04_Coach_Depth.md": "superseded by Chapter_04_Complete.md",

  // Reader copy misfiled into coach-reference/. Its own header says
  // "Paste-ready course copy", primary home Lesson 9 — which already carries
  // this material, so ingesting it would duplicate the lesson.
  "Protein_Section_Course_Copy.md": "reader copy; already in Lesson 9",
};

// Chunks above this get split on paragraph boundaries. The lesson corpus runs
// p50 172 / p90 410 words, so this keeps the coach layer in the same range
// rather than dropping a 2,000-word block into retrieval as one unit.
const MAX_WORDS = 450;

const H1_RE = /^#\s+(.*\S)\s*$/;
const H2_RE = /^##\s+(.*\S)\s*$/;

// A chunk is tagged safety_critical when it carries one of the explicit safety
// markers the coach documents use. Deliberately literal — inferring safety
// relevance from topic would over-tag and make the flag meaningless.
const SAFETY_MARKERS = [
  "ABSOLUTE SAFETY RULE",
  "SAFETY —",
  "SODIUM SAFETY",
  "PROHIBITED",
  "URGENT ESCALATION",
  "ESCALATE",
  "do not provide numeric",
  "route to their clinician",
  "route to her physician",
  "disordered eating",
  "ketoacidosis",
];

function wordCount(s) {
  return s.split(/\s+/).filter(Boolean).length;
}

/** Split an over-long block on blank lines, never mid-paragraph. */
function splitLong(text) {
  if (wordCount(text) <= MAX_WORDS) return [text];
  const paras = text.split(/\n{2,}/);
  const out = [];
  let buf = [];
  for (const p of paras) {
    const candidate = buf.concat(p);
    if (buf.length && wordCount(candidate.join("\n\n")) > MAX_WORDS) {
      out.push(buf.join("\n\n"));
      buf = [p];
    } else {
      buf = candidate;
    }
  }
  if (buf.length) out.push(buf.join("\n\n"));
  return out;
}

function parse(body) {
  const lines = body.split("\n");
  const blocks = [];
  let section = null;
  let heading = null;
  let buf = [];

  const flush = () => {
    const text = buf.join("\n").trim().replace(/\n{3,}/g, "\n\n");
    if (text) blocks.push({ section, heading: heading ?? section, text });
    buf = [];
  };

  for (const line of lines) {
    const h1 = line.match(H1_RE);
    const h2 = line.match(H2_RE);
    if (h1) {
      flush();
      section = h1[1];
      heading = null;
    } else if (h2) {
      flush();
      heading = h2[1];
    } else {
      buf.push(line);
    }
  }
  flush();
  return blocks;
}

function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => f.endsWith(".md"))
    .sort();

  const all = [];
  const skipped = [];

  for (const file of files) {
    if (EXCLUDE[file]) {
      skipped.push(`${file} (${EXCLUDE[file]})`);
      continue;
    }

    const raw = fs.readFileSync(path.join(SRC_DIR, file), "utf-8");
    const stem = path.basename(file, ".md");
    const docTitle = (raw.match(H1_RE.source ? /^#\s+(.*\S)\s*$/m : null) || [])[1] ?? stem;

    const chunks = [];
    for (const block of parse(raw)) {
      for (const text of splitLong(block.text)) {
        const tags = ["backend_reference"];
        if (SAFETY_MARKERS.some((m) => text.includes(m))) tags.push("safety_critical");
        // Prose sitting directly under the document's own H1 would otherwise
        // render as "[Title — Title]" in the prompt. Match the lesson corpus
        // convention and call it Overview.
        const heading = block.heading === docTitle ? "Overview" : block.heading;
        chunks.push({
          id: `coach-${stem}-${String(chunks.length).padStart(3, "0")}`,
          doc_title: docTitle,
          doc_subtitle: "Coach reference — backend layer, not for direct user display",
          byline: "Mind-Body Functional Health",
          source_file: `coach-reference/${file}`,
          section: block.section,
          heading,
          page: null,
          tags,
          text,
        });
      }
    }

    const outPath = path.join(OUT_DIR, `${stem}.jsonl`);
    fs.writeFileSync(outPath, chunks.map((c) => JSON.stringify(c)).join("\n") + "\n", "utf-8");
    console.log(`${file}: ${chunks.length} chunks`);
    all.push(...chunks);
  }

  fs.writeFileSync(
    path.join(OUT_DIR, "all_chunks.jsonl"),
    all.map((c) => JSON.stringify(c)).join("\n") + "\n",
    "utf-8"
  );

  const safety = all.filter((c) => c.tags.includes("safety_critical")).length;
  const words = all.reduce((s, c) => s + wordCount(c.text), 0);
  console.log(`\nTotal: ${all.length} chunks (${safety} safety_critical), ~${words} words`);
  if (skipped.length) console.log(`Excluded:\n  ${skipped.join("\n  ")}`);
}

main();
