const fs = require("fs");
const path = require("path");

const {
  prisma,
} = require("../../config/db");

const ApiError =
  require("../../utils/ApiError");

const {
  createAuditLog,
} = require("../audit/audit.service");

const {
  createNotificationOnce,
} = require("../notifications/notification.service");

const {
  canAccessLeadDocument,
  canVerifyDocument,
  canDeleteDocument,
} = require("./document.authorization");

// =====================================================
// ALLOWED DOCUMENT TYPES
// =====================================================

const ALLOWED_DOCUMENT_TYPES = [
  "AADHAAR",
  "PAN",
  "SALARY_SLIP",
  "BANK_STATEMENT",
  "PHOTO",
  "ADDRESS_PROOF",
  "IDENTITY_PROOF",
  "OTHER",
];

// =====================================================
// ALLOWED DOCUMENT STATUS
// =====================================================

const ALLOWED_DOCUMENT_STATUS = [
  "RECEIVED",
  "VERIFIED",
  "REJECTED",
];

// =====================================================
// CREATE DOCUMENT
// =====================================================

const createDocument = async ({
  leadId,
  applicationId = null,
  documentType,
  file,
  user,
}) => {
  // ===================================================
  // FILE VALIDATION
  // ===================================================

  if (!file) {
    throw new ApiError(
      400,
      "Document file is required"
    );
  }

  // ===================================================
  // DOCUMENT TYPE VALIDATION
  // ===================================================

  if (
    !ALLOWED_DOCUMENT_TYPES.includes(
      documentType
    )
  ) {
    throw new ApiError(
      400,
      "Invalid document type"
    );
  }

  // ===================================================
  // LEAD ACCESS AUTHORIZATION
  // ===================================================

  await canAccessLeadDocument({
    leadId,
    user,
  });

  // ===================================================
  // LEAD
  // ===================================================

  const lead =
    await prisma.lead.findUnique({
      where: {
        id: leadId,
      },

      select: {
        id: true,
        customerName: true,
        mobile: true,
        assignedToId: true,
      },
    });

  if (!lead) {
    throw new ApiError(
      404,
      "Lead not found"
    );
  }

  // ===================================================
  // APPLICATION VALIDATION
  // ===================================================

  if (applicationId) {
    const application =
      await prisma.loanApplication.findUnique({
        where: {
          id: applicationId,
        },

        select: {
          id: true,
          leadId: true,
        },
      });

    if (!application) {
      throw new ApiError(
        404,
        "Application not found"
      );
    }

    // Application must belong to same lead
    if (
      application.leadId !==
      leadId
    ) {
      throw new ApiError(
        400,
        "Application does not belong to this lead"
      );
    }
  }

  // ===================================================
  // FILE PATH VALIDATION
  // ===================================================

  if (!file.path) {
    throw new ApiError(
      400,
      "Uploaded file path is missing"
    );
  }

  // ===================================================
  // CREATE UPLOAD DIRECTORY
  // ===================================================

  const uploadDir =
    path.join(
      process.cwd(),
      "uploads",
      "documents"
    );

  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(
      uploadDir,
      {
        recursive: true,
      }
    );
  }

  // ===================================================
  // SAFE FILE NAME
  // =====================================================

  const originalExtension =
    path.extname(
      file.originalname || ""
    );

  const safeExtension =
    originalExtension
      .replace(/[^a-zA-Z0-9.]/g, "")
      .toLowerCase();

  const fileName =
    `${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 10)}${safeExtension}`;

  const filePath =
    path.join(
      uploadDir,
      fileName
    );

  // ===================================================
  // MOVE FILE
  // ===================================================

  try {
    fs.renameSync(
      file.path,
      filePath
    );
  } catch (error) {
    throw new ApiError(
      500,
      "Failed to store document file"
    );
  }

  // ===================================================
  // CREATE DOCUMENT RECORD
  // ===================================================

  let document;

  try {
    document =
      await prisma.document.create({
        data: {
          leadId,

          applicationId:
            applicationId || null,

          docType:
            documentType,

          status:
            "RECEIVED",

          fileName:
            file.originalname,

          filePath:
            filePath,

          mimeType:
            file.mimetype,

          fileSize:
            file.size,

          uploadedById:
            user.userId,
        },

        include: {
          uploadedBy: {
            select: {
              id: true,
              name: true,
              role: true,
            },
          },

          lead: {
            select: {
              id: true,
              customerName: true,
              mobile: true,
            },
          },

          application: {
            select: {
              id: true,
              applicationNumber: true,
              status: true,
            },
          },
        },
      });
  } catch (error) {
    // =================================================
    // ROLLBACK PHYSICAL FILE
    // =================================================

    try {
      if (
        fs.existsSync(filePath)
      ) {
        fs.unlinkSync(filePath);
      }
    } catch (deleteError) {
      console.error(
        "Failed to rollback uploaded file:",
        deleteError.message
      );
    }

    throw error;
  }

  // ===================================================
  // AUDIT LOG
  // ===================================================

  await createAuditLog({
    userId:
      user.userId,

    action:
      "CREATE",

    module:
      "DOCUMENT",

    recordId:
      document.id,

    metadata: {
      leadId:
        document.leadId,

      applicationId:
        document.applicationId,

      documentType:
        document.docType,

      fileName:
        document.fileName,
    },
  });

  return document;
};

