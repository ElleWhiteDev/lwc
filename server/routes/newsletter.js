import express from "express";
import { pool } from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { logAudit } from "../audit.js";
import { sendEmail } from "../utils/email.js";
import {
  syncContactToSendGrid,
  getDraftCampaigns,
  sendCampaign,
  getSuppressionGroups,
  createSuppressionGroup
} from "../utils/sendgrid.js";
import crypto from "crypto";

const router = express.Router();

// Helper function to generate unsubscribe token
function generateUnsubscribeToken(email) {
  const secret = process.env.JWT_SECRET || "your-secret-key";
  return crypto
    .createHmac("sha256", secret)
    .update(email)
    .digest("hex");
}

// Public endpoint - Subscribe to newsletter (no auth required)
router.post("/subscribe", async (req, res) => {
  try {
    const { email, name } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Check if subscriber already exists
    const existing = await pool.query(
      "SELECT id, status FROM newsletter_subscribers WHERE email = $1",
      [email]
    );

    if (existing.rows.length > 0) {
      // If they exist but are unsubscribed, reactivate them
      if (existing.rows[0].status === "unsubscribed") {
        await pool.query(
          `UPDATE newsletter_subscribers
           SET status = 'active', subscribed_at = NOW(), unsubscribed_at = NULL, name = $1
           WHERE email = $2`,
          [name || null, email]
        );

        return res.json({ message: "Successfully resubscribed to newsletter!" });
      }

      return res.status(400).json({ message: "Email already subscribed" });
    }

    // Add new subscriber
    await pool.query(
      `INSERT INTO newsletter_subscribers (email, name, status)
       VALUES ($1, $2, 'active')`,
      [email, name || null]
    );

    res.status(201).json({ message: "Successfully subscribed to newsletter!" });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    res.status(500).json({ message: "Failed to subscribe to newsletter" });
  }
});

// Public endpoint - Unsubscribe from newsletter (token-based auth)
router.post("/unsubscribe", async (req, res) => {
  try {
    const { email, token } = req.body;

    if (!email || !token) {
      return res.status(400).json({ message: "Email and token are required" });
    }

    // Verify token
    const expectedToken = generateUnsubscribeToken(email);
    if (token !== expectedToken) {
      return res.status(401).json({ message: "Invalid unsubscribe token" });
    }

    // Check if subscriber exists
    const existing = await pool.query(
      "SELECT id, status FROM newsletter_subscribers WHERE email = $1",
      [email]
    );

    if (existing.rows.length === 0) {
      return res.status(404).json({ message: "Email not found in subscriber list" });
    }

    if (existing.rows[0].status === "unsubscribed") {
      return res.json({ message: "Already unsubscribed" });
    }

    // Update subscriber status
    await pool.query(
      `UPDATE newsletter_subscribers
       SET status = 'unsubscribed', unsubscribed_at = NOW()
       WHERE email = $1`,
      [email]
    );

    res.json({ message: "Successfully unsubscribed from newsletter" });
  } catch (error) {
    console.error("Error unsubscribing from newsletter:", error);
    res.status(500).json({ message: "Failed to unsubscribe from newsletter" });
  }
});

