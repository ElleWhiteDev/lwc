import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../audit.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Public: get all overrides (used by home page to filter/sort)
router.get("/overrides", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM news_post_overrides");
    return res.json({ overrides: result.rows });
  } catch (err) {
    logger.error("Error fetching news overrides", { error: err.message });
    return res.status(500).json({ message: "Internal server error", overrides: [] });
  }
});

// Admin: bulk reorder — MUST be before /:postId to avoid route conflict
router.put("/admin/reorder", requireAuth, async (req, res) => {
  const { updates } = req.body ?? {};
  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Updates array is required" });
  }

  try {
    for (const { postId, source, displayOrder } of updates) {
      await pool.query(
        `INSERT INTO news_post_overrides (post_id, source, display_order, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (post_id) DO UPDATE SET
           display_order = $3,
           updated_at = NOW()`,
        [postId, source ?? "unknown", displayOrder],
      );
    }

    await logAudit({
      userId: req.user.id,
      action: "reorder",
      entityType: "news_post",
      entitySlug: "bulk",
      previousData: null,
      newData: { updates },
    });

    logger.info("News posts reordered", { userId: req.user.id, count: updates.length });
    return res.json({ message: "Reordered successfully" });
  } catch (err) {
    logger.error("Error reordering news posts", { error: err.message });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Admin: upsert override for a single post (toggle published, etc.)
router.put("/admin/:postId", requireAuth, async (req, res) => {
  const { postId } = req.params;
  const { source, isPublished, displayOrder } = req.body ?? {};

  try {
    const existing = await pool.query(
      "SELECT * FROM news_post_overrides WHERE post_id = $1",
      [postId],
    );
    const previous = existing.rows[0] ?? null;

    const result = await pool.query(
      `INSERT INTO news_post_overrides (post_id, source, is_published, display_order, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (post_id) DO UPDATE SET
         is_published = COALESCE($3, news_post_overrides.is_published),
         display_order = COALESCE($4, news_post_overrides.display_order),
         updated_at = NOW()
       RETURNING *`,
      [postId, source ?? "unknown", isPublished ?? null, displayOrder ?? null],
    );
    const saved = result.rows[0];

    let action = "update";
    if (isPublished === true) action = "publish";
    else if (isPublished === false) action = "unpublish";

    await logAudit({
      userId: req.user.id,
      action,
      entityType: "news_post",
      entitySlug: postId,
      previousData: previous,
      newData: saved,
    });

    logger.info("News post override updated", { userId: req.user.id, postId, action });
    return res.json(saved);
  } catch (err) {
    logger.error("Error updating news override", { error: err.message, postId });
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
