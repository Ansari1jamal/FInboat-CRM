const authService =
  require("./auth.service");

const asyncHandler =
  require("../../utils/asyncHandler");

const {
  sendSuccess,
} = require("../../utils/response");

const ApiError =
  require("../../utils/ApiError");

const {
  generateCsrfToken,
} = require("../../middleware/csrf.middleware");

// ========================================
// REFRESH TOKEN COOKIE CONFIG
// ========================================

const REFRESH_TOKEN_COOKIE =
  "refreshToken";

const refreshCookieOptions = {
  httpOnly: true,

  secure:
    process.env.NODE_ENV ===
    "production",

  sameSite:
    process.env.NODE_ENV ===
    "production"
      ? "strict"
      : "lax",

  maxAge:
    30 *
    24 *
    60 *
    60 *
    1000,

  path: "/api/auth",
};

// ========================================
// REGISTER
// ========================================

const register = asyncHandler(
  async (req, res) => {
    const {
      name,
      email,
      phone,
      password,
      role,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !role
    ) {
      throw new ApiError(
        400,
        "Name, email, password and role are required"
      );
    }

    const user =
      await authService.registerUser({
        name,
        email,
        phone,
        password,
        role,
      });

    return sendSuccess(
      res,
      user,
      "User registered successfully",
      201
    );
  }
);

// ========================================
// LOGIN
// ========================================

const login = asyncHandler(
  async (req, res) => {
    const {
      email,
      password,
    } = req.body;

    if (
      !email ||
      !password
    ) {
      throw new ApiError(
        400,
        "Email and password are required"
      );
    }

    const result =
      await authService.loginUser({
        email,
        password,
      });

    // ========================================
    // STORE REFRESH TOKEN IN HTTPONLY COOKIE
    // ========================================

    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      refreshCookieOptions
    );

    // ========================================
    // REFRESH TOKEN IS NOT SENT IN JSON
    // ========================================

    return sendSuccess(
      res,
      {
        token:
          result.token,

        user:
          result.user,
      },
      "Login successful"
    );
  }
);

// ========================================
// REFRESH ACCESS TOKEN
// ========================================

const refresh = asyncHandler(
  async (req, res) => {

    // ========================================
    // GET REFRESH TOKEN FROM COOKIE
    // ========================================

    const refreshToken =
      req.cookies?.[
        REFRESH_TOKEN_COOKIE
      ];

    if (!refreshToken) {
      throw new ApiError(
        401,
        "Refresh token is required"
      );
    }

    // ========================================
    // ROTATE TOKEN
    // ========================================

    const result =
      await authService.refreshAccessToken(
        refreshToken
      );

    // ========================================
    // STORE NEW REFRESH TOKEN
    // ========================================

    res.cookie(
      REFRESH_TOKEN_COOKIE,
      result.refreshToken,
      refreshCookieOptions
    );

    // ========================================
    // ONLY ACCESS TOKEN IN RESPONSE
    // ========================================

    return sendSuccess(
      res,
      {
        token:
          result.token,
      },
      "Access token refreshed successfully"
    );
  }
);

// ========================================
// CURRENT USER
// ========================================

const me = asyncHandler(
  async (req, res) => {
    const user =
      await authService.getCurrentUser(
        req.user.userId
      );

    return sendSuccess(
      res,
      user,
      "Current user fetched successfully"
    );
  }
);

// ========================================
// LOGOUT
// ========================================

const logout = asyncHandler(
  async (req, res) => {

    // ========================================
    // GET REFRESH TOKEN FROM COOKIE
    // ========================================

    const refreshToken =
      req.cookies?.[
        REFRESH_TOKEN_COOKIE
      ];

    // ========================================
    // REVOKE REFRESH TOKEN
    // ========================================

    if (refreshToken) {
      await authService.logoutUser(
        refreshToken
      );
    }

    // ========================================
    // CLEAR COOKIE
    // ========================================

    res.clearCookie(
      REFRESH_TOKEN_COOKIE,
      {
        httpOnly: true,

        secure:
          process.env.NODE_ENV ===
          "production",

        sameSite:
          process.env.NODE_ENV ===
          "production"
            ? "strict"
            : "lax",

        path: "/api/auth",
      }
    );

    return sendSuccess(
      res,
      null,
      "Logged out successfully"
    );
  }
);

// ========================================
// CSRF TOKEN
// ========================================
//
// GET /api/auth/csrf-token
//
// Frontend is endpoint ko call karega
// aur returned token ko subsequent
// POST/PATCH/DELETE requests mein
// X-CSRF-Token header ke through bhejega.
// ========================================

const csrfToken = asyncHandler(
  async (req, res) => {

    const token =
      generateCsrfToken(
        req,
        res
      );

    return sendSuccess(
      res,
      {
        csrfToken:
          token,
      },
      "CSRF token generated successfully"
    );
  }
);

// ========================================
// EXPORT
// ========================================

module.exports = {
  register,
  login,
  refresh,
  me,
  logout,
  csrfToken,
};