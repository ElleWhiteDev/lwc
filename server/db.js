import pg from "pg";
import bcrypt from "bcrypt";
import logger from "./utils/logger.js";

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "DATABASE_URL is not set. Please configure your Postgres database before starting the server.",
  );
}

// Configure connection pool with optimized settings
const pool = new Pool({
  connectionString,
  ssl: connectionString.includes("localhost")
    ? false
    : {
        rejectUnauthorized: false,
      },
  // Connection pool configuration
  max: parseInt(process.env.DB_POOL_MAX, 10) || 20, // Maximum number of clients in the pool
  min: parseInt(process.env.DB_POOL_MIN, 10) || 2, // Minimum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT, 10) || 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT, 10) || 10000, // Return error after 10 seconds if connection cannot be established
  // Query timeout
  query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT, 10) || 30000, // Timeout queries after 30 seconds
});

// Log pool errors
pool.on('error', (err, client) => {
  logger.error('Unexpected error on idle database client', {
    error: err.message,
    stack: err.stack
  });
});

// Log successful connection
pool.on('connect', (client) => {
  logger.debug('New database client connected');
});

// Log client removal
pool.on('remove', (client) => {
  logger.debug('Database client removed from pool');
});

/**
 * Initialize database schema and seed data
 * Creates all necessary tables and indexes if they don't exist
 */
async function initDb() {
  try {
    logger.info('Initializing database schema...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS site_content (
      id SERIAL PRIMARY KEY,
      slug TEXT UNIQUE NOT NULL,
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      date TEXT,
      time TEXT,
      location TEXT,
      description TEXT,
      link TEXT,
      image_url TEXT,
      is_published BOOLEAN NOT NULL DEFAULT TRUE,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      action TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER,
      entity_slug TEXT,
      previous_data JSONB,
      new_data JSONB,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS event_images (
      id SERIAL PRIMARY KEY,
      event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
      image_url TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_event_images_event_id ON event_images(event_id);
  `);

  // Board members table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS board_members (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      image_url TEXT,
      display_order INTEGER NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  // Add display_order column to events table if it doesn't exist
  await pool.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'events' AND column_name = 'display_order'
      ) THEN
        ALTER TABLE events ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
      END IF;
    END $$;
  `);

  // Password reset tokens table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      used BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
  `);

  // Add unique index on users email for better performance
  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);
  `);

  // Newsletter subscribers table
  await pool.query(`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      name TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      unsubscribed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  `);

  await pool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
  `);

    logger.info('Database schema initialized successfully');

    await seedAdminUser();
  } catch (error) {
    logger.error('Error initializing database', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Seed or update the admin user
 * Creates a new admin user or updates existing one based on environment variables
 */
async function seedAdminUser() {
  try {
    const email = process.env.ADMIN_EMAIL;
    const password = process.env.ADMIN_PASSWORD;
    const name = process.env.ADMIN_NAME || "Admin";

    if (!email || !password) {
      logger.warn("ADMIN_EMAIL or ADMIN_PASSWORD is not set; skipping admin user seeding.");
      return;
    }

    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);

    const passwordHash = await bcrypt.hash(password, 10);

    if (existing.rows.length > 0) {
      // Update existing admin user's password, name, and role
      await pool.query(
        "UPDATE users SET password_hash = $1, name = $2, role = $3 WHERE email = $4",
        [passwordHash, name, "admin", email],
      );
      logger.info(`Updated admin user`, { email });
    } else {
      // Create new admin user
      await pool.query(
        "INSERT INTO users (email, name, password_hash, role) VALUES ($1, $2, $3, $4)",
        [email, name, passwordHash, "admin"],
      );
      logger.info(`Seeded admin user`, { email });
    }
  } catch (error) {
    logger.error('Error seeding admin user', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

/**
 * Get database pool statistics
 * Useful for monitoring and debugging connection pool health
 */
function getPoolStats() {
  return {
    totalCount: pool.totalCount,
    idleCount: pool.idleCount,
    waitingCount: pool.waitingCount,
  };
}

/**
 * Gracefully close all database connections
 * Should be called during application shutdown
 */
async function closePool() {
  try {
    logger.info('Closing database connection pool...');
    await pool.end();
    logger.info('Database connection pool closed successfully');
  } catch (error) {
    logger.error('Error closing database pool', {
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
}

export { pool, initDb, getPoolStats, closePool };
