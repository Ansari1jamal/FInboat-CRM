const crypto = require("crypto");

const {
  prisma,
} = require("../../config/db");

const env = require("../../config/env");

const ApiError = require("../../utils/ApiError");

// ========================================
// REFRESH TOKEN EXPIRY
// ========================================

const REFRESH_TOKEN_DAYS = 30;

// ========================================
// GENERATE RAW REFRESH TOKEN
// ========================================

const generateRefreshToken = () => {
  return crypto
    .randomBytes(64)
    .toString("hex");
};

// ========================================
// HASH REFRESH TOKEN
// ========================================

const hashRefreshToken = (
  token
) => {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
};

// ========================================
// CREATE REFRESH TOKEN
// ========================================

const createRefreshToken = async (
  userId
) => {
  const rawToken =
    generateRefreshToken();

  const tokenHash =
    hashRefreshToken(
      rawToken
    );

  const expiresAt =
    new Date();

  expiresAt.setDate(
    expiresAt.getDate() +
      REFRESH_TOKEN_DAYS
  );

  await prisma.refreshToken.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return rawToken;
};

// ========================================
// VERIFY REFRESH TOKEN
// ========================================

const verifyRefreshToken =
  async (rawToken) => {
    if (!rawToken) {
      throw new ApiError(
        401,
        "Refresh token is required"
      );
    }

    const tokenHash =
      hashRefreshToken(
        rawToken
      );

    const refreshToken =
      await prisma.refreshToken.findUnique({
        where: {
          tokenHash,
        },

        include: {
          user: true,
        },
      });

    if (!refreshToken) {
      throw new ApiError(
        401,
        "Invalid refresh token"
      );
    }

    if (
      refreshToken.revokedAt
    ) {
      throw new ApiError(
        401,
        "Refresh token has been revoked"
      );
    }

    if (
      refreshToken.expiresAt <=
      new Date()
    ) {
      throw new ApiError(
        401,
        "Refresh token has expired"
      );
    }

    if (
      !refreshToken.user.isActive
    ) {
      throw new ApiError(
        403,
        "Your account is inactive"
      );
    }

    return refreshToken;
  };

// ========================================
// REVOKE REFRESH TOKEN
// ========================================

const revokeRefreshToken =
  async (rawToken) => {
    if (!rawToken) {
      return;
    }

    const tokenHash =
      hashRefreshToken(
        rawToken
      );

    await prisma.refreshToken.updateMany({
      where: {
        tokenHash,
        revokedAt: null,
      },

      data: {
        revokedAt:
          new Date(),
      },
    });
  };

// ========================================
// EXPORT
// ========================================

module.exports = {
  generateRefreshToken,
  hashRefreshToken,
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
};