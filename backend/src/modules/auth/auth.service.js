const bcrypt =
  require("bcryptjs");

const {
  createRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
} = require("./auth.refresh-token.service");

const {
  generateAccessToken,
} = require("./auth.token.service");

const {
  safeUserSelect,
} = require("./auth.select");

const {
  prisma,
} = require("../../config/db");

const ApiError =
  require("../../utils/ApiError");

// ========================================
// REFRESH ACCESS TOKEN
// ========================================

const refreshAccessToken = async (
  refreshToken
) => {

  // ========================================
  // VERIFY OLD REFRESH TOKEN
  // ========================================

  const storedToken =
    await verifyRefreshToken(
      refreshToken
    );

  // ========================================
  // REVOKE OLD TOKEN
  // ========================================

  await revokeRefreshToken(
    refreshToken
  );

  // ========================================
  // GENERATE NEW ACCESS TOKEN
  // ========================================

  const accessToken =
    generateAccessToken(
      storedToken.user
    );

  // ========================================
  // GENERATE NEW REFRESH TOKEN
  // ========================================

  const newRefreshToken =
    await createRefreshToken(
      storedToken.user.id
    );

  return {
    token: accessToken,

    refreshToken:
      newRefreshToken,
  };
};

// ========================================
// REGISTER USER
// ========================================

const registerUser = async ({
  name,
  email,
  phone,
  password,
  role,
}) => {

  // ========================================
  // CHECK EXISTING USER
  // ========================================

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email,
      },
    });

  if (existingUser) {
    throw new ApiError(
      409,
      "User with this email already exists"
    );
  }

  // ========================================
  // HASH PASSWORD
  // ========================================

  const passwordHash =
    await bcrypt.hash(
      password,
      12
    );

  // ========================================
  // CREATE USER
  // ========================================

  const user =
    await prisma.user.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        role,
      },

      select:
        safeUserSelect,
    });

  return user;
};

// ========================================
// LOGIN USER
// ========================================

const loginUser = async ({
  email,
  password,
}) => {

  // ========================================
  // FIND USER
  // ========================================

  const user =
    await prisma.user.findUnique({
      where: {
        email,
      },

      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        passwordHash: true,
      },
    });

  // ========================================
  // INVALID USER
  // ========================================

  if (!user) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  // ========================================
  // CHECK ACTIVE STATUS
  // ========================================

  if (!user.isActive) {
    throw new ApiError(
      403,
      "Your account is inactive"
    );
  }

  // ========================================
  // VERIFY PASSWORD
  // ========================================

  const isPasswordCorrect =
    await bcrypt.compare(
      password,
      user.passwordHash
    );

  if (!isPasswordCorrect) {
    throw new ApiError(
      401,
      "Invalid email or password"
    );
  }

  // ========================================
  // ACCESS TOKEN
  // ========================================

  const token =
    generateAccessToken(
      user
    );

  // ========================================
  // REFRESH TOKEN
  // ========================================

  const refreshToken =
    await createRefreshToken(
      user.id
    );

  // ========================================
  // RETURN
  // ========================================
  //
  // IMPORTANT:
  // Service refreshToken return karta hai
  // controller ise HttpOnly cookie mein
  // store karega.
  //
  // Client ko JSON response mein
  // refreshToken nahi milega.
  // ========================================

  return {
    token,

    refreshToken,

    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
    },
  };
};

// ========================================
// GET CURRENT USER
// ========================================

const getCurrentUser = async (
  userId
) => {

  const user =
    await prisma.user.findUnique({
      where: {
        id: userId,
      },

      select:
        safeUserSelect,
    });

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  return user;
};

// ========================================
// LOGOUT USER
// ========================================

const logoutUser = async (
  refreshToken
) => {

  if (refreshToken) {
    await revokeRefreshToken(
      refreshToken
    );
  }

  return {
    success: true,
  };
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  getCurrentUser,
  logoutUser,
};