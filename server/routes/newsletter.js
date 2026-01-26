import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { logAudit } from "../audit.js";
import { sendEmail } from "../utils/email.js";

const router = express.Router();

// Get all newsletter subscribers (admin only)
router.get("/subscribers", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, name, status, subscribed_at, unsubscribed_at, created_at
       FROM newsletter_subscribers
       ORDER BY subscribed_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching subscribers:", error);
    res.status(500).json({ message: "Failed to fetch subscribers" });
  }
});

// Add a new subscriber (admin only)
router.post("/subscribers", requireAdmin, async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Check if subscriber already exists
    const existing = await pool.query(
      "SELECT id, status FROM newsletter_subscribers WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      // If they exist but are unsubscribed, reactivate them
      if (existing.rows[0].status === "unsubscribed") {
        const result = await pool.query(
          `UPDATE newsletter_subscribers
           SET status = 'active', subscribed_at = NOW(), unsubscribed_at = NULL
           WHERE email = $1
           RETURNING id, email, name, status, subscribed_at, created_at`,
          [email]
        );

        await logAudit(
          req.user.id,
          "resubscribe",
          "newsletter_subscriber",
          result.rows[0].id,
          null,
          { status: "unsubscribed" },
          { status: "active", email, name }
        );

        return res.json(result.rows[0]);
      }

      return res.status(400).json({ message: "Email already subscribed" });
    }

    // Add new subscriber
    const result = await pool.query(
      `INSERT INTO newsletter_subscribers (email, name, status)
       VALUES ($1, $2, 'active')
       RETURNING id, email, name, status, subscribed_at, created_at`,
      [email, name || null]
    );

    await logAudit(
      req.user.id,
      "create",
      "newsletter_subscriber",
      result.rows[0].id,
      null,
      null,
      { email, name }
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Error adding subscriber:", error);
    res.status(500).json({ message: "Failed to add subscriber" });
  }
});

// Update subscriber (admin only)
router.put("/subscribers/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { email, name, status } = req.body;

    // Get current subscriber data for audit log
    const current = await pool.query(
      "SELECT * FROM newsletter_subscribers WHERE id = $1",
      [id]
    );

    if (current.rows.length === 0) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    const result = await pool.query(
      `UPDATE newsletter_subscribers
       SET email = $1, name = $2, status = $3
       WHERE id = $4
       RETURNING id, email, name, status, subscribed_at, unsubscribed_at, created_at`,
      [email, name, status, id]
    );

    await logAudit(
      req.user.id,
      "update",
      "newsletter_subscriber",
      parseInt(id),
      null,
      current.rows[0],
      result.rows[0]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Error updating subscriber:", error);
    res.status(500).json({ message: "Failed to update subscriber" });
  }
});

// Delete subscriber (admin only)
router.delete("/subscribers/:id", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Get subscriber data for audit log
    const subscriber = await pool.query(
      "SELECT * FROM newsletter_subscribers WHERE id = $1",
      [id]
    );

    if (subscriber.rows.length === 0) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    await pool.query("DELETE FROM newsletter_subscribers WHERE id = $1", [id]);

    await logAudit(
      req.user.id,
      "delete",
      "newsletter_subscriber",
      parseInt(id),
      null,
      subscriber.rows[0],
      null
    );

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting subscriber:", error);
    res.status(500).json({ message: "Failed to delete subscriber" });
  }
});

// Send newsletter (admin only)
router.post("/send", requireAdmin, async (req, res) => {
  try {
    const { subject, message, recipients } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    // Get subscribers based on recipients filter
    let query = "SELECT email, name FROM newsletter_subscribers WHERE status = 'active'";

    if (recipients === "active") {
      // Already filtered by status = 'active'
    } else if (recipients === "all") {
      // Get all subscribers regardless of status
      query = "SELECT email, name FROM newsletter_subscribers";
    }

    const result = await pool.query(query);
    const subscribers = result.rows;

    if (subscribers.length === 0) {
      return res.status(400).json({ message: "No subscribers found" });
    }

    // Send emails to all subscribers
    const emailPromises = subscribers.map((subscriber) =>
      sendEmail({
        to: subscriber.email,
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #8b5cf6;">${subject}</h2>
            <div style="white-space: pre-wrap;">${message}</div>
            <hr style="margin: 2rem 0; border: none; border-top: 1px solid #e5e7eb;" />
            <p style="font-size: 0.875rem; color: #6b7280;">
              You're receiving this email because you're subscribed to the A Life Worth Celebrating newsletter.
              <br />
              <a href="${process.env.FRONTEND_URL || 'https://alwcwin.org'}" style="color: #8b5cf6;">Visit our website</a>
            </p>
          </div>
        `,
        text: message,
      })
    );

    await Promise.all(emailPromises);

    await logAudit(
      req.user.id,
      "send_newsletter",
      "newsletter",
      null,
      null,
      null,
      { subject, recipients: subscribers.length, filter: recipients }
    );

    res.json({
      message: "Newsletter sent successfully",
      recipientCount: subscribers.length
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({ message: "Failed to send newsletter" });
  }
});

// Export subscribers as CSV (admin only)
router.get("/subscribers/export", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT email, name, status, subscribed_at, unsubscribed_at
       FROM newsletter_subscribers
       ORDER BY subscribed_at DESC`
    );

    // Create CSV content
    const headers = ["Email", "Name", "Status", "Subscribed At", "Unsubscribed At"];
    const rows = result.rows.map((row) => [
      row.email,
      row.name || "",
      row.status,
      row.subscribed_at ? new Date(row.subscribed_at).toISOString() : "",
      row.unsubscribed_at ? new Date(row.unsubscribed_at).toISOString() : "",
    ]);

    const csv = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=newsletter-subscribers.csv");
    res.send(csv);
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    res.status(500).json({ message: "Failed to export subscribers" });
  }
});

export default router;
