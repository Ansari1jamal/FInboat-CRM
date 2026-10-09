const jwt = require("jsonwebtoken");

const env = require("../../config/env");

// ========================================
// GENERATE ACCESS TOKEN
// ========================================

const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    env.JWT_SECRET,
    {
      expiresIn:
        env.JWT_EXPIRES_IN,
    }
  );
};

module.exports = {
  generateAccessToken,
};