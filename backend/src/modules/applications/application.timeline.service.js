
const { prisma } = require("../../config/db");

const getApplicationTimeline = async ({
  applicationId,
  user,
}) => {
  const application =
    await prisma.loanApplication.findUnique({
      where: {
        id: applicationId,
      },

      include: {
        lead: {
          include: {
            assignedTo: true,
          },
        },

        documents: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
                role: true,
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
            },
          },
        },
      },
    });

  if (!application) {
    throw new Error("Application not found");
  }

  const lead = application.lead;

  // =========================
  // ROLE SCOPE
  // =========================

  if (user.role === "TELECALLER") {
    if (lead.assignedToId !== user.userId) {
      throw new Error("Access denied");
    }
  }

  if (user.role === "TL") {
    if (
      !lead.assignedTo ||
      lead.assignedTo.tlId !== user.userId
    ) {
      throw new Error("Access denied");
    }
  }

  if (user.role === "MANAGER") {
    if (
      !lead.assignedTo ||
      lead.assignedTo.managerId !== user.userId
    ) {
      throw new Error("Access denied");
    }
  }

  const events = [];

  // =========================
  // APPLICATION CREATED
  // =========================

  events.push({
    type: "APPLICATION_CREATED",

    id: application.id,

    title: "Application Created",

    description:
      `Application ${application.applicationNumber} created`,

    createdAt: application.createdAt,

    metadata: {
      applicationNumber:
        application.applicationNumber,

      status: application.status,
    },
  });

  // =========================
  // APPLICATION LOGIN
  // =========================

  if (application.loginDate) {
    events.push({
      type: "APPLICATION_LOGIN",

      id: `${application.id}-login`,

      title: "Application Login",

      description:
        "Application moved to LOGIN",

      createdAt: application.loginDate,

      metadata: {},
    });
  }

  // =========================
  // APPLICATION APPROVED
  // =========================

  if (application.approvalDate) {
    events.push({
      type: "APPLICATION_APPROVED",

      id: `${application.id}-approved`,

      title: "Application Approved",

      description:
        "Loan application approved",

      createdAt: application.approvalDate,

      metadata: {
        sanctionedAmount:
          application.sanctionedAmount,
      },
    });
  }

  // =========================
  // APPLICATION DISBURSED
  // =========================

  if (application.disbursementDate) {
    events.push({
      type: "APPLICATION_DISBURSED",

      id: `${application.id}-disbursed`,

      title: "Loan Disbursed",

      description:
        "Loan amount disbursed",

      createdAt:
        application.disbursementDate,

      metadata: {
        disbursedAmount:
          application.disbursedAmount,
      },
    });
  }

  // =========================
  // DOCUMENT EVENTS
  // =========================

  for (const document of application.documents) {
    const documentType = document.docType;

    // Document uploaded
    events.push({
      type: "DOCUMENT_UPLOADED",

      id: document.id,

      title: "Document Uploaded",

      description:
        `${documentType} document uploaded`,

      createdAt: document.createdAt,

      metadata: {
        documentId: document.id,

        documentType: documentType,

        status: document.status,
      },

      actor: document.uploadedBy,
    });

    // Document status history
    for (const history of document.statusHistory) {
      let eventType;
      let title;
      let description;

      if (history.toStatus === "VERIFIED") {
        eventType = "DOCUMENT_VERIFIED";
        title = "Document Verified";
        description =
          `${documentType} verified`;
      } else if (
        history.toStatus === "REJECTED"
      ) {
        eventType = "DOCUMENT_REJECTED";
        title = "Document Rejected";
        description =
          `${documentType} rejected`;
      } else {
        // Other status changes
        eventType = "DOCUMENT_STATUS_CHANGED";
        title = "Document Status Changed";
        description =
          `${documentType} status changed to ${history.toStatus}`;
      }

      events.push({
        type: eventType,

        id: history.id,

        title,

        description,

        createdAt: history.createdAt,

        metadata: {
          documentId: document.id,

          documentType: documentType,

          fromStatus: history.fromStatus,

          toStatus: history.toStatus,

          rejectionReason:
            history.rejectionReason,
        },

        actor: history.changedBy,
      });
    }
  }

  // =========================
  // SORT TIMELINE
  // =========================

  events.sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  // =========================
  // RESPONSE
  // =========================

  return {
    application: {
      id: application.id,

      applicationNumber:
        application.applicationNumber,

      status: application.status,
    },

    events,
  };
};

module.exports = {
  getApplicationTimeline,
};