// Export subscribers as CSV (admin only) - MUST come before /subscribers route
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

        await logAudit({
          userId: req.user.id,
          action: "resubscribe",
          entityType: "newsletter_subscriber",
          entityId: result.rows[0].id,
          previousData: { status: "unsubscribed" },
          newData: { status: "active", email, name }
        });

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

    await logAudit({
      userId: req.user.id,
      action: "create",
      entityType: "newsletter_subscriber",
      entityId: result.rows[0].id,
      newData: { email, name }
    });

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

    await logAudit({
      userId: req.user.id,
      action: "update",
      entityType: "newsletter_subscriber",
      entityId: parseInt(id),
      previousData: current.rows[0],
      newData: result.rows[0]
    });

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

    await logAudit({
      userId: req.user.id,
      action: "delete",
      entityType: "newsletter_subscriber",
      entityId: parseInt(id),
      previousData: subscriber.rows[0]
    });

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
    const emailPromises = subscribers.map((subscriber) => {
      const unsubscribeToken = generateUnsubscribeToken(subscriber.email);
      const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://alwcwin.org'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${unsubscribeToken}`;

      return sendEmail({
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
              <br /><br />
              <a href="${unsubscribeUrl}" style="color: #9ca3af; font-size: 0.75rem;">Unsubscribe from this newsletter</a>
            </p>
          </div>
        `,
        text: `${message}\n\n---\nYou're receiving this email because you're subscribed to the A Life Worth Celebrating newsletter.\nUnsubscribe: ${unsubscribeUrl}`,
      });
    });

    await Promise.all(emailPromises);

    await logAudit({
      userId: req.user.id,
      action: "send_newsletter",
      entityType: "newsletter",
      newData: { subject, recipients: subscribers.length, filter: recipients }
    });

    res.json({
      message: "Newsletter sent successfully",
      recipientCount: subscribers.length
    });
  } catch (error) {
    console.error("Error sending newsletter:", error);
    res.status(500).json({ message: "Failed to send newsletter" });
  }
});

// Send newsletter with uploaded HTML file (admin only)
router.post("/send-html", requireAdmin, async (req, res) => {
  try {
    const { subject, html, recipients } = req.body;

    if (!subject || !html) {
      return res.status(400).json({ message: "Subject and HTML content are required" });
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
    const emailPromises = subscribers.map((subscriber) => {
      const unsubscribeToken = generateUnsubscribeToken(subscriber.email);
      const unsubscribeUrl = `${process.env.FRONTEND_URL || 'https://alwcwin.org'}/unsubscribe?email=${encodeURIComponent(subscriber.email)}&token=${unsubscribeToken}`;

      // Add unsubscribe link to the HTML if it doesn't already have one
      let emailHtml = html;
      if (!html.includes('unsubscribe')) {
        emailHtml += `
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; font-size: 12px; color: #666;">
            <p>You're receiving this because you subscribed to our newsletter.</p>
            <p><a href="${unsubscribeUrl}" style="color: #666; text-decoration: underline;">Unsubscribe from this list</a></p>
          </div>
        `;
      }

      return sendEmail({
        to: subscriber.email,
        subject,
        html: emailHtml,
        text: `View this email in a browser that supports HTML.`,
      });
    });

    await Promise.all(emailPromises);

    await logAudit({
      userId: req.user.id,
      action: "send_html_newsletter",
      entityType: "newsletter",
      newData: { subject, recipients: subscribers.length, filter: recipients }
    });

    res.json({
      message: "Newsletter sent successfully",
      recipientCount: subscribers.length
    });
  } catch (error) {
    console.error("Error sending HTML newsletter:", error);
    res.status(500).json({ message: "Failed to send newsletter" });
  }
});

// ============================================
// SendGrid Marketing API Integration Routes
// ============================================

// Get all draft campaigns from SendGrid (admin only)
router.get("/campaigns/drafts", requireAdmin, async (req, res) => {
  try {
    const campaigns = await getDraftCampaigns();
    res.json(campaigns);
  } catch (error) {
    console.error("Error fetching draft campaigns:", error);
    res.status(500).json({ message: "Failed to fetch draft campaigns from SendGrid" });
  }
});

// Send a SendGrid campaign to subscribers (admin only)
router.post("/campaigns/:campaignId/send", requireAdmin, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const { recipients } = req.body; // 'active' or 'all'

    // Get subscribers from database
    let query = "SELECT email FROM newsletter_subscribers WHERE status = 'active'";
    if (recipients === "all") {
      query = "SELECT email FROM newsletter_subscribers";
    }

    const result = await pool.query(query);
    const emails = result.rows.map(row => row.email);

    if (emails.length === 0) {
      return res.status(400).json({ message: "No subscribers found" });
    }

    // Prepare campaign (actual sending done in SendGrid UI)
    const response = await sendCampaign(campaignId, emails);

    await logAudit({
      userId: req.user.id,
      action: "send_campaign",
      entityType: "newsletter_campaign",
      entityId: campaignId,
      newData: { campaignId, recipientCount: emails.length, filter: recipients }
    });

    res.json(response);
  } catch (error) {
    console.error("Error sending campaign:", error);
    res.status(500).json({ message: "Failed to send campaign" });
  }
});

// Sync a subscriber to SendGrid (admin only)
router.post("/subscribers/:id/sync", requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      "SELECT email, name, status FROM newsletter_subscribers WHERE id = $1",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Subscriber not found" });
    }

    const subscriber = result.rows[0];
    await syncContactToSendGrid(subscriber.email, subscriber.name, subscriber.status);

    res.json({ message: "Subscriber synced to SendGrid successfully" });
  } catch (error) {
    console.error("Error syncing subscriber:", error);
    res.status(500).json({ message: "Failed to sync subscriber to SendGrid" });
  }
});

// Sync all subscribers to SendGrid (admin only)
router.post("/subscribers/sync-all", requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, status FROM newsletter_subscribers"
    );

    let synced = 0;
    let failed = 0;

    for (const subscriber of result.rows) {
      try {
        await syncContactToSendGrid(subscriber.email, subscriber.name, subscriber.status);
        synced++;
      } catch (error) {
        console.error(`Failed to sync ${subscriber.email}:`, error);
        failed++;
      }
    }

    res.json({
      message: `Sync complete: ${synced} synced, ${failed} failed`,
      synced,
      failed,
      total: result.rows.length
    });
  } catch (error) {
    console.error("Error syncing all subscribers:", error);
    res.status(500).json({ message: "Failed to sync subscribers to SendGrid" });
  }
});

// Get suppression groups (admin only)
router.get("/suppression-groups", requireAdmin, async (req, res) => {
  try {
    const groups = await getSuppressionGroups();
    res.json(groups);
  } catch (error) {
    console.error("Error fetching suppression groups:", error);
    res.status(500).json({ message: "Failed to fetch suppression groups" });
  }
});

// Create suppression group (admin only)
router.post("/suppression-groups", requireAdmin, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({ message: "Name and description are required" });
    }

    const group = await createSuppressionGroup(name, description);
    res.json(group);
  } catch (error) {
    console.error("Error creating suppression group:", error);
    res.status(500).json({ message: "Failed to create suppression group" });
  }
});

export default router;
