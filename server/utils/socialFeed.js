import express from "express";
import { pool } from "../db.js";
import logger from "./logger.js";

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export async function getSiteConfig() {
  const result = await pool.query(
    "SELECT data FROM site_content WHERE slug = $1",
    ["siteConfig"],
  );
  return result.rows[0]?.data ?? {};
}

/**
 * Builds a router exposing GET /posts for a social feed.
 * - credentials(config) returns the values needed to fetch, or null when not configured
 * - fetchPosts(...credentials) returns the posts array, throwing on API failure
 * Results are cached per credential set, concurrent misses share one upstream request,
 * and the last good result is served if the upstream API fails.
 */
export function createFeedRouter({ name, credentials, fetchPosts }) {
  const router = express.Router();
  let cache = { key: null, posts: null, fetchedAt: 0 };
  let inflight = null;

  router.get("/posts", async (req, res) => {
    let creds;
    try {
      creds = credentials(await getSiteConfig());
    } catch (error) {
      logger.error(`Error reading ${name} credentials from DB`, { error: error.message });
      return res.status(500).json({ message: "Internal server error", posts: [] });
    }

    if (!creds) {
      return res.json({ posts: [] });
    }

    const key = creds.join("\0");
    const cached = cache.key === key ? cache.posts : null;

    if (cached && Date.now() - cache.fetchedAt < CACHE_TTL) {
      return res.json({ posts: cached });
    }

    try {
      if (inflight?.key !== key) {
        const promise = fetchPosts(...creds).finally(() => {
          if (inflight?.promise === promise) inflight = null;
        });
        inflight = { key, promise };
      }
      const posts = await inflight.promise;
      cache = { key, posts, fetchedAt: Date.now() };
      return res.json({ posts });
    } catch (error) {
      logger.error(`${name} API error`, {
        error: error.message,
        code: error.code,
        subcode: error.subcode,
        servingStale: Boolean(cached),
      });
      if (cached) return res.json({ posts: cached });
      return res.status(502).json({ message: `Failed to fetch ${name} posts`, posts: [] });
    }
  });

  return router;
}
