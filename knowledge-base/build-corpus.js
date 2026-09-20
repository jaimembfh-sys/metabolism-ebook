#!/usr/bin/env node
/**
 * Merge the three chunked JSONL sources — course lessons (knowledge-base/chunks),
 * the functional-medicine docs (Functional medicine content/processed/chunks),
 * and the coach reference layer (knowledge-base/coach-chunks) — into one static
 * corpus file the Protocol Builder fetches at runtime
 * (index.html -> fetchProtocolCorpus()).
 *
 * Re-run this after re-running chunk_markdown.js, extract-lessons.js, or
 * chunk-coach-reference.js.
 *
 * On the coach layer: it was orphaned until 2026-09-20 — 470 KB of prohibited
 * claims, safety gates and conflict flags with zero runtime presence. It was
 * gated behind a reconciliation prerequisite (manuscript/CORPUS_WIRING_PLAN.md)
 * because the flags described a version of the book that no longer existed;
 * that reconciliation shipped in 4df3151, which is what unblocked this.
 *
 * Retrievable is not enforced. These chunks let the coach cite the rules; they
 * do not make it follow them. The enforcement path is coach-rules.json, which
 * goes into the system prompt above the corpus.
 *
 * Usage: node build-corpus.js
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const SOURCES = [
  path.join(__dirname, "chunks", "all_chunks.jsonl"),
  path.join(ROOT, "Functional medicine content", "processed", "chunks", "all_chunks.jsonl"),
  path.join(__dirname, "coach-chunks", "all_chunks.jsonl"),
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
  const backendCount = chunks.filter((c) => (c.tags || []).includes("backend_reference")).length;
  console.log(`${chunks.length} chunks (${safetyCriticalCount} safety_critical, ${backendCount} backend_reference), ~${wordCount} words -> ${path.relative(ROOT, OUT_PATH)}`);
}

main();
