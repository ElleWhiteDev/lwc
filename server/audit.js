import { pool } from "./db.js";

async function logAudit({
  userId,
  action,
  entityType,
  entityId = null,
  entitySlug = null,
  previousData = null,
  newData = null,
}) {
  await pool.query(
    `
      INSERT INTO audit_logs (
        user_id,
        action,
        entity_type,
        entity_id,
        entity_slug,
        previous_data,
        new_data
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [userId, action, entityType, entityId, entitySlug, previousData, newData],
  );
}

export { logAudit };
