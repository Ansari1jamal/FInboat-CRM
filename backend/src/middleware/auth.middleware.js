const jwt = require("jsonwebtoken");

const env = require("../config/env");
const ApiError = require("../utils/ApiError");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new ApiError(
        401,
        "Authorization token is required"
      );
    }

    if (!authHeader.startsWith("Bearer ")) {
      throw new ApiError(
        401,
        "Invalid authorization format"
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      throw new ApiError(
        401,
        "Authorization token is missing"
      );
    }

    const decoded = jwt.verify(
      token,
      env.JWT_SECRET
    );

    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(
        new ApiError(401, "Token has expired")
      );
    }

    if (error.name === "JsonWebTokenError") {
      return next(
        new ApiError(401, "Invalid token")
      );
    }

    next(error);
  }
};

module.exports = authMiddleware;