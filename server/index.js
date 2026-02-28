import "dotenv/config";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import logger from "./utils/logger.js";
import { initDb } from "./db.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { securityHeaders, apiLimiter } from "./middleware/security.js";

import authRoutes from "./routes/auth.js";
import contentRoutes from "./routes/content.js";
import eventsRoutes from "./routes/events.js";
import adminRoutes from "./routes/admin.js";
import imagesRoutes from "./routes/images.js";
import boardMembersRoutes from "./routes/boardMembers.js";
import newsletterRoutes from "./routes/newsletter.js";

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isProduction = process.env.NODE_ENV === "production";

// Security middleware
if (isProduction) {
  app.use(securityHeaders());
}

// Request logging
app.use(requestLogger);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());

// CORS configuration
if (!isProduction) {
  app.use(
    cors({
      origin: "http://localhost:5173",
      credentials: true,
    }),
  );
}

// Rate limiting for API routes
app.use("/api", apiLimiter);

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/content", contentRoutes);
app.use("/api", eventsRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", imagesRoutes);
app.use("/api", boardMembersRoutes);
app.use("/api/newsletter", newsletterRoutes);

// Static file serving
const distPath = path.resolve(__dirname, "..", "dist");
app.use(express.static(distPath));

// SPA fallback - serve index.html for all non-API routes
app.use((req, res, next) => {
  // Only handle GET requests that aren't for API routes
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    res.sendFile(path.join(distPath, "index.html"));
  } else {
    next();
  }
});

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Graceful startup
initDb()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Server started successfully`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
      });
    });
  })
  .catch((error) => {
    logger.error("Failed to initialize database", {
      error: error.message,
      stack: error.stack,
    });
    process.exit(1);
  });

// Graceful shutdown
process.on("SIGTERM", () => {
  logger.info("SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  logger.info("SIGINT signal received: closing HTTP server");
  process.exit(0);
});
