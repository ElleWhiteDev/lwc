import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../audit.js";
import { deleteFromS3 } from "../utils/s3.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.get("/events", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          date,
          time,
          location,
          description,
          link,
          image_url,
          is_published,
          updated_at,
          display_order
        FROM events
        WHERE is_published = TRUE
        ORDER BY display_order ASC, updated_at DESC
      `,
    );

    // Fetch images for each event
    const events = result.rows;
    for (const event of events) {
      const imagesResult = await pool.query(
        `SELECT id, image_url, display_order
         FROM event_images
         WHERE event_id = $1
         ORDER BY display_order ASC`,
        [event.id]
      );
      event.images = imagesResult.rows;
    }

    return res.json({ events });
  } catch (error) {
    logger.error("Error fetching events", {
      error: error.message,
      stack: error.stack,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/admin/events", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT
          id,
          title,
          date,
          time,
          location,
          description,
          link,
          image_url,
          is_published,
          updated_at,
          display_order
        FROM events
        ORDER BY display_order ASC, updated_at DESC
      `,
    );

    // Fetch images for each event
    const events = result.rows;
    for (const event of events) {
      const imagesResult = await pool.query(
        `SELECT id, image_url, display_order
         FROM event_images
         WHERE event_id = $1
         ORDER BY display_order ASC`,
        [event.id]
      );
      event.images = imagesResult.rows;
    }

    return res.json({ events });
  } catch (error) {
    logger.error("Error fetching admin events", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/events", requireAuth, async (req, res) => {
  const {
    title,
    date,
    time,
    location,
    description,
    link,
    imageUrl,
    isPublished = true,
    displayOrder = 0,
  } = req.body ?? {};

  if (!title) {
    return res.status(400).json({ message: "Title is required" });
  }

  try {
    const insertResult = await pool.query(
      `
        INSERT INTO events (
          title,
          date,
          time,
          location,
          description,
          link,
          image_url,
          is_published,
          display_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          title,
          date,
          time,
          location,
          description,
          link,
          image_url,
          is_published,
          display_order,
          updated_at
      `,
      [
        title,
        date ?? null,
        time ?? null,
        location ?? null,
        description ?? null,
        link ?? null,
        imageUrl ?? null,
        isPublished,
        displayOrder,
      ],
    );

    const saved = insertResult.rows[0];

    await logAudit({
      userId: req.user.id,
      action: "create",
      entityType: "event",
      entityId: saved.id,
      previousData: null,
      newData: saved,
    });

    logger.info("Event created successfully", {
      userId: req.user.id,
      eventId: saved.id,
      title: saved.title,
    });

    return res.status(201).json(saved);
  } catch (error) {
    logger.error("Error creating event", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      title,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Batch update event order (requires auth) - MUST come before /:id route
router.put("/events/reorder", requireAuth, async (req, res) => {
  const { updates } = req.body ?? {};

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Updates array is required" });
  }

  try {
    // Update each event's display_order
    for (const update of updates) {
      const { id, displayOrder } = update;
      if (id && displayOrder !== undefined) {
        await pool.query(
          "UPDATE events SET display_order = $1, updated_at = NOW() WHERE id = $2",
          [displayOrder, id]
        );
      }
    }

    await logAudit({
      userId: req.user.id,
      action: "reorder",
      entityType: "event",
      entityId: null,
      previousData: null,
      newData: { updates },
    });

    logger.info("Events reordered successfully", {
      userId: req.user.id,
      updateCount: updates.length,
    });

    return res.json({ message: "Events reordered successfully" });
  } catch (error) {
    logger.error("Error reordering events", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      updateCount: updates?.length,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/events/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const {
    title,
    date,
    time,
    location,
    description,
    link,
    imageUrl,
    isPublished,
    displayOrder,
  } = req.body ?? {};

  try {
    const existingResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existing = existingResult.rows[0];

    const updateResult = await pool.query(
      `
        UPDATE events
        SET
          title = $1,
          date = $2,
          time = $3,
          location = $4,
          description = $5,
          link = $6,
          image_url = $7,
          is_published = $8,
          display_order = $9,
          updated_at = NOW()
        WHERE id = $10
        RETURNING
          id,
          title,
          date,
          time,
          location,
          description,
          link,
          image_url,
          is_published,
          display_order,
          updated_at
      `,
      [
        title ?? existing.title,
        date ?? existing.date,
        time ?? existing.time,
        location ?? existing.location,
        description ?? existing.description,
        link ?? existing.link,
        imageUrl ?? existing.image_url,
        isPublished ?? existing.is_published,
        displayOrder ?? existing.display_order,
        id,
      ],
    );

    const saved = updateResult.rows[0];

    // Determine the action type based on what changed
    let action = "update";
    if (isPublished !== undefined && isPublished !== existing.is_published) {
      action = isPublished ? "publish" : "unpublish";
    }

    await logAudit({
      userId: req.user.id,
      action,
      entityType: "event",
      entityId: saved.id,
      previousData: existing,
      newData: saved,
    });

    logger.info("Event updated successfully", {
      userId: req.user.id,
      eventId: saved.id,
      action,
      title: saved.title,
    });

    return res.json(saved);
  } catch (error) {
    logger.error("Error updating event", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      eventId: id,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/events/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existingResult = await pool.query("SELECT * FROM events WHERE id = $1", [
      id,
    ]);

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    const existing = existingResult.rows[0];

    // Get all images for this event
    const imagesResult = await pool.query(
      "SELECT image_url FROM event_images WHERE event_id = $1",
      [id]
    );

    // Delete all images from S3
    for (const image of imagesResult.rows) {
      try {
        await deleteFromS3(image.image_url);
      } catch (error) {
        logger.error("Error deleting image from S3", {
          error: error.message,
          stack: error.stack,
          userId: req.user?.id,
          eventId: id,
          imageUrl: image.image_url,
        });
        // Continue deleting other images even if one fails
      }
    }

    // Delete event (cascade will delete event_images records)
    await pool.query("DELETE FROM events WHERE id = $1", [id]);

    await logAudit({
      userId: req.user.id,
      action: "delete",
      entityType: "event",
      entityId: existing.id,
      previousData: existing,
      newData: null,
    });

    logger.info("Event deleted successfully", {
      userId: req.user.id,
      eventId: existing.id,
      title: existing.title,
    });

    return res.status(204).end();
  } catch (error) {
    logger.error("Error deleting event", {
      error: error.message,
      stack: error.stack,
      userId: req.user?.id,
      eventId: id,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
