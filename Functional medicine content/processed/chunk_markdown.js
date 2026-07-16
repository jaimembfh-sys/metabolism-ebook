#!/usr/bin/env node
/**
 * Regenerate JSONL chunk files from the source-of-truth markdown files.
 *
 * Markdown convention (see markdown/*.md):
 *   - YAML-ish frontmatter (--- ... ---) at the top holds document-level
 *     metadata (title, subtitle, byline, source_file).
 *   - "# Heading" lines are section groupers (optional, used for context only).
 *   - "<!-- chunk -->" marks the start of a chunk. The line right after it
 *     must be a "## Heading" that becomes the chunk's own title.
 *   - "<!-- page: N -->" or "<!-- page: N-M -->" (optional, right after the
 *     heading) records the source PDF page(s) for that chunk. For non-PDF
 *     sources this field can hold any label (e.g. "Lesson 9").
 *   - "<!-- tags: a, b -->" (optional, anywhere in the chunk) records a small
 *     set of retrieval/audit tags (e.g. "safety_critical"). Defaults to an
 *     empty array when absent.
 *   - Everything after that, up to the next "<!-- chunk -->", heading, or
 *     EOF, is the chunk body text.
 *
 * Usage:
 *   node chunk_markdown.js
 *   node chunk_markdown.js --markdown-dir ./markdown --out-dir ./chunks
 */

const fs = require("fs");
const path = require("path");

const FRONTMATTER_RE = /^---\s*\n([\s\S]*?)\n---\s*\n?/;
const CHUNK_MARKER_RE = /^<!--\s*chunk\s*-->\s*$/;
const PAGE_COMMENT_RE = /^<!--\s*page:\s*(.+?)\s*-->\s*$/;
const TAGS_COMMENT_RE = /^<!--\s*tags:\s*(.+?)\s*-->\s*$/;
const H1_RE = /^#\s+(.*\S)\s*$/;
const H2_RE = /^##\s+(.*\S)\s*$/;

function parseFrontmatter(text) {
  const match = text.match(FRONTMATTER_RE);
  if (!match) return [{}, text];
  const meta = {};
  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();
    const idx = trimmed.indexOf(":");
    if (!trimmed || idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const value = trimmed.slice(idx + 1).trim().replace(/^"(.*)"$/, "$1");
    meta[key] = value;
  }
  return [meta, text.slice(match[0].length)];
}

function parseChunks(body) {
  const lines = body.split("\n");
  const chunks = [];
  let currentH1 = null;
  let i = 0;
  const n = lines.length;

  while (i < n) {
    const line = lines[i];

    if (H1_RE.test(line) && !CHUNK_MARKER_RE.test(line)) {
      currentH1 = line.match(H1_RE)[1];
      i += 1;
      continue;
    }

    if (CHUNK_MARKER_RE.test(line)) {
      i += 1;
      while (i < n && !lines[i].trim()) i += 1;
      if (i >= n || !H2_RE.test(lines[i])) {
        throw new Error(`Expected '## Heading' after <!-- chunk --> near line ${i}`);
      }
      const heading = lines[i].match(H2_RE)[1];
      i += 1;

      let page = null;
      let tags = [];
      const bodyLines = [];
      while (i < n) {
        if (CHUNK_MARKER_RE.test(lines[i]) || H1_RE.test(lines[i]) || H2_RE.test(lines[i])) break;
        const pageMatch = lines[i].match(PAGE_COMMENT_RE);
        const tagsMatch = lines[i].match(TAGS_COMMENT_RE);
        if (pageMatch) {
          page = pageMatch[1];
        } else if (tagsMatch) {
          tags = tagsMatch[1].split(",").map((t) => t.trim()).filter(Boolean);
        } else {
          bodyLines.push(lines[i]);
        }
        i += 1;
      }

      const text = bodyLines.join("\n").trim().replace(/\n{3,}/g, "\n\n");
      chunks.push({ section: currentH1, heading, page, tags, text });
      continue;
    }

    i += 1;
  }

  return chunks;
}

function buildRecords(mdPath) {
  const raw = fs.readFileSync(mdPath, "utf-8");
  const [meta, body] = parseFrontmatter(raw);
  const chunks = parseChunks(body);

  const stem = path.basename(mdPath, ".md");
  return chunks.map((chunk, idx) => ({
    id: `${stem}-${String(idx).padStart(3, "0")}`,
    doc_title: meta.title ?? null,
    doc_subtitle: meta.subtitle ?? null,
    byline: meta.byline ?? null,
    source_file: meta.source_file ?? null,
    section: chunk.section,
    heading: chunk.heading,
    page: chunk.page,
    tags: chunk.tags,
    text: chunk.text,
  }));
}

function parseArgs(argv) {
  const scriptDir = __dirname;
  const args = { markdownDir: path.join(scriptDir, "markdown"), outDir: path.join(scriptDir, "chunks") };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--markdown-dir") args.markdownDir = path.resolve(argv[++i]);
    if (argv[i] === "--out-dir") args.outDir = path.resolve(argv[++i]);
  }
  return args;
}

function main() {
  const scriptDir = __dirname;
  const { markdownDir, outDir } = parseArgs(process.argv.slice(2));

  fs.mkdirSync(outDir, { recursive: true });

  const mdFiles = fs
    .readdirSync(markdownDir)
    .filter((f) => f.endsWith(".md"))
    .sort()
    .map((f) => path.join(markdownDir, f));

  if (mdFiles.length === 0) {
    console.log(`No markdown files found in ${markdownDir}`);
    return;
  }

  const allRecords = [];
  for (const mdPath of mdFiles) {
    const records = buildRecords(mdPath);
    const stem = path.basename(mdPath, ".md");
    const outPath = path.join(outDir, `${stem}.jsonl`);
    fs.writeFileSync(outPath, records.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");
    console.log(`${path.basename(mdPath)}: ${records.length} chunks -> ${path.relative(scriptDir, outPath)}`);
    allRecords.push(...records);
  }

  const combinedPath = path.join(outDir, "all_chunks.jsonl");
  fs.writeFileSync(combinedPath, allRecords.map((r) => JSON.stringify(r)).join("\n") + "\n", "utf-8");
  console.log(`Total: ${allRecords.length} chunks -> ${path.relative(scriptDir, combinedPath)}`);
}

main();
