const { Redis } = require("@upstash/redis");
const crypto = require("crypto");

const redis = Redis.fromEnv();

// Flat per-user cap, not a rolling window like the AI usage limiters in
// claude.js — this only guards against runaway/accidental spamming of saves,
// not genuine daily usage, so a simple count check is sufficient.
const MAX_RECIPES_PER_USER = 50;

function recipesKey(userId) {
  return `user_recipes:${userId}`;
}

async function getRecipes(userId) {
  const raw = await redis.get(recipesKey(userId));
  if (!raw) return [];
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }
  return Array.isArray(raw) ? raw : [];
}

exports.handler = async function (event) {
  if (event.httpMethod === "GET") {
    const userId = event.queryStringParameters && event.queryStringParameters.deviceId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }
    const recipes = await getRecipes(userId);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipes }),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { deviceId: userId, action, recipe, id } = JSON.parse(event.body);
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }

    if (action === "delete") {
      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
      }
      const existing = await getRecipes(userId);
      const filtered = existing.filter((r) => r.id !== id);
      await redis.set(recipesKey(userId), JSON.stringify(filtered));
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipes: filtered }),
      };
    }

    // "Overwrite Original" from the Meal Planner's proactive-coaching flow
    // (see startRecipeAdjustment in index.html) — replaces the matching
    // recipe's content in place (same id, so it doesn't count against the
    // 50-recipe cap as a new entry) rather than appending a new one.
    if (action === "update") {
      if (!id) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
      }
      if (!recipe || typeof recipe !== "object" || !recipe.title || !recipe.ingredients || !recipe.instructions) {
        return { statusCode: 400, body: JSON.stringify({ error: "Recipe is missing required fields" }) };
      }
      const existing = await getRecipes(userId);
      const index = existing.findIndex((r) => r.id === id);
      if (index === -1) {
        return { statusCode: 404, body: JSON.stringify({ error: "Recipe not found" }) };
      }
      const now = Date.now();
      const updated = {
        ...existing[index],
        title: String(recipe.title).trim(),
        ingredients: String(recipe.ingredients).trim(),
        instructions: String(recipe.instructions).trim(),
        original_recipe_text: recipe.original_recipe_text ? String(recipe.original_recipe_text).trim() : existing[index].original_recipe_text,
        substitution_note: recipe.substitution_note ? String(recipe.substitution_note).trim() : null,
        servings: recipe.servings || null,
        estimated_macros: recipe.estimated_macros || null,
        qualitative_macro_note: recipe.qualitative_macro_note || null,
        user_corrected: !!recipe.user_corrected,
        updated_at: now,
      };
      const updatedList = existing.slice();
      updatedList[index] = updated;
      await redis.set(recipesKey(userId), JSON.stringify(updatedList));
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipe: updated, recipes: updatedList }),
      };
    }

    // Default action: save (create). This is a private, per-device recipe
    // collection — never merged into the shared knowledge-base/recipes corpus.
    if (!recipe || typeof recipe !== "object") {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing recipe" }) };
    }
    if (!recipe.title || !recipe.ingredients || !recipe.instructions) {
      return { statusCode: 400, body: JSON.stringify({ error: "Recipe is missing required fields" }) };
    }

    const existing = await getRecipes(userId);
    if (existing.length >= MAX_RECIPES_PER_USER) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `You've reached the limit of ${MAX_RECIPES_PER_USER} personal recipes. Delete one before adding another.`,
        }),
      };
    }

    const now = Date.now();
    const saved = {
      id: (crypto.randomUUID && crypto.randomUUID()) || `recipe-${now}-${Math.random().toString(36).slice(2)}`,
      title: String(recipe.title).trim(),
      ingredients: String(recipe.ingredients).trim(),
      instructions: String(recipe.instructions).trim(),
      original_recipe_text: recipe.original_recipe_text ? String(recipe.original_recipe_text).trim() : null,
      substitution_note: recipe.substitution_note ? String(recipe.substitution_note).trim() : null,
      servings: recipe.servings || null,
      estimated_macros: recipe.estimated_macros || null,
      qualitative_macro_note: recipe.qualitative_macro_note || null,
      user_corrected: !!recipe.user_corrected,
      created_at: now,
    };

    const updated = existing.concat([saved]);
    await redis.set(recipesKey(userId), JSON.stringify(updated));

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipe: saved, recipes: updated }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
