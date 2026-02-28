import jwt from "jsonwebtoken";
import logger from "../utils/logger.js";

/**
 * Extract JWT token from request (cookie or Authorization header)
 */
function extractToken(req) {
  const tokenFromCookie = req.cookies?.token;
  const authHeader = req.get("Authorization");
  const tokenFromHeader = authHeader?.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  return tokenFromCookie || tokenFromHeader;
}

/**
 * Verify JWT token and return payload
 */
function verifyToken(token) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    logger.error("JWT_SECRET is not set in environment variables");
    throw new Error("Server configuration error");
  }

  return jwt.verify(token, secret);
}

/**
 * Middleware to require authentication
 */
function requireAuth(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };
    next();
  } catch (error) {
    if (error.message === "Server configuration error") {
      return res.status(500).json({ message: error.message });
    }
    logger.warn("JWT verification failed", { error: error.message });
    return res.status(401).json({ message: "Unauthorized" });
  }
}

/**
 * Middleware to require admin role
 */
function requireAdmin(req, res, next) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const payload = verifyToken(token);
    req.user = {
      id: payload.id,
      email: payload.email,
      name: payload.name,
      role: payload.role,
    };

    // Check if user is admin or superuser
    if (payload.role !== "admin" && payload.role !== "superuser") {
      logger.warn("Non-admin user attempted to access admin route", {
        userId: payload.id,
        email: payload.email,
        role: payload.role,
      });
      return res.status(403).json({ message: "Forbidden: Admin access required" });
    }

    next();
  } catch (error) {
    if (error.message === "Server configuration error") {
      return res.status(500).json({ message: error.message });
    }
    logger.warn("JWT verification failed", { error: error.message });
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export { requireAuth, requireAdmin };
