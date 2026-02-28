import logger from "../utils/logger.js";

/**
 * Middleware to log HTTP requests
 */
export function requestLogger(req, res, next) {
  const startTime = Date.now();

  // Log when response finishes
  res.on("finish", () => {
    const duration = Date.now() - startTime;
    logger.http(req, res.statusCode, duration);
  });

  next();
}

