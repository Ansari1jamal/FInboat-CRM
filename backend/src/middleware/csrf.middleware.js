// ========================================
// CSRF PACKAGE
// ========================================

const {
  doubleCsrf,
} = require("csrf-csrf");


// ========================================
// ENV CONFIG
// ========================================

const env =
  require("../config/env");


// ========================================
// CSRF SECRET
// ========================================

const csrfSecret =
  env.CSRF_SECRET;

if (!csrfSecret) {
  throw new Error(
    "CSRF_SECRET is not configured"
  );
}


// ========================================
// DOUBLE CSRF CONFIGURATION
// ========================================

const {
  doubleCsrfProtection,
  generateCsrfToken,
  invalidCsrfTokenError,
  validateRequest,
} = doubleCsrf({

  // ======================================
  // SECRET
  // ======================================

  getSecret: () =>
    csrfSecret,


  // ======================================
  // SESSION IDENTIFIER
  // ======================================

  getSessionIdentifier:
    (req) => {

      return (
        req.cookies?.csrfSession ||
        req.ip
      );
    },


  // ======================================
  // CSRF COOKIE
  // ======================================

  cookieName:
    "csrfToken",

  cookieOptions: {

    httpOnly: false,

    secure:
      env.NODE_ENV ===
      "production",

    sameSite:
      env.NODE_ENV ===
      "production"
        ? "strict"
        : "lax",

    path: "/",
  },


  // ======================================
  // TOKEN SIZE
  // ======================================

  size: 64,


  // ======================================
  // SAFE METHODS
  // ======================================

  ignoredMethods: [
    "GET",
    "HEAD",
    "OPTIONS",
  ],


  // ======================================
  // TOKEN FROM FRONTEND
  // ======================================

  getCsrfTokenFromRequest:
    (req) => {

      return (
        req.headers[
          "x-csrf-token"
        ] ||
        null
      );
    },
});


// ========================================
// GENERATE CSRF TOKEN
// ========================================

const createCsrfToken =
  (req, res) => {

    return generateCsrfToken(
      req,
      res
    );
  };


// ========================================
// EXPORT
// ========================================

module.exports = {

  csrfProtection:
    doubleCsrfProtection,

  generateCsrfToken:
    createCsrfToken,

  invalidCsrfTokenError,

  validateRequest,
};