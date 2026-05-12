import express from "express";
import crypto from "crypto";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import logger from "../utils/logger.js";

const router = express.Router();

const CACHE_TTL = 5 * 60 * 1000;
let cache = { posts: null, fetchedAt: 0 };

const TIKTOK_AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TIKTOK_TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const TIKTOK_VIDEO_URL = "https://open.tiktokapis.com/v2/video/list/";

async function getConfig() {
  const result = await pool.query(
    "SELECT data FROM site_content WHERE slug = $1",
    ["siteConfig"],
  );
  return result.rows[0]?.data ?? {};
}

async function patchConfig(patch) {
  await pool.query(
    `UPDATE site_content
     SET data = COALESCE(data, '{}'::jsonb) || $1::jsonb, updated_at = NOW()
     WHERE slug = 'siteConfig'`,
    [JSON.stringify(patch)],
  );
}

async function refreshAccessToken(clientKey, clientSecret, refreshToken) {
  const body = new URLSearchParams({
    client_key: clientKey,
    client_secret: clientSecret,
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
  const res = await fetch(TIKTOK_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  const data = await res.json();
  if (data.error?.code && data.error.code !== "ok") {
    throw new Error(data.error.message ?? "Token refresh failed");
  }
  return {
    accessToken: data.data.access_token,
    refreshToken: data.data.refresh_token ?? refreshToken,
  };
}

// Initiate OAuth (admin only — browser navigates here directly so cookie is sent)
router.get("/auth", requireAuth, async (req, res) => {
  try {
    const config = await getConfig();
    if (!config.tiktokClientKey) {
      return res.status(400).send(
        "TikTok Client Key not configured. Go back to Admin > Settings > Social Media and save your credentials first.",
      );
    }

    const state = crypto.randomBytes(16).toString("hex");
    await patchConfig({ tiktokOAuthState: state });

    const redirectUri = `${req.protocol}://${req.get("host")}/api/tiktok/callback`;

    const params = new URLSearchParams({
      client_key: config.tiktokClientKey,
      scope: "video.list",
      response_type: "code",
      redirect_uri: redirectUri,
      state,
    });

    return res.redirect(`${TIKTOK_AUTH_URL}?${params}`);
  } catch (err) {
    logger.error("TikTok auth init error", { error: err.message });
    return res.status(500).send("Internal server error");
  }
});

// OAuth callback — TikTok redirects here after user authorizes
router.get("/callback", async (req, res) => {
  const { code, state, error } = req.query;
  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (error) {
    logger.warn("TikTok OAuth denied by user", { error });
    return res.redirect(`${frontendUrl}/admin`);
  }

  try {
    const config = await getConfig();

    if (!state || state !== config.tiktokOAuthState) {
      logger.warn("TikTok OAuth state mismatch");
      return res.redirect(`${frontendUrl}/admin`);
    }

    const redirectUri = `${req.protocol}://${req.get("host")}/api/tiktok/callback`;

    const body = new URLSearchParams({
      client_key: config.tiktokClientKey,
      client_secret: config.tiktokClientSecret,
      code,
      grant_type: "authorization_code",
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch(TIKTOK_TOKEN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
    });
    const tokenData = await tokenRes.json();

    if (tokenData.error?.code && tokenData.error.code !== "ok") {
      logger.error("TikTok token exchange failed", { error: tokenData.error });
      return res.redirect(`${frontendUrl}/admin`);
    }

    await patchConfig({
      tiktokAccessToken: tokenData.data.access_token,
      tiktokRefreshToken: tokenData.data.refresh_token,
      tiktokOAuthState: null,
    });

    cache = { posts: null, fetchedAt: 0 };
    return res.redirect(`${frontendUrl}/admin`);
  } catch (err) {
    logger.error("TikTok callback error", { error: err.message });
    return res.redirect(`${frontendUrl}/admin`);
  }
});

router.get("/posts", async (req, res) => {
  if (cache.posts && Date.now() - cache.fetchedAt < CACHE_TTL) {
    return res.json({ posts: cache.posts });
  }

  let config;
  try {
    config = await getConfig();
  } catch (err) {
    logger.error("Error reading TikTok credentials", { error: err.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }

  if (!config.tiktokAccessToken) {
    return res.json({ posts: [] });
  }

  async function fetchVideos(token) {
    const r = await fetch(
      `${TIKTOK_VIDEO_URL}?fields=id,title,video_description,create_time,share_url,cover_image_url`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json; charset=UTF-8",
        },
        body: JSON.stringify({ max_count: 20 }),
      },
    );
    return r.json();
  }

  try {
    let data = await fetchVideos(config.tiktokAccessToken);

    if (
      data.error?.code === "access_token_invalid" &&
      config.tiktokRefreshToken &&
      config.tiktokClientKey &&
      config.tiktokClientSecret
    ) {
      const { accessToken, refreshToken } = await refreshAccessToken(
        config.tiktokClientKey,
        config.tiktokClientSecret,
        config.tiktokRefreshToken,
      );
      await patchConfig({ tiktokAccessToken: accessToken, tiktokRefreshToken: refreshToken });
      data = await fetchVideos(accessToken);
    }

    if (data.error?.code && data.error.code !== "ok") {
      logger.error("TikTok API error", { error: data.error });
      return res.status(502).json({ message: "Failed to fetch TikTok videos", posts: [] });
    }

    const posts = (data.data?.videos || []).filter((v) => v.video_description || v.title);
    cache = { posts, fetchedAt: Date.now() };
    return res.json({ posts });
  } catch (err) {
    logger.error("Error fetching TikTok posts", { error: err.message });
    return res.status(500).json({ message: "Internal server error", posts: [] });
  }
});

export default router;
