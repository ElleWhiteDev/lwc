/**
 * Simple, production-ready logger utility
 * Provides structured logging with different levels
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const COLORS = {
  ERROR: '\x1b[31m', // Red
  WARN: '\x1b[33m',  // Yellow
  INFO: '\x1b[36m',  // Cyan
  DEBUG: '\x1b[90m', // Gray
  RESET: '\x1b[0m',
};

class Logger {
  constructor() {
    this.level = this.getLogLevel();
    this.isProduction = process.env.NODE_ENV === 'production';
  }

  getLogLevel() {
    const envLevel = process.env.LOG_LEVEL?.toUpperCase() || 'INFO';
    return LOG_LEVELS[envLevel] ?? LOG_LEVELS.INFO;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    
    if (this.isProduction) {
      // JSON format for production (easier to parse by log aggregators)
      return JSON.stringify({
        timestamp,
        level,
        message,
        ...meta,
      });
    } else {
      // Colored format for development
      const color = COLORS[level] || COLORS.RESET;
      return `${color}[${timestamp}] ${level}:${COLORS.RESET} ${message}${metaStr}`;
    }
  }

  error(message, meta = {}) {
    if (this.level >= LOG_LEVELS.ERROR) {
      console.error(this.formatMessage('ERROR', message, meta));
    }
  }

  warn(message, meta = {}) {
    if (this.level >= LOG_LEVELS.WARN) {
      console.warn(this.formatMessage('WARN', message, meta));
    }
  }

  info(message, meta = {}) {
    if (this.level >= LOG_LEVELS.INFO) {
      console.log(this.formatMessage('INFO', message, meta));
    }
  }

  debug(message, meta = {}) {
    if (this.level >= LOG_LEVELS.DEBUG) {
      console.log(this.formatMessage('DEBUG', message, meta));
    }
  }

  // Convenience method for HTTP request logging
  http(req, statusCode, duration) {
    const message = `${req.method} ${req.path} ${statusCode}`;
    const meta = {
      method: req.method,
      path: req.path,
      statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
    };
    
    if (statusCode >= 500) {
      this.error(message, meta);
    } else if (statusCode >= 400) {
      this.warn(message, meta);
    } else {
      this.info(message, meta);
    }
  }
}

// Export singleton instance
export const logger = new Logger();
export default logger;

