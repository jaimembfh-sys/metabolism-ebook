const Anthropic = require("@anthropic-ai/sdk");
const { Redis } = require("@upstash/redis");
const { Ratelimit } = require("@upstash/ratelimit");

// ============================================================
// LIVE RESEARCH SEARCH — config-driven, see knowledge-base/researcher-sources.json.
// Never hardcode researcher names here; add new ones to that file only.
// This is the SERVER's copy of the domain allowlist (authoritative — the
// client also renders the same file into prompt text so the model knows
// who it's allowed to search for, but the actual `allowed_domains` sent to
// Anthropic is always computed here, not trusted from client input, since
// that's the one hard boundary ("never search the open internet broadly")
// that must not depend on client-side JS being unmodified).
// ============================================================
const RESEARCHER_SOURCES = require("../../knowledge-base/researcher-sources.json");
const LIVE_SEARCH_ACADEMIC_DOMAINS = ["scholar.google.com", "pubmed.ncbi.nlm.nih.gov"];
const LIVE_SEARCH_ALLOWED_DOMAINS = Array.from(
  new Set(
    [
      ...(RESEARCHER_SOURCES.tier1 || []).map((r) => r.site).filter(Boolean),
      ...LIVE_SEARCH_ACADEMIC_DOMAINS,
    ]
  )
);
// Flat lookup used only to attribute a completed search to a
// tier/researcher for the log line — best-effort, not used for any
// enforcement decision (allowed_domains above is what actually restricts
// the search itself).
const LIVE_SEARCH_RESEARCHER_INDEX = [
  ...(RESEARCHER_SOURCES.tier1 || []).map((r) => ({ ...r, tier: 1 })),
  ...(RESEARCHER_SOURCES.tier2 || []).map((r) => ({ ...r, tier: 2 })),
];
// Anthropic bills web_search per-use in addition to normal token cost for
// the injected result content. VERIFY against https://www.anthropic.com/pricing.
const LIVE_SEARCH_COST_PER_USE_USD = 0.01;

function attributeLiveSearch(query, resultUrls) {
  var q = (query || "").toLowerCase();
  var urls = resultUrls || [];
  // Prefer a site match (tier 1's own domain showed up in the results).
  for (var i = 0; i < LIVE_SEARCH_RESEARCHER_INDEX.length; i++) {
    var r = LIVE_SEARCH_RESEARCHER_INDEX[i];
    if (r.site && urls.some((u) => u.includes(r.site))) {
      return { tier: r.tier, researcher: r.name };
    }
  }
  // Fall back to a name match in the query text (how tier 2 — and tier 1
  // via its "Scholar/PubMed by name" supplement — actually gets searched).
  for (var j = 0; j < LIVE_SEARCH_RESEARCHER_INDEX.length; j++) {
    var r2 = LIVE_SEARCH_RESEARCHER_INDEX[j];
    if (r2.name && q.includes(r2.name.toLowerCase())) {
      return { tier: r2.tier, researcher: r2.name };
    }
  }
  return { tier: null, researcher: null };
}

// ============================================================
// MODEL CONFIG
// ============================================================
// Haiku 4.5 is the default for all routine, high-volume calls (chat + photo
// scans). Do not point these at an Opus-tier model. "protocol" is reserved
// for the one-time intake/protocol-building step; "meal_plan" is reserved
// for the full 7-day Metabolic Meal Planner generation, which needs a much
// larger output budget than the other structured-tool calls (up to ~21
// meal entries in one response) but the same Haiku-by-default policy. Both
// can be pointed at a stronger model later via their own env vars.
const MODELS = {
  chat: "claude-haiku-4-5-20251001",
  photo_scan: "claude-haiku-4-5-20251001",
  protocol: process.env.ANTHROPIC_PROTOCOL_MODEL || "claude-haiku-4-5-20251001",
  meal_plan: process.env.ANTHROPIC_MEAL_PLAN_MODEL || "claude-haiku-4-5-20251001",
  recipe_scale: "claude-haiku-4-5-20251001",
};

