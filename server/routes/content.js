import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../audit.js";

const router = express.Router();

router.get("/:slug", async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query(
      "SELECT id, slug, data, updated_at FROM site_content WHERE slug = $1",
      [slug],
    );

    if (result.rows.length === 0) {
      return res.json({ slug, data: null });
    }

    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching content", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:slug", requireAuth, async (req, res) => {
  const { slug } = req.params;
  const { data } = req.body ?? {};

  if (data == null || typeof data !== "object") {
    return res
      .status(400)
      .json({ message: "Request body must include a data object" });
  }

  try {
    const existingResult = await pool.query(
      "SELECT id, data FROM site_content WHERE slug = $1",
      [slug],
    );

    const existing = existingResult.rows[0] ?? null;

    let saved;

    if (existing) {
      const updateResult = await pool.query(
        `
          UPDATE site_content
          SET data = $1, updated_at = NOW()
          WHERE id = $2
          RETURNING id, slug, data, updated_at
        `,
        [data, existing.id],
      );
      saved = updateResult.rows[0];
    } else {
      const insertResult = await pool.query(
        `
          INSERT INTO site_content (slug, data)
          VALUES ($1, $2)
          RETURNING id, slug, data, updated_at
        `,
        [slug, data],
      );
      saved = insertResult.rows[0];
    }

    await logAudit({
      userId: req.user.id,
      action: existing ? "update" : "create",
      entityType: "site_content",
      entityId: saved.id,
      entitySlug: slug,
      previousData: existing?.data ?? null,
      newData: saved.data,
    });

    return res.json(saved);
  } catch (error) {
    console.error("Error saving content", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