// =====================================================
// GET DOCUMENT BY ID
// =====================================================

const getDocumentById = async ({
  documentId,
  user,
}) => {
  // ===================================================
  // DOCUMENT
  // ===================================================

  const document =
    await prisma.document.findUnique({
      where: {
        id: documentId,
      },

      include: {
        lead: {
          include: {
            assignedTo: true,
          },
        },

        application: true,

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

          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

  if (!document) {
    throw new ApiError(
      404,
      "Document not found"
    );
  }

  // ===================================================
  // ACCESS AUTHORIZATION
  // ===================================================

  await canAccessLeadDocument({
    leadId:
      document.leadId,

    user,
  });

  return document;
};

// =====================================================
// GET DOCUMENTS
// =====================================================

const getDocuments = async ({
  leadId,
  applicationId,
  status,
  user,
  page = 1,
  limit = 20,
}) => {
  // ===================================================
  // PAGINATION
  // ===================================================

  page = Math.max(
    Number(page) || 1,
    1
  );

  limit = Math.min(
    Math.max(
      Number(limit) || 20,
      1
    ),
    100
  );

  const skip =
    (page - 1) * limit;

  // ===================================================
  // STATUS VALIDATION
  // ===================================================

  if (
    status &&
    !ALLOWED_DOCUMENT_STATUS.includes(
      status
    )
  ) {
    throw new ApiError(
      400,
      "Invalid document status"
    );
  }

  // ===================================================
  // LEAD FILTER
  // ===================================================

  if (leadId) {
    await canAccessLeadDocument({
      leadId,
      user,
    });
  }

  // ===================================================
  // WHERE
  // ===================================================

  const where = {};

  // ===================================================
  // LEAD FILTER
  // ===================================================

  if (leadId) {
    where.leadId =
      leadId;
  }

  // ===================================================
  // APPLICATION FILTER
  // ===================================================

  if (applicationId) {
    where.applicationId =
      applicationId;
  }

  // ===================================================
  // STATUS FILTER
  // ===================================================

  if (status) {
    where.status =
      status;
  }

  // ===================================================
  // ROLE BASED ACCESS
  // ===================================================

  if (
    user.role ===
    "TELECALLER"
  ) {
    where.lead = {
      assignedToId:
        user.userId,
    };
  }

  if (
    user.role === "TL"
  ) {
    where.lead = {
      assignedTo: {
        tlId:
          user.userId,
      },
    };
  }

  if (
    user.role ===
    "MANAGER"
  ) {
    where.lead = {
      assignedTo: {
        managerId:
          user.userId,
      },
    };
  }

  // ===================================================
  // FETCH
  // ===================================================

  const [
    documents,
    total,
  ] = await Promise.all([
    prisma.document.findMany({
      where,

      skip,

      take: limit,

      orderBy: {
        createdAt:
          "desc",
      },

      include: {
        uploadedBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },

        lead: {
          select: {
            id: true,
            customerName: true,
            mobile: true,
            status: true,
          },
        },

        application: {
          select: {
            id: true,
            applicationNumber: true,
            status: true,
          },
        },
      },
    }),

    prisma.document.count({
      where,
    }),
  ]);

  // ===================================================
  // PAGINATION
  // ===================================================

  const totalPages =
    Math.ceil(
      total / limit
    );

  return {
    documents,

    pagination: {
      page,

      limit,

      total,

      totalPages,

      hasNextPage:
        page < totalPages,

      hasPreviousPage:
        page > 1,
    },
  };
};

// =====================================================
// UPDATE DOCUMENT STATUS
// =====================================================

const updateDocumentStatus = async ({
  documentId,
  status,
  rejectionReason,
  user,
}) => {
  // ===================================================
  // STATUS VALIDATION
  // ===================================================

  if (
    !ALLOWED_DOCUMENT_STATUS.includes(
      status
    )
  ) {
    throw new ApiError(
      400,
      "Invalid document status"
    );
  }

  // ===================================================
  // REJECTION VALIDATION
  // ===================================================

  if (
    status ===
      "REJECTED" &&
    !rejectionReason?.trim()
  ) {
    throw new ApiError(
      400,
      "Rejection reason is required"
    );
  }

  // ===================================================
  // GET DOCUMENT
  // ===================================================

  const document =
    await prisma.document.findUnique({
      where: {
        id: documentId,
      },

      include: {
        lead: {
          include: {
            assignedTo: true,
          },
        },

        application: true,
      },
    });

  if (!document) {
    throw new ApiError(
      404,
      "Document not found"
    );
  }

  // ===================================================
  // VERIFICATION AUTHORIZATION
  // ===================================================

  await canVerifyDocument({
    documentId,
    user,
  });

  // ===================================================
  // SAME STATUS CHECK
  // ===================================================

  if (
    document.status ===
    status
  ) {
    throw new ApiError(
      400,
      `Document is already ${status}`
    );
  }

  // ===================================================
  // UPDATE DOCUMENT + HISTORY
  // ===================================================

  const updatedDocument =
    await prisma.$transaction(
      async (tx) => {
        // =============================================
        // UPDATE DOCUMENT
        // =============================================

        const updated =
          await tx.document.update({
            where: {
              id: documentId,
            },

            data: {
              status,
            },

            include: {
              uploadedBy: {
                select: {
                  id: true,
                  name: true,
                  role: true,
                },
              },

              lead: {
                select: {
                  id: true,
                  customerName: true,
                  mobile: true,
                },
              },

              application: {
                select: {
                  id: true,
                  applicationNumber: true,
                  status: true,
                },
              },
            },
          });

        // =============================================
        // STATUS HISTORY
        // =============================================

        await tx.documentStatusHistory.create({
          data: {
            documentId:
              document.id,

            fromStatus:
              document.status,

            toStatus:
              status,

            changedById:
              user.userId,

            ...(status ===
              "REJECTED" && {
              rejectionReason:
                rejectionReason.trim(),
            }),
          },
        });

        // =============================================
        // AUDIT METADATA
        // =============================================

        const auditMetadata = {
          leadId:
            document.leadId,

          applicationId:
            document.applicationId,

          documentType:
            document.docType,

          fromStatus:
            document.status,

          toStatus:
            status,
        };

        // =============================================
        // REJECTION REASON
        // =============================================

        if (
          status ===
          "REJECTED"
        ) {
          auditMetadata.rejectionReason =
            rejectionReason.trim();
        }

        // =============================================
        // AUDIT LOG
        // =============================================

        await createAuditLog({
          db: tx,

          userId:
            user.userId,

          action:
            "STATUS_CHANGE",

          module:
            "DOCUMENT",

          recordId:
            document.id,

          metadata:
            auditMetadata,
        });

        return updated;
      }
    );

  // ===================================================
  // DOCUMENT REJECTION NOTIFICATION
  // ===================================================

  if (
    status ===
    "REJECTED"
  ) {
    const assignedToId =
      document.lead?.assignedToId;

    if (assignedToId) {
      await createNotificationOnce({
        userId:
          assignedToId,

        type:
          "SYSTEM",

        title:
          "Document Rejected",

        message:
          `A ${document.docType} document was rejected. Reason: ${rejectionReason.trim()}`,

        leadId:
          document.leadId,
      });
    }
  }

  return updatedDocument;
};

// =====================================================
// DELETE DOCUMENT
// =====================================================

const deleteDocument = async ({
  documentId,
  user,
}) => {
  // ===================================================
  // DELETE AUTHORIZATION
  // ===================================================

  await canDeleteDocument({
    documentId,
    user,
  });

  // ===================================================
  // GET DOCUMENT
  // ===================================================

  const document =
    await prisma.document.findUnique({
      where: {
        id: documentId,
      },

      select: {
        id: true,
        leadId: true,
        applicationId: true,
        docType: true,
        fileName: true,
        filePath: true,
        status: true,
      },
    });

  if (!document) {
    throw new ApiError(
      404,
      "Document not found"
    );
  }

  // ===================================================
  // DELETE DATABASE RECORD
  // ===================================================

  await prisma.document.delete({
    where: {
      id: documentId,
    },
  });

  // ===================================================
  // DELETE PHYSICAL FILE
  // ===================================================

  try {
    if (
      document.filePath &&
      fs.existsSync(
        document.filePath
      )
    ) {
      fs.unlinkSync(
        document.filePath
      );
    }
  } catch (error) {
    console.error(
      "Failed to delete physical document file:",
      error.message
    );
  }

  // ===================================================
  // AUDIT LOG
  // ===================================================

  await createAuditLog({
    userId:
      user.userId,

    action:
      "DELETE",

    module:
      "DOCUMENT",

    recordId:
      document.id,

    metadata: {
      leadId:
        document.leadId,

      applicationId:
        document.applicationId,

      documentType:
        document.docType,

      fileName:
        document.fileName,

      status:
        document.status,
    },
  });

  // ===================================================
  // RESPONSE
  // ===================================================

  return {
    message:
      "Document deleted successfully",
  };
};

// =====================================================
// EXPORTS
// =====================================================

module.exports = {
  createDocument,
  getDocumentById,
  getDocuments,
  updateDocumentStatus,
  deleteDocument,
};