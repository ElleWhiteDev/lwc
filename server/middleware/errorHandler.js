import logger from "../utils/logger.js";

/**
 * Global error handling middleware
 * Should be added after all routes
 */
export function errorHandler(err, req, res, next) {
  // Log the error
  logger.error("Unhandled error", {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === "production";
  const message = isProduction ? "Internal server error" : err.message;

  res.status(err.status || 500).json({
    message,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}

/**
 * 404 handler for undefined routes
 */
export function notFoundHandler(req, res) {
  logger.warn("Route not found", {
    path: req.path,
    method: req.method,
  });

  res.status(404).json({
    message: "Route not found",
  });
}

