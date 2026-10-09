const { prisma } = require("../../config/db");

const ApiError = require("../../utils/ApiError");

const { CALL_STATUS } = require("./call.status");

const createCallLog = async ({
  leadId,
  callStatus,
  remarks,
  user,
}) => {
  // -----------------------------
  // 1. Validate Call Status
  // -----------------------------

  if (!Object.values(CALL_STATUS).includes(callStatus)) {
    throw new ApiError(
      400,
      "Invalid call status"
    );
  }

  // -----------------------------
  // 2. Find Lead
  // -----------------------------

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
  });

  if (!lead) {
    throw new ApiError(
      404,
      "Lead not found"
    );
  }

  // -----------------------------
  // 3. Check Telecaller Access
  // -----------------------------

  if (user.role === "TELECALLER") {
    if (lead.assignedToId !== user.userId) {
      throw new ApiError(
        403,
        "You can only log calls for your assigned leads"
      );
    }
  }

  // -----------------------------
  // 4. Create Call Log
  // -----------------------------

  const callLog = await prisma.callLog.create({
    data: {
      leadId,

      telecallerId: user.userId,

      callStatus,

      remarks: remarks || null,

      calledAt: new Date(),
    },
  });

  return callLog;
};

const getLeadCallLogs = async ({
  leadId,
  user,
}) => {
  const lead = await prisma.lead.findUnique({
    where: { id: leadId },
    select: { id: true, assignedToId: true },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  if (
    user.role === "TELECALLER" &&
    lead.assignedToId !== user.userId
  ) {
    throw new ApiError(
      403,
      "You can only view calls for your assigned leads"
    );
  }

  return prisma.callLog.findMany({
    where: { leadId },
    include: {
      telecaller: {
        select: { id: true, name: true, role: true },
      },
    },
    orderBy: { calledAt: "desc" },
  });
};

module.exports = {
  createCallLog,
  getLeadCallLogs,
};