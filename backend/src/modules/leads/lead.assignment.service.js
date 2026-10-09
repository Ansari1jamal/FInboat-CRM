const { prisma } = require("../../config/db");

const ApiError = require("../../utils/ApiError");

const {
  createAuditLog,
} = require("../audit/audit.service");

// ========================================
// ASSIGN / TRANSFER LEAD
// ========================================

const assignLead = async ({
  leadId,
  toUserId,
  toTeamId,
  reason,
  user,
}) => {
  // --------------------------------
  // 1. Find Lead
  // --------------------------------

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // --------------------------------
  // 2. Find Target User
  // --------------------------------

  const targetUser = await prisma.user.findUnique({
    where: {
      id: toUserId,
    },
  });

  if (!targetUser) {
    throw new ApiError(404, "Target user not found");
  }

  // --------------------------------
  // 3. Target must be Telecaller
  // --------------------------------

  if (targetUser.role !== "TELECALLER") {
    throw new ApiError(
      400,
      "Lead can only be assigned to a telecaller"
    );
  }

  // --------------------------------
  // 4. Target must be active
  // --------------------------------

  if (!targetUser.isActive) {
    throw new ApiError(
      400,
      "Lead cannot be assigned to inactive telecaller"
    );
  }

  // --------------------------------
  // 5. Role-based Scope Validation
  // --------------------------------

  if (user.role === "MANAGER") {
    if (targetUser.managerId !== user.userId) {
      throw new ApiError(
        403,
        "You can only assign leads to your team members"
      );
    }
  }

  if (user.role === "TL") {
    if (targetUser.tlId !== user.userId) {
      throw new ApiError(
        403,
        "You can only assign leads to your telecallers"
      );
    }
  }

  if (user.role === "TELECALLER") {
    throw new ApiError(
      403,
      "Telecaller cannot assign leads"
    );
  }

  // --------------------------------
  // 6. Team Validation
  // --------------------------------

  let targetTeamId = toTeamId || null;

  if (targetTeamId) {
    const team = await prisma.team.findUnique({
      where: {
        id: targetTeamId,
      },
    });

    if (!team) {
      throw new ApiError(404, "Target team not found");
    }
  }

  // --------------------------------
  // 7. Update + Transfer + Audit
  // --------------------------------

  const result = await prisma.$transaction(async (tx) => {
    // Update Lead
    const updatedLead = await tx.lead.update({
      where: {
        id: leadId,
      },

      data: {
        assignedToId: targetUser.id,
        assignedTeamId: targetTeamId,
      },
    });

    // Create Transfer History
    await tx.leadTransfer.create({
      data: {
        leadId,

        fromUserId: lead.assignedToId || null,
        toUserId: targetUser.id,

        fromTeamId: lead.assignedTeamId || null,
        toTeamId: targetTeamId,

        transferredById: user.userId,

        reason: reason || null,
      },
    });

    // Create Audit Log
    await createAuditLog({
      db: tx,
      userId: user.userId,
      action: "TRANSFER",
      module: "LEAD",
      recordId: leadId,
      metadata: {
        fromUserId: lead.assignedToId || null,
        toUserId: targetUser.id,
        fromTeamId: lead.assignedTeamId || null,
        toTeamId: targetTeamId,
        reason: reason || null,
      },
    });

    return updatedLead;
  });

  return result;
};

// ========================================
// GET TRANSFER HISTORY
// ========================================

const getLeadTransfers = async ({
  leadId,
  user,
}) => {
  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },

    select: {
      id: true,
      assignedToId: true,
      assignedTeamId: true,
    },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  const transfers = await prisma.leadTransfer.findMany({
    where: {
      leadId,
    },

    include: {
      fromUser: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },

      toUser: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },

      transferredBy: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },

      fromTeam: {
        select: {
          id: true,
          name: true,
        },
      },

      toTeam: {
        select: {
          id: true,
          name: true,
        },
      },
    },

    orderBy: {
      transferredAt: "desc",
    },
  });

  return transfers;
};

// ========================================
// EXPORTS
// ========================================

module.exports = {
  assignLead,
  getLeadTransfers,
};