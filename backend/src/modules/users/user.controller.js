const userService = require("./user.service");

const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/response");
const ApiError = require("../../utils/ApiError");

// ======================================
// CREATE
// ======================================

const createUser = asyncHandler(
  async (req, res) => {
    const {
      name,
      email,
      phone,
      password,
      role,
      managerId,
      tlId,
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
      await userService.createUser({
        name,
        email,
        phone,
        password,
        role,
        managerId,
        tlId,
      });

    return sendSuccess(
      res,
      user,
      "User created successfully",
      201
    );
  }
);

// ======================================
// GET ALL
// ======================================

const getUsers = asyncHandler(
  async (req, res) => {
    const { role, search } = req.query;

    let isActive;

    if (req.query.isActive !== undefined) {
      isActive =
        req.query.isActive === "true";
    }

    const users =
      await userService.getUsers({
        role,
        isActive,
        search,
      });

    return sendSuccess(
      res,
      users,
      "Users fetched successfully"
    );
  }
);

// ======================================
// GET BY ID
// ======================================

const getUserById = asyncHandler(
  async (req, res) => {
    const user =
      await userService.getUserById(
        req.params.id
      );

    return sendSuccess(
      res,
      user,
      "User fetched successfully"
    );
  }
);

// ======================================
// UPDATE
// ======================================

const updateUser = asyncHandler(
  async (req, res) => {
    const user =
      await userService.updateUser(
        req.params.id,
        req.body
      );

    return sendSuccess(
      res,
      user,
      "User updated successfully"
    );
  }
);

// ======================================
// STATUS
// ======================================

const updateUserStatus =
  asyncHandler(async (req, res) => {
    const { isActive } = req.body;

    if (
      typeof isActive !== "boolean"
    ) {
      throw new ApiError(
        400,
        "isActive must be true or false"
      );
    }

    const user =
      await userService.updateUserStatus(
        req.params.id,
        isActive
      );

    return sendSuccess(
      res,
      user,
      "User status updated successfully"
    );
  });

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateUserStatus,
};