// Per-request-type output budget. Most structured-tool calls (protocol,
// chat replies) comfortably fit in 1024 tokens; the weekly meal plan is
// meaningfully bigger (up to 7 days x 3 meals, each with a title/slot/
// description/macros note) so it gets its own larger ceiling rather than
// bumping every other call's cost. recipe_scale (My Recipes > Scale a
// Recipe) returns a full scaled ingredient list plus rewritten
// instructions for one recipe — bigger than a normal chat reply, but
// nowhere near meal_plan's 21-meal-slot output.
const MAX_TOKENS = {
  chat: 1024,
  photo_scan: 1024,
  protocol: 1024,
  meal_plan: 4096,
  recipe_scale: 2048,
};

// Approximate list pricing, USD per million tokens. VERIFY against
// https://www.anthropic.com/pricing before trusting the cost totals below —
// these are only used for the rough per-request cost log/estimate.
const PRICING_USD_PER_MTOK = {
  "claude-haiku-4-5-20251001": { input: 1.0, output: 5.0, cacheWrite: 1.25, cacheRead: 0.1 },
};

// ============================================================
// CONFIGURABLE LIMITS
// Change these via Netlify environment variables, then trigger a redeploy
// (no code changes needed) — they are not hardcoded anywhere else.
// ============================================================
const PHOTO_SCAN_LIMIT_BASE = parseInt(process.env.PHOTO_SCAN_LIMIT_BASE || "5", 10);
const PHOTO_SCAN_LIMIT_PREMIUM = parseInt(process.env.PHOTO_SCAN_LIMIT_PREMIUM || "500", 10);
const CHAT_MESSAGE_LIMIT = parseInt(process.env.CHAT_MESSAGE_LIMIT || "50", 10);
// Hard safety cap is tier-aware so it never undercuts a tier's own marketed
// limits (e.g. premium's 500 photo scans) — it's a bug/abuse net, not a real
// usage restriction, sized well above what a genuine user of that tier does.
const HARD_CAP_PER_24H_BASE = parseInt(process.env.HARD_CAP_PER_24H_BASE || "200", 10);
const HARD_CAP_PER_24H_PREMIUM = parseInt(process.env.HARD_CAP_PER_24H_PREMIUM || "750", 10);

// ============================================================
// UPSTASH REDIS — sliding-window rate limiting (true rolling 24h windows)
// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN automatically.
// ============================================================
const redis = Redis.fromEnv();

const limiters = {
  chat: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(CHAT_MESSAGE_LIMIT, "24 h"),
    prefix: "rl:chat",
  }),
  photo_scan_base: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(PHOTO_SCAN_LIMIT_BASE, "24 h"),
    prefix: "rl:photo:base",
  }),
  photo_scan_premium: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(PHOTO_SCAN_LIMIT_PREMIUM, "24 h"),
    prefix: "rl:photo:premium",
  }),
  // Hard safety valve across ALL request types, within a tier. Sized well
  // above that tier's own category limits so it only ever catches genuine
  // bugs/abuse, never a real user's normal usage.
  hardCap_base: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(HARD_CAP_PER_24H_BASE, "24 h"),
    prefix: "rl:hardcap:base",
  }),
  hardCap_premium: new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(HARD_CAP_PER_24H_PREMIUM, "24 h"),
    prefix: "rl:hardcap:premium",
  }),
};

function categoryLimitValue(requestType, tier) {
  if (requestType === "chat") return CHAT_MESSAGE_LIMIT;
  if (requestType === "photo_scan") return tier === "premium" ? PHOTO_SCAN_LIMIT_PREMIUM : PHOTO_SCAN_LIMIT_BASE;
  return null; // protocol: no category ceiling, only the hard cap applies
}

function categoryLimiterFor(requestType, tier) {
  if (requestType === "chat") return limiters.chat;
  if (requestType === "photo_scan") return tier === "premium" ? limiters.photo_scan_premium : limiters.photo_scan_base;
  return null;
}

function hardCapLimitValue(tier) {
  return tier === "premium" ? HARD_CAP_PER_24H_PREMIUM : HARD_CAP_PER_24H_BASE;
}

function hardCapLimiterFor(tier) {
  return tier === "premium" ? limiters.hardCap_premium : limiters.hardCap_base;
}

