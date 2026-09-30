import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../audit.js";
import logger from "../utils/logger.js";

const CREDENTIAL_FIELDS = new Set([
  "facebookPageId", "facebookAccessToken",
  "instagramUserId", "instagramAccessToken",
  "xUsername", "xBearerToken",
  "tiktokClientKey", "tiktokClientSecret",
]);

const SENSITIVE_FIELDS = new Set([
  "facebookAccessToken", "instagramAccessToken", "xBearerToken",
  "tiktokClientSecret", "tiktokAccessToken", "tiktokRefreshToken", "tiktokOAuthState",
]);

const REDACTED = "[REDACTED]";

function redactSecrets(slug, data) {
  if (slug !== "siteConfig" || !data || typeof data !== "object") return data;
  const out = { ...data };
  for (const field of SENSITIVE_FIELDS) {
    if (out[field]) out[field] = REDACTED;
  }
  return out;
}

// The admin form echoes back the redacted placeholder for secrets it never saw; keep the stored value
function dropRedactedPlaceholders(slug, data) {
  if (slug !== "siteConfig") return data;
  return Object.fromEntries(
    Object.entries(data).filter(([k, v]) => !(SENSITIVE_FIELDS.has(k) && v === REDACTED)),
  );
}

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

    const row = result.rows[0];
    return res.json({ ...row, data: redactSecrets(slug, row.data) });
  } catch (error) {
    logger.error("Error fetching content", { slug, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/:slug", requireAuth, async (req, res) => {
  const { slug } = req.params;
  const { data: rawData } = req.body ?? {};

  if (rawData == null || typeof rawData !== "object") {
    return res
      .status(400)
      .json({ message: "Request body must include a data object" });
  }

  const data = dropRedactedPlaceholders(slug, rawData);

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
          SET data = COALESCE(data, '{}'::jsonb) || $1::jsonb, updated_at = NOW()
          WHERE id = $2
          RETURNING id, slug, data, updated_at
        `,
        [JSON.stringify(data), existing.id],
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

    const isCredentialUpdate =
      slug === "siteConfig" && Object.keys(data).some((k) => CREDENTIAL_FIELDS.has(k));
    let auditAction;
    if (isCredentialUpdate) {
      auditAction = "update_social_credentials";
    } else {
      auditAction = existing ? "update" : "create";
    }

    const auditPrev = redactSecrets(slug, existing?.data ?? null);
    const auditNew = redactSecrets(slug, saved.data);

    await logAudit({
      userId: req.user.id,
      action: auditAction,
      entityType: "site_content",
      entityId: saved.id,
      entitySlug: slug,
      previousData: auditPrev,
      newData: auditNew,
    });

    if (slug === "resources") {
      const prevLinks = existing?.data?.links ?? [];
      const newLinks = saved.data?.links ?? [];
      const prevIds = new Set(prevLinks.map((l) => l.id));
      const newIds = new Set(newLinks.map((l) => l.id));

      const added = newLinks.filter((l) => !prevIds.has(l.id));
      const removed = prevLinks.filter((l) => !newIds.has(l.id));

      await Promise.all([
        ...added.map((link) =>
          logAudit({
            userId: req.user.id,
            action: "add_resource_link",
            entityType: "site_content",
            entityId: saved.id,
            entitySlug: slug,
            previousData: null,
            newData: link,
          })
        ),
        ...removed.map((link) =>
          logAudit({
            userId: req.user.id,
            action: "remove_resource_link",
            entityType: "site_content",
            entityId: saved.id,
            entitySlug: slug,
            previousData: link,
            newData: null,
          })
        ),
      ]);
    }

    logger.info(`Content ${existing ? 'updated' : 'created'}`, {
      userId: req.user.id,
      slug,
      action: existing ? "update" : "create"
    });

    return res.json({ ...saved, data: auditNew });
  } catch (error) {
    logger.error("Error saving content", { slug, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
