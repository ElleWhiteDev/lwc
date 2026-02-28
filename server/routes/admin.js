import express from "express";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { logAudit } from "../audit.js";
import { sendNewUserWelcomeEmail, sendSuperuserRequestEmail } from "../utils/email.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.use(requireAuth);

function requireMainAdmin(req, res, next) {
	const adminEmail = process.env.ADMIN_EMAIL;

	if (!adminEmail) {
		logger.error("ADMIN_EMAIL is not set; user management routes are disabled.");
		return res.status(500).json({ message: "Server configuration error" });
	}

	if (!req.user || req.user.email !== adminEmail) {
		return res.status(403).json({ message: "Forbidden" });
	}

	return next();
}

router.get("/users", async (req, res) => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const result = await pool.query(
      `
        SELECT id, email, name, role, created_at
        FROM users
        ORDER BY created_at ASC
      `,
    );

    // Add isMainAdmin flag to each user
    const users = result.rows.map(user => ({
      ...user,
      isMainAdmin: adminEmail && user.email === adminEmail,
    }));

    return res.json({ users });
  } catch (error) {
    logger.error("Error fetching users", { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/users", async (req, res) => {
  const { name, email, role = "user" } = req.body ?? {};

  if (!name || !email) {
    return res
      .status(400)
      .json({ message: "Name and email are required" });
  }

  // Validate role
  if (!["user", "admin", "superuser"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    // Create user with a temporary random password hash
    // User will set their own password via the reset email
    const tempPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const insertResult = await pool.query(
      `
        INSERT INTO users (name, email, password_hash, role)
        VALUES ($1, $2, $3, $4)
        RETURNING id, email, name, role, created_at
      `,
      [name, email, passwordHash, role],
    );

    const saved = insertResult.rows[0];

    await logAudit({
      userId: req.user.id,
      action: "create",
      entityType: "user",
      entityId: saved.id,
      previousData: null,
      newData: { id: saved.id, email: saved.email, name: saved.name, role: saved.role },
    });

    // Generate password reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store token in database
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [saved.id, resetToken, expiresAt]
    );

    // Send welcome email with password setup link
    await sendNewUserWelcomeEmail(saved.email, resetToken, saved.name);

    logger.info("User created", { userId: req.user.id, newUserId: saved.id, email: saved.email, role: saved.role });

    return res.status(201).json(saved);
  } catch (error) {
    logger.error("Error creating user", { error: error.message, stack: error.stack });
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, password } = req.body ?? {};

  if (!name && !email && !password) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const existingResult = await pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE id = $1",
      [id],
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = existingResult.rows[0];

    const nextName = name ?? existing.name;
    const nextEmail = email ?? existing.email;
    const nextPasswordHash = password
      ? await bcrypt.hash(password, 10)
      : existing.password_hash;

    const updateResult = await pool.query(
      `
        UPDATE users
        SET name = $1, email = $2, password_hash = $3
        WHERE id = $4
        RETURNING id, email, name, created_at
      `,
      [nextName, nextEmail, nextPasswordHash, id],
    );

    const saved = updateResult.rows[0];

    // Determine the action type based on what changed
    let action = "update";
    if (password) {
      action = "update_password";
    } else if (email && email !== existing.email) {
      action = "update_email";
    }

    await logAudit({
      userId: req.user.id,
      action,
      entityType: "user",
      entityId: saved.id,
      previousData: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
      },
      newData: { id: saved.id, email: saved.email, name: saved.name },
    });

    logger.info("User updated", {
      userId: req.user.id,
      targetUserId: saved.id,
      action,
      email: saved.email
    });

    return res.json(saved);
  } catch (error) {
    logger.error("Error updating user", { userId: req.user.id, targetUserId: id, error: error.message, stack: error.stack });
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Update user role
router.put("/users/:id/role", async (req, res) => {
  const { id } = req.params;
  const { role } = req.body ?? {};

  if (!role) {
    return res.status(400).json({ message: "Role is required" });
  }

  // Validate role
  if (!["user", "admin", "superuser"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  try {
    const adminEmail = process.env.ADMIN_EMAIL;

    // Get the user being updated
    const existingResult = await pool.query(
      "SELECT id, email, name, role FROM users WHERE id = $1",
      [id],
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = existingResult.rows[0];

    // Prevent changing the main admin's role
    if (adminEmail && existing.email === adminEmail) {
      return res.status(403).json({ message: "Cannot change main admin's role" });
    }

    const updateResult = await pool.query(
      `UPDATE users SET role = $1 WHERE id = $2 RETURNING id, email, name, role, created_at`,
      [role, id],
    );

    const saved = updateResult.rows[0];

    await logAudit({
      userId: req.user.id,
      action: "update_role",
      entityType: "user",
      entityId: saved.id,
      previousData: { role: existing.role },
      newData: { role: saved.role },
    });

    logger.info("User role updated", {
      userId: req.user.id,
      targetUserId: saved.id,
      oldRole: existing.role,
      newRole: saved.role
    });

    return res.json(saved);
  } catch (error) {
    logger.error("Error updating user role", { userId: req.user.id, targetUserId: id, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/users/:id", async (req, res) => {
  const { id } = req.params;
  const adminEmail = process.env.ADMIN_EMAIL;

  // Prevent deleting yourself
  if (Number(id) === req.user.id) {
    return res
      .status(403)
      .json({ message: "You cannot delete your own user account" });
  }

  try {
    const existingResult = await pool.query(
      "SELECT id, email, name FROM users WHERE id = $1",
      [id],
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = existingResult.rows[0];

    // Prevent deleting the main admin account
    if (adminEmail && existing.email === adminEmail) {
      return res
        .status(403)
        .json({ message: "Cannot delete the main admin account" });
    }

    await pool.query("DELETE FROM users WHERE id = $1", [id]);

    await logAudit({
      userId: req.user.id,
      action: "delete",
      entityType: "user",
      entityId: existing.id,
      previousData: existing,
      newData: null,
    });

    logger.info("User deleted", {
      userId: req.user.id,
      deletedUserId: existing.id,
      email: existing.email
    });

    return res.status(204).end();
  } catch (error) {
    logger.error("Error deleting user", { userId: req.user.id, targetUserId: id, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.put("/me", async (req, res) => {
  const userId = req.user.id;
  const { name, email, password } = req.body ?? {};

  if (!name && !email && !password) {
    return res.status(400).json({ message: "Nothing to update" });
  }

  try {
    const existingResult = await pool.query(
      "SELECT id, email, name, password_hash FROM users WHERE id = $1",
      [userId],
    );

    if (existingResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = existingResult.rows[0];

    const nextName = name ?? existing.name;
    const nextEmail = email ?? existing.email;
    const nextPasswordHash = password
      ? await bcrypt.hash(password, 10)
      : existing.password_hash;

    const updateResult = await pool.query(
      `
        UPDATE users
        SET name = $1, email = $2, password_hash = $3
        WHERE id = $4
        RETURNING id, email, name, created_at
      `,
      [nextName, nextEmail, nextPasswordHash, userId],
    );

    const saved = updateResult.rows[0];

    // Determine the action type based on what changed
    let action = "update_profile";
    if (password) {
      action = "update_own_password";
    } else if (email && email !== existing.email) {
      action = "update_own_email";
    }

    await logAudit({
      userId,
      action,
      entityType: "user",
      entityId: saved.id,
      previousData: {
        id: existing.id,
        email: existing.email,
        name: existing.name,
      },
      newData: { id: saved.id, email: saved.email, name: saved.name },
    });

    logger.info("Profile updated", { userId, action, email: saved.email });

    return res.json(saved);
  } catch (error) {
    logger.error("Error updating profile", { userId: req.user.id, error: error.message, stack: error.stack });
    if (error.code === "23505") {
      return res.status(409).json({ message: "Email already in use" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Request superuser access
router.post("/request-superuser", async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, name, role FROM users WHERE id = $1",
      [userId],
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = userResult.rows[0];

    // Don't allow if already admin or superuser
    if (user.role === "admin" || user.role === "superuser") {
      return res.status(400).json({ message: "You already have elevated access" });
    }

    // Send email to admin
    await sendSuperuserRequestEmail(user.name, user.email, user.role);

    // Log the request
    await logAudit({
      userId: req.user.id,
      action: "request_superuser",
      entityType: "user",
      entityId: user.id,
      previousData: { role: user.role },
      newData: { requested_role: "superuser" },
    });

    logger.info("Superuser access requested", { userId, email: user.email, currentRole: user.role });

    return res.json({ message: "Superuser access request sent to admin" });
  } catch (error) {
    logger.error("Error requesting superuser access", { userId: req.user.id, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Failed to send request" });
  }
});

router.get("/audit-logs", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  const offset = parseInt(req.query.offset, 10) || 0;

  try {
    const result = await pool.query(
      `
        SELECT
          a.id,
          a.action,
          a.entity_type,
          a.entity_id,
          a.entity_slug,
          a.previous_data,
          a.new_data,
          a.created_at,
          u.id AS user_id,
          u.email AS user_email,
          u.name AS user_name
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ORDER BY a.created_at DESC
        LIMIT $1 OFFSET $2
      `,
      [limit, offset],
    );

    return res.json({ logs: result.rows });
  } catch (error) {
    logger.error("Error fetching audit logs", { userId: req.user.id, error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