async function getTier(userId) {
  const tier = await redis.get(`tier:${userId}`);
  return tier === "premium" ? "premium" : "base";
}

function estimateCostUsd(model, usage) {
  const pricing = PRICING_USD_PER_MTOK[model];
  if (!pricing || !usage) return 0;
  const inputTokens = usage.input_tokens || 0;
  const outputTokens = usage.output_tokens || 0;
  const cacheWriteTokens = usage.cache_creation_input_tokens || 0;
  const cacheReadTokens = usage.cache_read_input_tokens || 0;
  return (
    (inputTokens * pricing.input +
      outputTokens * pricing.output +
      cacheWriteTokens * pricing.cacheWrite +
      cacheReadTokens * pricing.cacheRead) /
    1_000_000
  );
}

// Read-only status for a category — does not consume a request from the window.
async function categoryStatus(requestType, tier, userId) {
  const limit = categoryLimitValue(requestType, tier);
  if (limit === null) return { used: 0, limit: null, reset: null };
  const limiter = categoryLimiterFor(requestType, tier);
  const { remaining, reset } = await limiter.getRemaining(userId);
  return { used: Math.max(0, limit - remaining), limit, reset };
}

async function buildUsageSummary(userId) {
  const tier = await getTier(userId);
  const hardCapLimit = hardCapLimitValue(tier);
  const [chat, photo_scan, hardCapRemaining] = await Promise.all([
    categoryStatus("chat", tier, userId),
    categoryStatus("photo_scan", tier, userId),
    hardCapLimiterFor(tier).getRemaining(userId),
  ]);
  return {
    tier,
    categories: {
      chat,
      photo_scan,
      protocol: { used: 0, limit: null, reset: null },
      meal_plan: { used: 0, limit: null, reset: null },
    },
    hardCap: {
      used: Math.max(0, hardCapLimit - hardCapRemaining.remaining),
      limit: hardCapLimit,
      reset: hardCapRemaining.reset,
    },
  };
}

function friendlyResetTime(resetMs) {
  if (!resetMs) return "soon";
  try {
    return new Date(resetMs).toLocaleString();
  } catch (e) {
    return "soon";
  }
}

