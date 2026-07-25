const { getStore, connectLambda } = require("@netlify/blobs");
const crypto = require("crypto");

// Private, device-scoped progress photo timeline (My Stuff > My Goals). Full-
// size image bytes live as individual blobs (never returned in bulk, only
// fetched one at a time for the side-by-side comparison view); the gallery
// itself renders from a small per-device index blob that carries a
// pre-generated thumbnail (resized client-side, see resizeImageForUpload in
// index.html) inline as a data URL, so listing photos never has to fetch N
// full-size blobs just to render thumbnails.
const STORE_NAME = "progress-photos";

// Flat per-user cap, same style as user-recipes.js's MAX_RECIPES_PER_USER --
// guards against runaway/accidental spamming, not genuine daily usage.
const MAX_PHOTOS_PER_USER = 200;

// Client-side resizing (see resizeImageForUpload) keeps real uploads well
// under this; it's a backstop against a request that skipped that step.
const MAX_PHOTO_BYTES = 6 * 1024 * 1024;

function indexKey(userId) {
  return `${userId}/index.json`;
}

function photoKey(userId, photoId) {
  return `${userId}/${photoId}`;
}

async function getIndex(store, userId) {
  const index = await store.get(indexKey(userId), { type: "json" });
  return Array.isArray(index) ? index : [];
}

exports.handler = async function (event) {
  connectLambda(event);
  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    const params = event.queryStringParameters || {};
    const userId = params.deviceId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }

    // Fetch one full-size photo's bytes, for the side-by-side comparison
    // view -- only ever called for a photo the user has explicitly selected,
    // never for rendering the gallery itself.
    if (params.photoId) {
      const meta = await store.getWithMetadata(photoKey(userId, params.photoId), { type: "arrayBuffer" });
      if (!meta || !meta.data) {
        return { statusCode: 404, body: JSON.stringify({ error: "Photo not found" }) };
      }
      const contentType = (meta.metadata && meta.metadata.contentType) || "image/jpeg";
      const base64 = Buffer.from(meta.data).toString("base64");
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl: `data:${contentType};base64,${base64}` }),
      };
    }

    const photos = await getIndex(store, userId);
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photos }),
    };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const body = JSON.parse(event.body);
    const userId = body.deviceId;
    if (!userId) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing deviceId" }) };
    }

    if (body.action === "delete") {
      if (!body.id) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing id" }) };
      }
      const existing = await getIndex(store, userId);
      const filtered = existing.filter((p) => p.id !== body.id);
      if (filtered.length !== existing.length) {
        await store.delete(photoKey(userId, body.id));
        await store.setJSON(indexKey(userId), filtered);
      }
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ photos: filtered }),
      };
    }

    // Default action: upload. display_base64 is the resized "full" image
    // (no EXIF-orientation surprises or multi-megabyte phone originals,
    // thanks to the client-side canvas resize); thumbnail_data_url is a
    // separate, much smaller resize stored inline in the index for instant
    // gallery rendering.
    const { date, caption, content_type: contentType, display_base64: displayBase64, thumbnail_data_url: thumbnailDataUrl } = body;
    if (!date) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing date" }) };
    }
    if (!displayBase64 || !contentType || !thumbnailDataUrl) {
      return { statusCode: 400, body: JSON.stringify({ error: "Missing photo data" }) };
    }

    const existing = await getIndex(store, userId);
    if (existing.length >= MAX_PHOTOS_PER_USER) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `You've reached the limit of ${MAX_PHOTOS_PER_USER} progress photos. Delete one before adding another.`,
        }),
      };
    }

    const buffer = Buffer.from(displayBase64, "base64");
    if (buffer.length > MAX_PHOTO_BYTES) {
      return { statusCode: 400, body: JSON.stringify({ error: "That photo is too large. Please try a smaller image." }) };
    }

    const id = (crypto.randomUUID && crypto.randomUUID()) || `photo-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    await store.set(photoKey(userId, id), buffer, { metadata: { contentType } });

    const entry = {
      id,
      date: String(date),
      caption: caption ? String(caption).trim() : null,
      thumbnail_data_url: thumbnailDataUrl,
      content_type: contentType,
      created_at: Date.now(),
    };
    const updated = existing.concat([entry]);
    await store.setJSON(indexKey(userId), updated);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ photo: entry, photos: updated }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
