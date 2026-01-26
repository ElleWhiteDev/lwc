import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { sendPasswordResetEmail, sendContactFormEmail } from "../utils/email.js";

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Email and password are required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, name, password_hash, role FROM users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET is not set.");
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

		return res.json({
			user: {
				...payload,
				isAdmin: Boolean(isAdmin),
				isMainAdmin: adminEmail && user.email === adminEmail,
			},
		});
  } catch (error) {
    console.error("Error during login", error);
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

		console.log("=== /me endpoint ===");
		console.log("req.user:", req.user);
		console.log("adminEmail:", adminEmail);
		console.log("isAdmin:", isAdmin);
		console.log("Returning userData:", userData);
		console.log("===================");

		return res.json({
			user: userData,
		});
	});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body ?? {};

  console.log("\n=== Forgot Password Request ===");
  console.log("Request body:", req.body);
  console.log("Email:", email);

  if (!email) {
    console.log("❌ No email provided");
    return res.status(400).json({ message: "Email is required" });
  }

  try {
    // Find user by email
    console.log("🔍 Looking up user in database...");
    const result = await pool.query(
      "SELECT id, email, name FROM users WHERE email = $1",
      [email]
    );

    console.log("Database query result:", result.rows.length, "user(s) found");

    // Always return success even if user doesn't exist (security best practice)
    if (result.rows.length === 0) {
      console.log("⚠️ User not found, but returning success message for security");
      return res.json({
        message: "If an account exists with that email, a password reset link has been sent.",
      });
    }

    const user = result.rows[0];
    console.log("✅ User found:", { id: user.id, email: user.email, name: user.name });

    // Generate a secure random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    console.log("🔑 Generated reset token:", resetToken);

    // Token expires in 1 hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
    console.log("⏰ Token expires at:", expiresAt);

    // Store token in database
    console.log("💾 Storing token in database...");
    await pool.query(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at)
       VALUES ($1, $2, $3)`,
      [user.id, resetToken, expiresAt]
    );
    console.log("✅ Token stored in database");

    // Send password reset email
    console.log("📧 Calling sendPasswordResetEmail...");
    await sendPasswordResetEmail(user.email, resetToken, user.name);
    console.log("✅ Email sent successfully");

    console.log("====================================\n");
    return res.json({
      message: "If an account exists with that email, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("❌ Error in forgot-password endpoint:", error);
    console.error("Error stack:", error.stack);
    console.log("====================================\n");
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body ?? {};

  if (!token || !newPassword) {
    return res.status(400).json({ message: "Token and new password are required" });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters long" });
  }

  try {
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

    return res.json({ message: "Password has been reset successfully" });
  } catch (error) {
    console.error("Error in reset-password", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/contact", async (req, res) => {
  const { name, email, message } = req.body ?? {};

  console.log("\n=== Contact Form Submission ===");
  console.log("Name:", name);
  console.log("Email:", email);
  console.log("Message length:", message ? message.length : 0);

  if (!name || !email || !message) {
    console.log("❌ Missing required fields");
    return res.status(400).json({ message: "Name, email, and message are required" });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log("❌ Invalid email format");
    return res.status(400).json({ message: "Invalid email address" });
  }

  try {
    console.log("📧 Sending contact form email...");
    await sendContactFormEmail(name, email, message);
    console.log("✅ Contact form email sent successfully");
    console.log("====================================\n");

    return res.json({ message: "Message sent successfully" });
  } catch (error) {
    console.error("❌ Error in contact endpoint:", error);
    console.error("Error stack:", error.stack);
    console.log("====================================\n");
    return res.status(500).json({ message: "Failed to send message. Please try again later." });
  }
});

export default router;