exports.handler = async function (event) {
  // --- GET: read-only usage/limit report, no Claude call, no quota consumed ---
  if (event.httpMethod === "GET") {
    const userId = event.queryStringParameters && event.queryStringParameters.deviceId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(await buildUsageSummary(userId)),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const {
      system,
      messages,
      deviceId: userId,
      requestType: rawRequestType,
      tools,
      tool_choice,
      liveSearchBudgetRemaining,
    } = JSON.parse(event.body);
    const requestType = ["chat", "photo_scan", "protocol", "meal_plan", "recipe_scale"].includes(rawRequestType) ? rawRequestType : "chat";

    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }

    const tier = await getTier(userId);

    // Hard safety cap first — applies regardless of request type, but the
    // ceiling itself is tier-aware so it never undercuts that tier's own
    // marketed limits.
    const hardCapResult = await hardCapLimiterFor(tier).limit(userId);
    if (!hardCapResult.success) {
      return {
        statusCode: 429,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          error: `You've reached today's overall usage limit (${hardCapLimitValue(tier)} requests/day). This resets ${friendlyResetTime(hardCapResult.reset)}.`,
          limitType: "hard_cap",
          rateLimit: await buildUsageSummary(userId),
        }),
      };
    }

    const categoryLimiter = categoryLimiterFor(requestType, tier);
    if (categoryLimiter) {
      const categoryResult = await categoryLimiter.limit(userId);
      if (!categoryResult.success) {
        const limit = categoryLimitValue(requestType, tier);
        const message =
          requestType === "photo_scan"
            ? `You've used all ${limit} of your daily photo scans. This resets ${friendlyResetTime(categoryResult.reset)}.` +
              (tier === "base" ? " Upgrade for a much higher daily limit." : "")
            : `You've reached today's chat message limit (${limit}/day). This resets ${friendlyResetTime(categoryResult.reset)}.`;
        return {
          statusCode: 429,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ error: message, limitType: requestType, rateLimit: await buildUsageSummary(userId) }),
        };
      }
    }

    const model = MODELS[requestType];
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Reused system prompt (course/recipe context + coaching instructions) is
    // cached so repeated calls don't reprocess it every time.
    const systemBlocks =
      typeof system === "string"
        ? [{ type: "text", text: system, cache_control: { type: "ephemeral" } }]
        : system;

    const createParams = {
      model,
      max_tokens: MAX_TOKENS[requestType] || 1024,
      system: systemBlocks,
      messages,
    };
    // Optional structured-output passthrough: when a caller supplies a tool
    // definition + tool_choice, the model is forced to respond via that tool
    // instead of free-form text, so the output shape is enforced by the API
    // rather than by prompt instructions alone.
    if (tools) createParams.tools = tools;
    if (tool_choice) createParams.tool_choice = tool_choice;

    // Live research search (see knowledge-base/researcher-sources.json) —
    // only attached when the caller has budget left AND isn't forcing a
    // specific other tool_choice (forcing tool_choice to e.g. record_protocol
    // means Claude's very next action IS that tool call, so it can never
    // search first in that same turn — callers that need both do a separate
    // untargeted research call first, then their normal forced-tool call).
    // allowed_domains is always computed server-side from the config file,
    // never trusted from the request body, since "never search the open
    // internet broadly" is a hard boundary, not a client-side suggestion.
    const wantsLiveSearch = Number(liveSearchBudgetRemaining) > 0 && !(tool_choice && tool_choice.type === "tool");
    if (wantsLiveSearch) {
      createParams.tools = (createParams.tools || []).concat([
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: Math.min(Number(liveSearchBudgetRemaining), 2),
          allowed_domains: LIVE_SEARCH_ALLOWED_DOMAINS,
        },
      ]);
    }

    const response = await client.messages.create(createParams);

    // How many searches Claude actually performed this call — exposed
    // directly on usage, no need to count content blocks by hand.
    const liveSearchesUsed = (response.usage.server_tool_use && response.usage.server_tool_use.web_search_requests) || 0;

    if (liveSearchesUsed > 0) {
      // Log one line per search performed, with a best-effort tier/researcher
      // attribution — for periodic manual review, not a dashboard. Also
      // charge each search against the same hard safety cap as a normal
      // request, on top of the one already consumed for this call itself.
      const searchCalls = response.content.filter((b) => b.type === "server_tool_use" && b.name === "web_search");
      const resultsByToolUseId = {};
      response.content
        .filter((b) => b.type === "web_search_tool_result")
        .forEach((b) => {
          resultsByToolUseId[b.tool_use_id] = Array.isArray(b.content) ? b.content : [];
        });

      for (const call of searchCalls) {
        const results = resultsByToolUseId[call.id] || [];
        const resultUrls = results.map((r) => r.url).filter(Boolean);
        const attribution = attributeLiveSearch(call.input && call.input.query, resultUrls);
        console.log(
          JSON.stringify({
            event: "live_search",
            user_id: userId,
            timestamp: new Date().toISOString(),
            request_type: requestType,
            query: call.input && call.input.query,
            tier_searched: attribution.tier,
            researcher_matched: attribution.researcher,
            result_count: results.length,
            had_results: results.length > 0,
          })
        );
        // Best-effort — a rare failure here should never break the actual
        // response the user is waiting on.
        try {
          await hardCapLimiterFor(tier).limit(userId);
        } catch (e) {
          console.error("live_search hard-cap consumption failed", e.message);
        }
      }
    }

    const cost = estimateCostUsd(model, response.usage) + liveSearchesUsed * LIVE_SEARCH_COST_PER_USE_USD;
    console.log(
      JSON.stringify({
        event: "ai_usage",
        user_id: userId,
        timestamp: new Date().toISOString(),
        tier,
        hard_cap_limit: hardCapLimitValue(tier),
        request_type: requestType,
        model,
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_creation_input_tokens: response.usage.cache_creation_input_tokens || 0,
        cache_read_input_tokens: response.usage.cache_read_input_tokens || 0,
        live_searches_used: liveSearchesUsed,
        estimated_cost_usd: cost,
      })
    );

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...response, liveSearchesUsed, rateLimit: await buildUsageSummary(userId) }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
