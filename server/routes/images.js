import express from "express";
import multer from "multer";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3.js";
import { logAudit } from "../audit.js";

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"));
    }
  },
});

// Upload images for an event
router.post("/events/:id/images", requireAuth, upload.array("images", 10), async (req, res) => {
  const { id } = req.params;
  const files = req.files;

  if (!files || files.length === 0) {
    return res.status(400).json({ message: "No files uploaded" });
  }

  try {
    // Verify event exists
    const eventResult = await pool.query("SELECT id FROM events WHERE id = $1", [id]);
    if (eventResult.rows.length === 0) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Get current max display_order
    const maxOrderResult = await pool.query(
      "SELECT COALESCE(MAX(display_order), -1) as max_order FROM event_images WHERE event_id = $1",
      [id]
    );
    let currentOrder = maxOrderResult.rows[0].max_order;

    // Upload each file to S3 and save to database
    const uploadedImages = [];
    for (const file of files) {
      currentOrder++;

      // Upload to S3
      const imageUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype, id);

      // Save to database
      const insertResult = await pool.query(
        `INSERT INTO event_images (event_id, image_url, display_order)
         VALUES ($1, $2, $3)
         RETURNING id, event_id, image_url, display_order, created_at`,
        [id, imageUrl, currentOrder]
      );

      uploadedImages.push(insertResult.rows[0]);
    }

    await logAudit({
      userId: req.user.id,
      action: "create",
      entityType: "event_images",
      entityId: parseInt(id),
      previousData: null,
      newData: { count: uploadedImages.length, images: uploadedImages },
    });

    return res.status(201).json({ images: uploadedImages });
  } catch (error) {
    console.error("Error uploading images", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get images for an event
router.get("/events/:id/images", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(
      `SELECT id, event_id, image_url, display_order, created_at
       FROM event_images
       WHERE event_id = $1
       ORDER BY display_order ASC`,
      [id]
    );

    return res.json({ images: result.rows });
  } catch (error) {
    console.error("Error fetching images", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Delete an image
router.delete("/events/:eventId/images/:imageId", requireAuth, async (req, res) => {
  const { eventId, imageId } = req.params;

  try {
    // Get the image record
    const imageResult = await pool.query(
      "SELECT * FROM event_images WHERE id = $1 AND event_id = $2",
      [imageId, eventId]
    );

    if (imageResult.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    const image = imageResult.rows[0];

    // Delete from S3
    await deleteFromS3(image.image_url);

    // Delete from database
    await pool.query("DELETE FROM event_images WHERE id = $1", [imageId]);

    await logAudit({
      userId: req.user.id,
      action: "delete",
      entityType: "event_image",
      entityId: parseInt(imageId),
      previousData: image,
      newData: null,
    });

    return res.status(204).end();
  } catch (error) {
    console.error("Error deleting image", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Reorder images
router.put("/events/:id/images/reorder", requireAuth, async (req, res) => {
  const { id } = req.params;
  const { imageIds } = req.body; // Array of image IDs in new order

  if (!Array.isArray(imageIds)) {
    return res.status(400).json({ message: "imageIds must be an array" });
  }

  try {
    // Update display_order for each image
    for (let i = 0; i < imageIds.length; i++) {
      await pool.query(
        "UPDATE event_images SET display_order = $1 WHERE id = $2 AND event_id = $3",
        [i, imageIds[i], id]
      );
    }

    await logAudit({
      userId: req.user.id,
      action: "reorder",
      entityType: "event_images",
      entityId: parseInt(id),
      previousData: null,
      newData: { imageIds },
    });

    return res.json({ message: "Images reordered successfully" });
  } catch (error) {
    console.error("Error reordering images", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Upload image for a board member
router.post("/board-member-image", requireAuth, upload.single("image"), async (req, res) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  try {
    // Upload to S3 with a unique identifier for board members
    const imageUrl = await uploadToS3(file.buffer, file.originalname, file.mimetype, "board-member");

    await logAudit({
      userId: req.user.id,
      action: "upload",
      entityType: "board_member_image",
      entityId: null,
      previousData: null,
      newData: { imageUrl },
    });

    return res.status(201).json({ imageUrl });
  } catch (error) {
    console.error("Error uploading board member image", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
