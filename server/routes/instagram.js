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
    userId: config.instagramUserId,
    accessToken: config.instagramAccessToken,
  };
}

router.get("/posts", async (req, res) => {
  if (cache.posts && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return res.json({ posts: cache.posts });
  }

  let userId, accessToken;
  try {
    ({ userId, accessToken } = await getCredentials());
  } catch (error) {
    logger.error("Error reading Instagram credentials from DB", { error: error.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }

  if (!userId || !accessToken) {
    return res.json({ posts: [] });
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(userId)}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&limit=100&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      logger.error("Instagram API error", { error: data.error });
      return res.status(502).json({ message: "Failed to fetch Instagram posts", posts: [] });
    }

    const posts = (data.data || []).filter((p) => p.caption);
    cache = { posts, fetchedAt: Date.now() };
    return res.json({ posts });
  } catch (error) {
    logger.error("Error fetching Instagram posts", { error: error.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }
});

export default router;
