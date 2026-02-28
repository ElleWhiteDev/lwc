import express from "express";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../audit.js";
import logger from "../utils/logger.js";

const router = express.Router();

// Get all board members (public)
router.get("/board-members", async (req, res) => {
  try {
    const result = await pool.query(
      `
        SELECT id, name, title, image_url, display_order
        FROM board_members
        ORDER BY display_order ASC, created_at ASC
      `
    );

    return res.json({ boardMembers: result.rows });
  } catch (error) {
    logger.error("Error fetching board members", {
      error: error.message,
      stack: error.stack,
      endpoint: "GET /board-members",
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Create board member (requires auth)
router.post("/board-members", requireAuth, async (req, res) => {
  const { name, title, imageUrl, displayOrder } = req.body ?? {};

  if (!name || !title) {
    return res.status(400).json({ message: "Name and title are required" });
  }

  try {
    const insertResult = await pool.query(
      `
        INSERT INTO board_members (name, title, image_url, display_order)
        VALUES ($1, $2, $3, $4)
        RETURNING id, name, title, image_url, display_order, created_at, updated_at
      `,
      [name, title, imageUrl || null, displayOrder || 0]
    );

    const saved = insertResult.rows[0];

    await logAudit({
      userId: req.user.id,
      action: "create",
      entityType: "board_member",
      entityId: saved.id,
      previousData: null,
      newData: saved,
    });

    logger.info("Board member created successfully", {
      userId: req.user.id,
      boardMemberId: saved.id,
      name: saved.name,
      title: saved.title,
    });

    return res.status(201).json(saved);
  } catch (error) {
    logger.error("Error creating board member", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      endpoint: "POST /board-members",
      requestBody: { name, title, imageUrl, displayOrder },
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Batch update board member order (requires auth) - MUST come before /:id route
router.put("/board-members/reorder", requireAuth, async (req, res) => {
  const { updates } = req.body ?? {};

  if (!Array.isArray(updates) || updates.length === 0) {
    return res.status(400).json({ message: "Updates array is required" });
  }

  try {
    // Update each board member's display_order
    for (const update of updates) {
      const { id, displayOrder } = update;
      if (id && displayOrder !== undefined) {
        await pool.query(
          "UPDATE board_members SET display_order = $1, updated_at = NOW() WHERE id = $2",
          [displayOrder, id]
        );
      }
    }

    await logAudit({
      userId: req.user.id,
      action: "reorder",
      entityType: "board_member",
      entityId: null,
      previousData: null,
      newData: { updates },
    });

    logger.info("Board members reordered successfully", {
      userId: req.user.id,
      updateCount: updates.length,
      endpoint: "PUT /board-members/reorder",
    });

    return res.json({ message: "Board members reordered successfully" });
  } catch (error) {
    logger.error("Error reordering board members", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      endpoint: "PUT /board-members/reorder",
      updateCount: updates.length,
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update board member (requires auth)
router.put("/board-members/:id", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { name, title, imageUrl, displayOrder } = req.body ?? {};

  try {
    const existingResult = await pool.query(
      "SELECT * FROM board_members WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Board member not found" });
    }

    const existing = existingResult.rows[0];

    const updateResult = await pool.query(
      `
        UPDATE board_members
        SET
          name = $1,
          title = $2,
          image_url = $3,
          display_order = $4,
          updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, title, image_url, display_order, created_at, updated_at
      `,
      [
        name ?? existing.name,
        title ?? existing.title,
        imageUrl !== undefined ? imageUrl : existing.image_url,
        displayOrder !== undefined ? displayOrder : existing.display_order,
        id,
      ]
    );

    const saved = updateResult.rows[0];

    await logAudit({
      userId: req.user.id,
      action: "update",
      entityType: "board_member",
      entityId: saved.id,
      previousData: existing,
      newData: saved,
    });

    logger.info("Board member updated successfully", {
      userId: req.user.id,
      boardMemberId: saved.id,
      name: saved.name,
      title: saved.title,
    });

    return res.json(saved);
  } catch (error) {
    logger.error("Error updating board member", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      boardMemberId: id,
      endpoint: "PUT /board-members/:id",
      requestBody: { name, title, imageUrl, displayOrder },
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete board member (requires auth)
router.delete("/board-members/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const existingResult = await pool.query(
      "SELECT * FROM board_members WHERE id = $1",
      [id]
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "Board member not found" });
    }

    const existing = existingResult.rows[0];

    await pool.query("DELETE FROM board_members WHERE id = $1", [id]);

    await logAudit({
      userId: req.user.id,
      action: "delete",
      entityType: "board_member",
      entityId: existing.id,
      previousData: existing,
      newData: null,
    });

    logger.info("Board member deleted successfully", {
      userId: req.user.id,
      boardMemberId: existing.id,
      name: existing.name,
      title: existing.title,
    });

    return res.status(204).end();
  } catch (error) {
    logger.error("Error deleting board member", {
      error: error.message,
      stack: error.stack,
      userId: req.user.id,
      boardMemberId: id,
      endpoint: "DELETE /board-members/:id",
    });
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
