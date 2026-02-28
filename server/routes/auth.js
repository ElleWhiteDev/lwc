import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { sendPasswordResetEmail, sendContactFormEmail } from "../utils/email.js";
import { authLimiter, passwordResetLimiter, contactFormLimiter } from "../middleware/security.js";
import { validateEmail, validatePassword, validateRequiredString, ValidationError } from "../utils/validation.js";
import logger from "../utils/logger.js";

const router = express.Router();

router.post("/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    // Validate input
    const validatedEmail = validateEmail(email);
    validatePassword(password);

    // Look up user
    const result = await pool.query(
      "SELECT id, email, name, password_hash, role FROM users WHERE email = $1",
      [validatedEmail],
    );

    if (result.rows.length === 0) {
      logger.warn("Login attempt for non-existent user", { email: validatedEmail });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      logger.warn("Failed login attempt", { userId: user.id, email: user.email });
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      logger.error("JWT_SECRET is not set");
      return res.status(500).json({ message: "Server configuration error" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || "user",
    };

    const token = jwt.sign(payload, secret, { expiresIn: "7d" });
    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const adminEmail = process.env.ADMIN_EMAIL;
    const isAdmin = user.role === "admin" || user.role === "superuser";

    logger.info("User logged in successfully", { userId: user.id, email: user.email });

    return res.json({
      user: {
        ...payload,
        isAdmin: Boolean(isAdmin),
        isMainAdmin: adminEmail && user.email === adminEmail,
      },
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    logger.error("Error during login", { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/logout", (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
  });

  return res.status(204).end();
});

router.get("/me", requireAuth, (req, res) => {
  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin = req.user?.role === "admin" || req.user?.role === "superuser";

  const userData = {
    id: req.user.id,
    email: req.user.email,
    name: req.user.name,
    role: req.user.role || "user",
    isAdmin: Boolean(isAdmin),
    isMainAdmin: adminEmail && req.user?.email === adminEmail,
  };

  return res.json({
    user: userData,
  });
});

router.post("/forgot-password", passwordResetLimiter, async (req, res) => {
  try {
    const { email } = req.body ?? {};

    // Validate email
    const validatedEmail = validateEmail(email);

    // Find user by email
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE email = $1",
      [validatedEmail]
    );

    // Always return success even if user doesn't exist (security best practice)
    if (result.rows.length === 0) {
      logger.info("Password reset requested for non-existent email", { email: validatedEmail });
      return res.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    const user = result.rows[0];

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Store token in database
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );

    // Send password reset email
    await sendPasswordResetEmail(user.email, resetToken, user.name);

    logger.info("Password reset email sent", { userId: user.id, email: user.email });

    return res.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    logger.error("Error in forgot-password endpoint", { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body ?? {};

    // Validate input
    if (!token || typeof token !== "string") {
      return res.status(400).json({ message: "Reset token is required" });
    }

    validatePassword(newPassword);

    // Find valid token
    const tokenResult = await pool.query(
      `SELECT user_id, expires_at, used
       FROM password_reset_tokens
       WHERE token = $1`,
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const resetToken = tokenResult.rows[0];

    // Check if token has been used
    if (resetToken.used) {
      return res.status(400).json({ message: "This reset token has already been used" });
    }

    // Check if token has expired
    if (new Date() > new Date(resetToken.expires_at)) {
      return res.status(400).json({ message: "This reset token has expired" });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(newPassword, 10);

    // Update user's password
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, resetToken.user_id]
    );

    // Mark token as used
    await pool.query(
      "UPDATE password_reset_tokens SET used = TRUE WHERE token = $1",
      [token]
    );

    logger.info("Password reset successfully", { userId: resetToken.user_id });

    return res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    logger.error("Error in reset-password", { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/contact", contactFormLimiter, async (req, res) => {
  try {
    const { name, email, message } = req.body ?? {};

    // Validate input
    const validatedName = validateRequiredString(name, "Name", 100);
    const validatedEmail = validateEmail(email);
    const validatedMessage = validateRequiredString(message, "Message", 5000);

    // Send contact form email
    await sendContactFormEmail(validatedName, validatedEmail, validatedMessage);

    logger.info("Contact form submitted", { name: validatedName, email: validatedEmail });

    return res.json({ message: "Message sent successfully" });
  } catch (error) {
    if (error instanceof ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    logger.error("Error in contact endpoint", { error: error.message, stack: error.stack });
    return res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
});

export default router;
