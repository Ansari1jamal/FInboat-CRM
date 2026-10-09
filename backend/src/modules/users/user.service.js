const bcrypt = require("bcryptjs");

const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

const userSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  role: true,
  managerId: true,
  tlId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
};

// ======================================
// CREATE USER
// ======================================

const createUser = async ({
  name,
  email,
  phone,
  password,
  role,
  managerId,
  tlId,
}) => {
  const existingUser = await prisma.user.findUnique({
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

  // Validate manager
  if (managerId) {
    const manager = await prisma.user.findUnique({
      where: {
        id: managerId,
      },
    });

    if (!manager) {
      throw new ApiError(
        404,
        "Manager not found"
      );
    }

    if (manager.role !== "MANAGER") {
      throw new ApiError(
        400,
        "Selected user is not a manager"
      );
    }
  }

  // Validate TL
  if (tlId) {
    const tl = await prisma.user.findUnique({
      where: {
        id: tlId,
      },
    });

    if (!tl) {
      throw new ApiError(
        404,
        "TL not found"
      );
    }

    if (tl.role !== "TL") {
      throw new ApiError(
        400,
        "Selected user is not a TL"
      );
    }
  }

  // Role hierarchy validation
  if (role === "MANAGER") {
    if (managerId || tlId) {
      throw new ApiError(
        400,
        "Manager cannot have managerId or tlId"
      );
    }
  }

  if (role === "TL") {
    if (!managerId) {
      throw new ApiError(
        400,
        "TL must belong to a manager"
      );
    }

    if (tlId) {
      throw new ApiError(
        400,
        "TL cannot have another TL"
      );
    }
  }

  if (role === "TELECALLER") {
    if (!tlId) {
      throw new ApiError(
        400,
        "Telecaller must belong to a TL"
      );
    }
  }

  const passwordHash = await bcrypt.hash(
    password,
    12
  );

  const user = await prisma.user.create({
    data: {
      name,
      email,
      phone,
      passwordHash,
      role,
      managerId,
      tlId,
    },
    select: userSelect,
  });

  return user;
};

// ======================================
// GET ALL USERS
// ======================================

const getUsers = async ({
  role,
  isActive,
  search,
}) => {
  const where = {};

  if (role) {
    where.role = role;
  }

  if (typeof isActive === "boolean") {
    where.isActive = isActive;
  }

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        email: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        phone: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    select: userSelect,
    orderBy: {
      createdAt: "desc",
    },
  });

  return users;
};

// ======================================
// GET USER BY ID
// ======================================

const getUserById = async (id) => {
  const user = await prisma.user.findUnique({
    where: {
      id,
    },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  return user;
};

// ======================================
// UPDATE USER
// ======================================

const updateUser = async (
  id,
  {
    name,
    phone,
    role,
    managerId,
    tlId,
  }
) => {
  const existingUser =
    await prisma.user.findUnique({
      where: {
        id,
      },
    });

  if (!existingUser) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  if (
    existingUser.role === "ADMIN" &&
    role &&
    role !== "ADMIN"
  ) {
    throw new ApiError(
      400,
      "Admin role cannot be changed"
    );
  }

  const user = await prisma.user.update({
    where: {
      id,
    },
    data: {
      name,
      phone,
      role,
      managerId,
      tlId,
    },
    select: userSelect,
  });

  return user;
};

// ======================================
// ACTIVATE / DEACTIVATE USER
// ======================================

const updateUserStatus = async (
  id,
  isActive
) => {
  const user =
    await prisma.user.findUnique({
      where: {
        id,
      },
    });

  if (!user) {
    throw new ApiError(
      404,
      "User not found"
    );
  }

  if (user.role === "ADMIN") {
    throw new ApiError(
      400,
      "Admin account cannot be deactivated"
    );
  }

  return prisma.user.update({
    where: {
      id,
    },
    data: {
      isActive,
    },
    select: userSelect,
  });
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};