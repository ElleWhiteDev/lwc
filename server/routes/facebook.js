import express from "express";
import { pool } from "../db.js";
import logger from "../utils/logger.js";

const router = express.Router();

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
let cache = { posts: null, fetchedAt: 0 };

async function getFacebookCredentials() {
  const result = await pool.query(
    "SELECT data FROM site_content WHERE slug = $1",
    ["siteConfig"],
  );
  const config = result.rows[0]?.data ?? {};
  return {
    pageId: config.facebookPageId,
    accessToken: config.facebookAccessToken,
  };
}

router.get("/posts", async (req, res) => {
  if (cache.posts && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return res.json({ posts: cache.posts });
  }

  let pageId, accessToken;
  try {
    ({ pageId, accessToken } = await getFacebookCredentials());
  } catch (error) {
    logger.error("Error reading Facebook credentials from DB", { error: error.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }

  if (!pageId || !accessToken) {
    return res.json({ posts: [] });
  }

  try {
    const url = `https://graph.facebook.com/v19.0/${encodeURIComponent(pageId)}/posts?fields=message,created_time,full_picture,permalink_url&limit=100&access_token=${accessToken}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.error) {
      logger.error("Facebook API error", { error: data.error });
      return res.status(502).json({ message: "Failed to fetch Facebook posts", posts: [] });
    }

    const posts = (data.data || []).filter((p) => p.message);
    cache = { posts, fetchedAt: Date.now() };
    return res.json({ posts });
  } catch (error) {
    logger.error("Error fetching Facebook posts", { error: error.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }
});

export default router;
