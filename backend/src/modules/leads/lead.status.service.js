const { prisma } = require("../../config/db");

const ApiError = require("../../utils/ApiError");

const {
  canChangeStatus,
  LeadStatus,
} = require("./lead.status");

// ==========================================
// UPDATE LEAD STATUS
// =

const updateLeadStatus = async ({
  leadId,
  newStatus,
  note,
  user,
}) => {
  // -----------------------------
  // 1. Find Lead
  // -----------------------------

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },

    select: {
      id: true,
      status: true,
      assignedToId: true,
    },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // -----------------------------
  // 2. Validate Status
  // -----------------------------

  if (!Object.values(LeadStatus).includes(newStatus)) {
    throw new ApiError(
      400,
      "Invalid lead status"
    );
  }

  // -----------------------------
  // 3. Check Transition
  // -----------------------------

  if (
    !canChangeStatus(
      lead.status,
      newStatus
    )
  ) {
    throw new ApiError(
      400,
      `Cannot change status from ${lead.status} to ${newStatus}`
    );
  }

  // -----------------------------
  // 4. Update + History
  // -----------------------------

  const result = await prisma.$transaction(
    async (tx) => {
      const updatedLead =
        await tx.lead.update({
          where: {
            id: leadId,
          },

          data: {
            status: newStatus,
          },
        });

 // Create Status History

      await tx.leadStatusHistory.create({
        data: {
          leadId: leadId,
          oldStatus:lead.status,
          newStatus:newStatus,

        //   fromStatus: lead.status,

        //   toStatus: newStatus,

          changedBy: user.userId,

         note: note || null,
        },
      });

      return updatedLead;
    }
  );

  return result;
};

// ==========================================
// GET LEAD STATUS HISTORY
// ==========================================

const getLeadStatusHistory = async ({
  leadId,
}) => {

  // -----------------------------
  // 1. Check Lead
  // -----------------------------

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },

    select: {
      id: true,
    },
  });


  if (!lead) {
    throw new ApiError(
      404,
      "Lead not found"
    );
  }


  // -----------------------------
  // 2. Get Status History
  // -----------------------------

  const history =
    await prisma.leadStatusHistory.findMany({

      where: {
        leadId: leadId,
      },

      include: {

        changedUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },

      },

      orderBy: {
        changedAt: "desc",
      },
    });


  return history;
};


module.exports = {
  updateLeadStatus,
  getLeadStatusHistory,
};