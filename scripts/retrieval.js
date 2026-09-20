/* ============================================================
   Corpus retrieval
   ============================================================

   Why this exists. buildProtocolCorpusText used to map every chunk into the
   prompt with no selection step: 609 chunks, 286,360 input tokens measured on
   a real Protocol Builder call. That did not just cost money, it made the
   coach worse. Measured 2026-09-20 on the chronic-condition profile, citation
   breadth collapsed from 10 sources to 4 when the coach layer was added, on
   BOTH Haiku and Sonnet - so it was dilution from corpus size, not the model.

   THE INVARIANT, and the reason this file is written the way it is:

     Every chunk tagged safety_critical is included unconditionally. It is
     never scored, never ranked, never truncated, never subject to a limit.

   The retrieval step must not be able to drop the statin rule because the
   user did not happen to type the word "statin". If you change anything in
   here, that is the property to preserve, and knowledge-base/coach-fixtures.json
   is how you check you did.

   Caching. netlify/functions/claude.js puts a single ephemeral cache_control
   breakpoint at the END of the system string, so any variation anywhere
   invalidates the whole prefix. Per-user retrieval would therefore turn every
   call into a cache write. buildSystemBlocks() below splits the prompt into a
   stable block (rules + safety-critical + instructions) that carries the
   breakpoint, and a variable block (the retrieved chunks) after it.

   No dependencies, deliberately. Runs in the browser and under node so the
   test harness exercises the same code the app does.
   ============================================================ */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  else root.CorpusRetrieval = api;
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  // Words too common to carry signal. Deliberately short - an aggressive
  // stoplist would strip clinically meaningful terms like "low" or "high".
  var STOP = new Set(
    ("a an and are as at be but by for from has have i if in into is it its of on or " +
      "she her he his they them their this that to was were will with you your me my " +
      "not no yes do does did been being am we us our what which who whom how when " +
      "where why all any both each more most other some such than too very can just " +
      "would should could get got go going none").split(" ")
  );

  function tokenize(text) {
    if (!text) return [];
    return String(text)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/[\s-]+/)
      .filter(function (t) {
        return t.length >= 3 && !STOP.has(t);
      });
  }

  function isSafetyCritical(chunk) {
    return (chunk.tags || []).indexOf("safety_critical") !== -1;
  }

  function isBackend(chunk) {
    return (chunk.tags || []).indexOf("backend_reference") !== -1;
  }

  /* ---- index ----
     Built once per corpus and memoised on the corpus object, because
     fetchProtocolCorpus caches the parsed JSON and every later call reuses it. */
  function buildIndex(chunks) {
    var docs = chunks.map(function (c) {
      // Heading, section and title are the highest-signal fields, so their
      // terms are counted three times rather than given a separate weight
      // pass - same effect, simpler scoring loop.
      var boosted = [c.doc_title, c.section, c.heading, (c.tags || []).join(" ")]
        .filter(Boolean)
        .join(" ");
      var terms = tokenize(boosted).concat(tokenize(boosted)).concat(tokenize(boosted)).concat(tokenize(c.text));
      var tf = Object.create(null);
      for (var i = 0; i < terms.length; i++) tf[terms[i]] = (tf[terms[i]] || 0) + 1;
      return { tf: tf, len: terms.length || 1 };
    });

    var df = Object.create(null);
    docs.forEach(function (d) {
      Object.keys(d.tf).forEach(function (t) {
        df[t] = (df[t] || 0) + 1;
      });
    });

    return { docs: docs, df: df, n: chunks.length };
  }

  function getIndex(corpus, chunks) {
    if (corpus && corpus.__retrievalIndex && corpus.__retrievalIndexFor === chunks.length) {
      return corpus.__retrievalIndex;
    }
    var idx = buildIndex(chunks);
    if (corpus) {
      try {
        Object.defineProperty(corpus, "__retrievalIndex", { value: idx, enumerable: false, writable: true });
        Object.defineProperty(corpus, "__retrievalIndexFor", { value: chunks.length, enumerable: false, writable: true });
      } catch (e) { /* non-extensible corpus: just rebuild each time */ }
    }
    return idx;
  }

  /**
   * Select chunks for one call.
   *
   * @param {object} corpus   parsed protocol-corpus.json
   * @param {object} opts
   *   query {string}   the user's intake text - what relevance is scored against
   *   limit {number}   max SCORED chunks (safety-critical are extra, always)
   *   layers {object}  { lessons:bool, backend:bool } - Stage 1 filter
   * @returns {{ always: Array, scored: Array, stats: object }}
   */
  function select(corpus, opts) {
    opts = opts || {};
    var all = (corpus && corpus.chunks) || [];
    var limit = typeof opts.limit === "number" ? opts.limit : 60;
    var layers = opts.layers || { lessons: true, backend: true };

    // --- the invariant. Taken before any filtering or scoring happens. ---
    var always = all.filter(isSafetyCritical);
    var alwaysIds = new Set(always.map(function (c) { return c.id; }));

    // --- Stage 1: layer filter ---
    var pool = all.filter(function (c) {
      if (alwaysIds.has(c.id)) return false; // already guaranteed
      return isBackend(c) ? !!layers.backend : !!layers.lessons;
    });

    // No query means no basis for ranking; fall back to the layer-filtered set
    // truncated, rather than silently returning nothing.
    var qTerms = tokenize(opts.query);
    if (!qTerms.length) {
      return {
        always: always,
        scored: pool.slice(0, limit),
        stats: { total: all.length, always: always.length, pool: pool.length, scored: Math.min(limit, pool.length), ranked: false },
      };
    }

    var idx = getIndex(corpus, all);
    var byId = Object.create(null);
    all.forEach(function (c, i) { byId[c.id] = i; });

    var uniq = Array.from(new Set(qTerms));
    var scoredPool = pool.map(function (c) {
      var d = idx.docs[byId[c.id]];
      var score = 0;
      for (var i = 0; i < uniq.length; i++) {
        var t = uniq[i];
        var f = d.tf[t];
        if (!f) continue;
        // idf, damped so a term in half the corpus still counts for something
        var idf = Math.log(1 + idx.n / (1 + (idx.df[t] || 0)));
        // sublinear tf, length-normalised
        score += (1 + Math.log(f)) * idf / Math.sqrt(d.len);
      }
      return { chunk: c, score: score };
    });

    scoredPool.sort(function (a, b) {
      if (b.score !== a.score) return b.score - a.score;
      return a.chunk.id < b.chunk.id ? -1 : 1; // stable, for reproducibility
    });

    var picked = scoredPool.filter(function (s) { return s.score > 0; }).slice(0, limit);

    return {
      always: always,
      scored: picked.map(function (s) { return s.chunk; }),
      stats: {
        total: all.length,
        always: always.length,
        pool: pool.length,
        scored: picked.length,
        ranked: true,
        topScore: picked.length ? +picked[0].score.toFixed(4) : 0,
      },
    };
  }

  /** Renders chunks exactly as buildProtocolCorpusText always has. */
  function render(chunks) {
    return chunks
      .map(function (c) {
        var label = c.doc_title || c.source_file || "Source";
        var safety = (c.tags || []).indexOf("safety_critical") !== -1 ? "[SAFETY-CRITICAL] " : "";
        return "### " + safety + "[" + label + " — " + c.heading + "]\n" + c.text;
      })
      .join("\n\n");
  }

  /**
   * Assemble the system prompt as cache-friendly blocks.
   *
   * Block 1 is identical for every user, so it caches. Block 2 varies per
   * user and deliberately carries no breakpoint.
   */
  function buildSystemBlocks(stableText, variableText) {
    var blocks = [{ type: "text", text: stableText, cache_control: { type: "ephemeral" } }];
    if (variableText) blocks.push({ type: "text", text: variableText });
    return blocks;
  }

  return {
    select: select,
    render: render,
    buildSystemBlocks: buildSystemBlocks,
    tokenize: tokenize,
    isSafetyCritical: isSafetyCritical,
    isBackend: isBackend,
  };
});
