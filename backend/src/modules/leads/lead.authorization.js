const {
  prisma,
} = require("../../config/db");

const ApiError =
  require("../../utils/ApiError");

// ========================================
// CHECK LEAD ASSIGNMENT AUTHORIZATION
// ========================================

const canAssignLeadToUser = async ({
  actorId,
  actorRole,
  targetUserId,
}) => {
  // ========================================
  // TARGET USER
  // ========================================

  const targetUser =
    await prisma.user.findUnique({
      where: {
        id: targetUserId,
      },

      select: {
        id: true,
        role: true,
        isActive: true,
        managerId: true,
        tlId: true,
      },
    });

  if (!targetUser) {
    throw new ApiError(
      404,
      "Target user not found"
    );
  }

  // ========================================
  // ACTIVE USER CHECK
  // ========================================

  if (!targetUser.isActive) {
    throw new ApiError(
      400,
      "Target user is inactive"
    );
  }

  // ========================================
  // ONLY TELECALLER CAN BE ASSIGNED
  // ========================================

  if (
    targetUser.role !==
    "TELECALLER"
  ) {
    throw new ApiError(
      400,
      "Lead can only be assigned to a telecaller"
    );
  }

  // ========================================
  // ADMIN
  // ========================================

  if (
    actorRole === "ADMIN"
  ) {
    return true;
  }

  // ========================================
  // MANAGER
  // ========================================

  if (
    actorRole === "MANAGER"
  ) {
    if (
      targetUser.managerId !==
      actorId
    ) {
      throw new ApiError(
        403,
        "You can only assign leads to telecallers in your team"
      );
    }

    return true;
  }

  // ========================================
  // TL
  // ========================================

  if (
    actorRole === "TL"
  ) {
    if (
      targetUser.tlId !==
      actorId
    ) {
      throw new ApiError(
        403,
        "You can only assign leads to telecallers in your team"
      );
    }

    return true;
  }

  // ========================================
  // OTHER ROLES
  // ========================================

  throw new ApiError(
    403,
    "You are not allowed to assign leads"
  );
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  canAssignLeadToUser,
};