import express from "express";
import { pool } from "../db.js";
import logger from "../utils/logger.js";

const router = express.Router();

const CACHE_TTL = 5 * 60 * 1000;
let cache = { posts: null, fetchedAt: 0 };

async function getCredentials() {
  const result = await pool.query(
    "SELECT data FROM site_content WHERE slug = $1",
    ["siteConfig"],
  );
  const config = result.rows[0]?.data ?? {};
  return {
    username: config.xUsername,
    bearerToken: config.xBearerToken,
  };
}

router.get("/posts", async (req, res) => {
  if (cache.posts && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return res.json({ posts: cache.posts });
  }

  let username, bearerToken;
  try {
    ({ username, bearerToken } = await getCredentials());
  } catch (error) {
    logger.error("Error reading X credentials from DB", { error: error.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }

  if (!username || !bearerToken) {
    return res.json({ posts: [] });
  }

  try {
    // First resolve the username to a numeric user ID
    const userRes = await fetch(
      `https://api.twitter.com/2/users/by/username/${encodeURIComponent(username)}`,
      { headers: { Authorization: `Bearer ${bearerToken}` } },
    );
    const userData = await userRes.json();

    if (userData.errors || !userData.data?.id) {
      logger.error("X API user lookup error", { errors: userData.errors });
      return res.status(502).json({ message: "Failed to look up X user", posts: [] });
    }

    const userId = userData.data.id;

    const tweetsRes = await fetch(
      `https://api.twitter.com/2/users/${userId}/tweets?max_results=100&tweet.fields=created_at,text&expansions=attachments.media_keys&media.fields=url,preview_image_url&exclude=retweets,replies`,
      { headers: { Authorization: `Bearer ${bearerToken}` } },
    );
    const tweetsData = await tweetsRes.json();

    if (tweetsData.errors && !tweetsData.data) {
      logger.error("X API tweets error", { errors: tweetsData.errors });
      return res.status(502).json({ message: "Failed to fetch X posts", posts: [] });
    }

    // Build a media lookup map
    const mediaMap = {};
    for (const m of tweetsData.includes?.media ?? []) {
      mediaMap[m.media_key] = m;
    }

    const posts = (tweetsData.data || []).map((tweet) => {
      const mediaKey = tweet.attachments?.media_keys?.[0];
      const media = mediaKey ? mediaMap[mediaKey] : null;
      return {
        id: tweet.id,
        text: tweet.text,
        created_at: tweet.created_at,
        media_url: media?.url || media?.preview_image_url || null,
        permalink_url: `https://x.com/${username}/status/${tweet.id}`,
      };
    });

    cache = { posts, fetchedAt: Date.now() };
    return res.json({ posts });
  } catch (error) {
    logger.error("Error fetching X posts", { error: error.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }
});

export default router;
