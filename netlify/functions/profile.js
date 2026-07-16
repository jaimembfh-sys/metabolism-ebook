const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();

function profileKey(userId) {
  return `profile:${userId}`;
}

function changeLogKey(userId) {
  return `goal_change_log:${userId}`;
}

function asObject(raw) {
  if (!raw) return null;
  if (typeof raw === "string") {
    try {
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }
  return raw;
}

async function getProfile(userId) {
  return asObject(await redis.get(profileKey(userId)));
}

async function getChangeLog(userId) {
  const entries = await redis.lrange(changeLogKey(userId), 0, -1);
  return (entries || []).map(asObject).filter(Boolean);
}

exports.handler = async function (event) {
  if (event.httpMethod === "GET") {
    const userId = event.queryStringParameters && event.queryStringParameters.deviceId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }
    const [profile, goalChangeLog] = await Promise.all([getProfile(userId), getChangeLog(userId)]);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, goal_change_log: goalChangeLog }),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { deviceId: userId, action, profile: incoming, reason } = JSON.parse(event.body);
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }
    if (!incoming || typeof incoming !== "object") {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing profile" }) };
    }

    const now = Date.now();
    const existing = await getProfile(userId);

    // "update" = an edit to an already-saved goal/why — requires a stated
    // reason and is logged. "save" = the first-time intake result, which is
    // a creation, not an edit, so it isn't logged as a change.
    if (action === "update") {
      if (!reason || !reason.trim()) {
        return { statusCode: 400, body: JSON.stringify({ error: "A reason is required to update your goal." }) };
      }
      const changeEntry = {
        changed_at: now,
        reason: reason.trim(),
        previous: existing
          ? {
              long_term_goal_text: existing.long_term_goal && existing.long_term_goal.text,
              core_why_summary: existing.core_why_summary,
              monthly_goal: existing.monthly_goal,
              weekly_goal: existing.weekly_goal,
            }
          : null,
        updated: {
          long_term_goal_text: incoming.long_term_goal && incoming.long_term_goal.text,
          core_why_summary: incoming.core_why_summary,
          monthly_goal: incoming.monthly_goal,
          weekly_goal: incoming.weekly_goal,
        },
      };
      await redis.rpush(changeLogKey(userId), JSON.stringify(changeEntry));
    }

    const merged = Object.assign({}, existing || {}, incoming, {
      created_at: (existing && existing.created_at) || now,
      updated_at: now,
    });

    await redis.set(profileKey(userId), JSON.stringify(merged));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile: merged }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
