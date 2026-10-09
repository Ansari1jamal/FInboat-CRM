// ========================================
// LOAD ENVIRONMENT VARIABLES
// ========================================

require("dotenv").config();


// ========================================
// ENV CONFIGURATION
// ========================================

const env = {

  // ======================================
  // SERVER
  // ======================================

  PORT:
    process.env.PORT || 5000,

  NODE_ENV:
    process.env.NODE_ENV ||
    "development",


  // ======================================
  // DATABASE
  // ======================================

  DATABASE_URL:
    process.env.DATABASE_URL,


  // ======================================
  // JWT
  // ======================================

  JWT_SECRET:
    process.env.JWT_SECRET,

  JWT_EXPIRES_IN:
    process.env.JWT_EXPIRES_IN ||
    "7d",


  // ======================================
  // CSRF
  // ======================================

  CSRF_SECRET:
    process.env.CSRF_SECRET,


  // ======================================
  // REDIS
  // ======================================

  REDIS_HOST:
    process.env.REDIS_HOST ||
    "127.0.0.1",

  REDIS_PORT:
    process.env.REDIS_PORT ||
    6379,

  REDIS_PASSWORD:
    process.env.REDIS_PASSWORD ||
    "",


  // ======================================
  // FILE STORAGE
  // ======================================

  DOCUMENT_STORAGE_PATH:
    process.env.DOCUMENT_STORAGE_PATH ||
    "storage/documents",


  // ======================================
  // FRONTEND
  // ======================================

  FRONTEND_URL:
    process.env.FRONTEND_URL ||
    "http://localhost:5173",
};


// ========================================
// REQUIRED ENV VARIABLES
// ========================================

if (!env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is missing in .env"
  );
}


if (!env.JWT_SECRET) {
  throw new Error(
    "JWT_SECRET is missing in .env"
  );
}


if (!env.CSRF_SECRET) {
  throw new Error(
    "CSRF_SECRET is missing in .env"
  );
}


// ========================================
// EXPORT
// ========================================

module.exports = env;