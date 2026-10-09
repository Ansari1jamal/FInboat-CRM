const { prisma } = require("../../config/db");
const ApiError = require("../../utils/ApiError");

const getLeadTimeline = async ({ leadId, user }) => {
  // --------------------------------
  // 1. Check lead exists
  // --------------------------------

  const lead = await prisma.lead.findUnique({
    where: {
      id: leadId,
    },
    include: {
      assignedTo: {
        select: {
          id: true,
          name: true,
          role: true,
          managerId: true,
          tlId: true,
        },
      },
    },
  });

  if (!lead) {
    throw new ApiError(404, "Lead not found");
  }

  // --------------------------------
  // 2. Role based access
  // --------------------------------

  if (user.role === "TELECALLER") {
    if (lead.assignedToId !== user.userId) {
      throw new ApiError(
        403,
        "You are not allowed to view this lead"
      );
    }
  }

  if (user.role === "TL") {
    if (
      !lead.assignedTo ||
      lead.assignedTo.tlId !== user.userId
    ) {
      throw new ApiError(
        403,
        "You are not allowed to view this lead"
      );
    }
  }

  if (user.role === "MANAGER") {
    if (
      !lead.assignedTo ||
      lead.assignedTo.managerId !== user.userId
    ) {
      throw new ApiError(
        403,
        "You are not allowed to view this lead"
      );
    }
  }

  // ADMIN can see everything

  // --------------------------------
  // 3. Fetch all activities
  // --------------------------------

  const [
    statusHistory,
    callLogs,
    followUps,
    transfers,
    documents,
    applications,
  ] = await Promise.all([
    // STATUS HISTORY
    prisma.leadStatusHistory.findMany({
      where: {
        leadId,
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
    }),

    // CALL LOGS
    prisma.callLog.findMany({
      where: {
        leadId,
      },
      include: {
        telecaller: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        calledAt: "desc",
      },
    }),

    // FOLLOW UPS
    prisma.followUp.findMany({
      where: {
        leadId,
      },
      include: {
        scheduledUser: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // TRANSFERS
    prisma.leadTransfer.findMany({
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
    }),

    // DOCUMENTS AND THEIR STATUS HISTORY
    prisma.document.findMany({
      where: {
        leadId,
      },
      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        application: {
          select: {
            applicationNumber: true,
          },
        },
        statusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    // APPLICATIONS, THEIR STATUS HISTORY, AND DISBURSEMENTS
    prisma.loanApplication.findMany({
      where: {
        leadId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        ApplicationStatusHistory: {
          include: {
            changedBy: {
              select: {
                id: true,
                name: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        loan_accounts: {
          select: {
            id: true,
            disbursedAmount: true,
            disbursedAt: true,
            Lender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  // --------------------------------
  // 4. Convert everything
  //    into common timeline format
  // --------------------------------

  const timeline = [];

  // --------------------------------
  // LEAD CREATED
  // --------------------------------

  timeline.push({
    type: "LEAD_CREATED",
    id: `lead-created-${lead.id}`,
    leadId: lead.id,
    title: "Lead Created",
    description: `Lead created for ${lead.customerName}`,
    createdAt: lead.createdAt,
    actor: null,
    metadata: {
      loanType: lead.loanType,
      status: lead.status,
    },
  });

  // --------------------------------
  // STATUS HISTORY
  // --------------------------------

  statusHistory.forEach((item) => {
    timeline.push({
      type: "STATUS_CHANGE",

      id: item.id,

      leadId: item.leadId,

      title: `Status changed to ${item.newStatus}`,

      description: `Lead status changed from ${
        item.oldStatus || "NONE"
      } to ${item.newStatus}`,

      createdAt: item.changedAt,

      actor: item.changedUser,

      metadata: {
        fromStatus: item.oldStatus,
        toStatus: item.newStatus,
      },
    });
  });

  // --------------------------------
  // CALL LOGS
  // --------------------------------

  callLogs.forEach((item) => {
    timeline.push({
      type: "CALL",

      id: item.id,

      leadId: item.leadId,

      title: `Call ${item.callStatus}`,

      description: item.remarks || "No remarks",

      createdAt: item.calledAt,

      actor: item.telecaller,

      metadata: {
        callStatus: item.callStatus,
      },
    });
  });

  // --------------------------------
  // FOLLOW UPS
  // --------------------------------

  followUps.forEach((item) => {
    timeline.push({
      type: "FOLLOW_UP",

      id: item.id,

      leadId: item.leadId,

      title: `Follow-up ${item.status}`,

      description: item.notes || "No notes",

      createdAt: item.createdAt,

      actor: item.scheduledUser,

      metadata: {
        followUpDate: item.followUpDate,
        followUpTime: item.followUpTime,
        status: item.status,
      },
    });
  });

  // --------------------------------
  // TRANSFERS
  // --------------------------------

  transfers.forEach((item) => {
    timeline.push({
      type: "TRANSFER",

      id: item.id,

      leadId: item.leadId,

      title: "Lead transferred",

      description:
        item.reason || "Lead assignment changed",

      createdAt: item.transferredAt,

      actor: item.transferredBy,

      metadata: {
        fromUser: item.fromUser,
        toUser: item.toUser,
        fromTeam: item.fromTeam,
        toTeam: item.toTeam,
      },
    });
  });

  // --------------------------------
  // DOCUMENTS AND DOCUMENT HISTORY
  // --------------------------------

  documents.forEach((document) => {
    if (document.uploadedAt || document.fileName) {
      timeline.push({
        type: "DOCUMENT_UPLOADED",
        id: `document-uploaded-${document.id}`,
        leadId: document.leadId,
        title: "Document Uploaded",
        description: `${document.docType} document uploaded`,
        createdAt: document.uploadedAt || document.createdAt,
        actor: document.uploadedBy,
        metadata: {
          documentType: document.docType,
          fileName: document.fileName,
          applicationNumber: document.application?.applicationNumber,
        },
      });
    }

    document.statusHistory.forEach((item) => {
      const type =
        item.toStatus === "VERIFIED"
          ? "DOCUMENT_VERIFIED"
          : item.toStatus === "REJECTED"
            ? "DOCUMENT_REJECTED"
            : "DOCUMENT_STATUS";

      timeline.push({
        type,
        id: item.id,
        leadId: document.leadId,
        title: `Document ${item.toStatus.toLowerCase()}`,
        description:
          item.rejectionReason ||
          `Document status changed from ${item.fromStatus || "NONE"} to ${item.toStatus}`,
        createdAt: item.createdAt,
        actor: item.changedBy,
        metadata: {
          documentType: document.docType,
          fromStatus: item.fromStatus,
          toStatus: item.toStatus,
          applicationNumber: document.application?.applicationNumber,
        },
      });
    });
  });

  // --------------------------------
  // APPLICATIONS AND APPLICATION HISTORY
  // --------------------------------

  applications.forEach((application) => {
    timeline.push({
      type: "APPLICATION_CREATED",
      id: `application-created-${application.id}`,
      leadId: application.leadId,
      title: "Application Created",
      description: `Application ${application.applicationNumber} created`,
      createdAt: application.createdAt,
      actor: application.createdBy,
      metadata: {
        applicationNumber: application.applicationNumber,
        status: application.status,
      },
    });

    application.ApplicationStatusHistory.forEach((item) => {
      if (
        item.fromStatus === null &&
        item.toStatus === "DRAFT" &&
        item.note === "Application created"
      ) {
        return;
      }

      timeline.push({
        type: "APPLICATION_STATUS",
        id: item.id,
        leadId: application.leadId,
        title: `Application ${item.toStatus.toLowerCase()}`,
        description:
          item.note ||
          `Application status changed from ${item.fromStatus || "NONE"} to ${item.toStatus}`,
        createdAt: item.createdAt,
        actor: item.changedBy,
        metadata: {
          applicationNumber: application.applicationNumber,
          fromStatus: item.fromStatus,
          toStatus: item.toStatus,
        },
      });
    });

    if (application.loan_accounts?.disbursedAt) {
      timeline.push({
        type: "LOAN_DISBURSED",
        id: `loan-disbursed-${application.loan_accounts.id}`,
        leadId: application.leadId,
        title: "Loan Disbursed",
        description: `Loan disbursed for application ${application.applicationNumber}`,
        createdAt: application.loan_accounts.disbursedAt,
        actor: null,
        metadata: {
          applicationNumber: application.applicationNumber,
          disbursedAmount: application.loan_accounts.disbursedAmount,
          lender: application.loan_accounts.Lender?.name,
        },
      });
    }
  });

  // --------------------------------
  // 5. Sort latest first
  // --------------------------------

  timeline.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  return timeline;
};

module.exports = {
  getLeadTimeline,
};