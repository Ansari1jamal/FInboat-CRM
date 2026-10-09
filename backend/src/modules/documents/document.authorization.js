const {
  prisma,
} = require("../../config/db");

const ApiError =
  require("../../utils/ApiError");

// =====================================================
// GET LEAD WITH ASSIGNMENT INFORMATION
// =====================================================

const getLeadForDocumentAccess =
  async (leadId) => {
    const lead =
      await prisma.lead.findUnique({
        where: {
          id: leadId,
        },

        select: {
          id: true,
          assignedToId: true,

          assignedTo: {
            select: {
              id: true,
              tlId: true,
              managerId: true,
            },
          },
        },
      });

    if (!lead) {
      throw new ApiError(
        404,
        "Lead not found"
      );
    }

    return lead;
  };

// =====================================================
// CHECK USER CAN ACCESS LEAD DOCUMENT
// =====================================================

const canAccessLeadDocument =
  async ({
    leadId,
    user,
  }) => {
    if (!user?.userId || !user?.role) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    // ===================================================
    // ADMIN
    // ===================================================

    if (
      user.role === "ADMIN"
    ) {
      return true;
    }

    // ===================================================
    // GET LEAD
    // ===================================================

    const lead =
      await getLeadForDocumentAccess(
        leadId
      );

    // ===================================================
    // TELECALLER
    // ===================================================

    if (
      user.role ===
      "TELECALLER"
    ) {
      if (
        lead.assignedToId !==
        user.userId
      ) {
        throw new ApiError(
          403,
          "You cannot access this document"
        );
      }

      return true;
    }

    // ===================================================
    // TL
    // ===================================================

    if (
      user.role === "TL"
    ) {
      if (
        !lead.assignedTo ||
        lead.assignedTo.tlId !==
          user.userId
      ) {
        throw new ApiError(
          403,
          "You cannot access this document"
        );
      }

      return true;
    }

    // ===================================================
    // MANAGER
    // ===================================================

    if (
      user.role ===
      "MANAGER"
    ) {
      if (
        !lead.assignedTo ||
        lead.assignedTo.managerId !==
          user.userId
      ) {
        throw new ApiError(
          403,
          "You cannot access this document"
        );
      }

      return true;
    }

    // ===================================================
    // OTHER ROLES
    // ===================================================

    throw new ApiError(
      403,
      "You are not allowed to access this document"
    );
  };

// =====================================================
// CHECK DOCUMENT ACCESS
// =====================================================

const canAccessDocument =
  async ({
    documentId,
    user,
  }) => {
    const document =
      await prisma.document.findUnique({
        where: {
          id: documentId,
        },

        select: {
          id: true,
          leadId: true,
        },
      });

    if (!document) {
      throw new ApiError(
        404,
        "Document not found"
      );
    }

    await canAccessLeadDocument({
      leadId:
        document.leadId,

      user,
    });

    return document;
  };

// =====================================================
// CHECK DOCUMENT VERIFICATION PERMISSION
// =====================================================

const canVerifyDocument =
  async ({
    documentId,
    user,
  }) => {
    if (!user?.userId || !user?.role) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    // ===================================================
    // ONLY ADMIN / MANAGER / TL
    // ===================================================

    if (
      ![
        "ADMIN",
        "MANAGER",
        "TL",
      ].includes(user.role)
    ) {
      throw new ApiError(
        403,
        "You do not have permission to verify documents"
      );
    }

    // ===================================================
    // ADMIN
    // ===================================================

    if (
      user.role === "ADMIN"
    ) {
      return true;
    }

    // ===================================================
    // DOCUMENT
    // ===================================================

    const document =
      await prisma.document.findUnique({
        where: {
          id: documentId,
        },

        select: {
          id: true,
          leadId: true,
        },
      });

    if (!document) {
      throw new ApiError(
        404,
        "Document not found"
      );
    }

    // ===================================================
    // LEAD ACCESS
    // ===================================================

    await canAccessLeadDocument({
      leadId:
        document.leadId,

      user,
    });

    return true;
  };

// =====================================================
// CHECK DOCUMENT DELETE PERMISSION
// =====================================================

const canDeleteDocument =
  async ({
    documentId,
    user,
  }) => {
    if (!user?.userId || !user?.role) {
      throw new ApiError(
        401,
        "Authentication required"
      );
    }

    // ===================================================
    // ONLY ADMIN
    // ===================================================

    if (
      user.role !== "ADMIN"
    ) {
      throw new ApiError(
        403,
        "You do not have permission to delete this document"
      );
    }

    // ===================================================
    // DOCUMENT EXISTS
    // ===================================================

    const document =
      await prisma.document.findUnique({
        where: {
          id: documentId,
        },

        select: {
          id: true,
          leadId: true,
        },
      });

    if (!document) {
      throw new ApiError(
        404,
        "Document not found"
      );
    }

    return document;
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  canAccessLeadDocument,
  canAccessDocument,
  canVerifyDocument,
  canDeleteDocument,
};