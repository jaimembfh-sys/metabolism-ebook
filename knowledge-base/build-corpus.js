#!/usr/bin/env node
/**
 * Merge the two chunked JSONL sources — course lessons (knowledge-base/chunks)
 * and the functional-medicine docs (Functional medicine content/processed/chunks)
 * — into one static corpus file the Protocol Builder fetches at runtime
 * (index.html -> fetchProtocolCorpus()).
 *
 * Re-run this after re-running either chunk_markdown.js or extract-lessons.js.
 *
 * Usage: node build-corpus.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCES = [
  path.join(__dirname, "chunks", "all_chunks.jsonl"),
  path.join(ROOT, "Functional medicine content", "processed", "chunks", "all_chunks.jsonl"),
];
const OUT_PATH = path.join(__dirname, "protocol-corpus.json");

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) {
    console.warn(`Missing (skipped): ${path.relative(ROOT, filePath)}`);
    return [];
  }
  return fs
    .readFileSync(filePath, "utf-8")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => JSON.parse(line));
}

function main() {
  const chunks = SOURCES.flatMap(readJsonl);

  const corpus = {
    generated_at: new Date().toISOString(),
    chunk_count: chunks.length,
    chunks,
  };

  fs.writeFileSync(OUT_PATH, JSON.stringify(corpus), "utf-8");

  const wordCount = chunks.reduce((sum, c) => sum + (c.text ? c.text.split(/\s+/).length : 0), 0);
  const safetyCriticalCount = chunks.filter((c) => (c.tags || []).includes("safety_critical")).length;
  console.log(`${chunks.length} chunks (${safetyCriticalCount} safety_critical), ~${wordCount} words -> ${path.relative(ROOT, OUT_PATH)}`);
}

main();
