const {
  createDocument,
  getDocumentById,
  getDocuments,
  updateDocumentStatus,
  deleteDocument,
} = require("./document.service");

// =====================================================
// CREATE / UPLOAD DOCUMENT
// =====================================================

const createDocumentController = async (
  req,
  res,
  next
) => {
  try {
    const document =
      await createDocument({
        leadId:
          req.params.leadId,

        applicationId:
          req.body.applicationId ||
          null,

        documentType:
          req.body.documentType ||
          req.body.docType,

        file:
          req.file,

        user:
          req.user,
      });

    return res.status(201).json({
      success: true,

      message:
        "Document uploaded successfully",

      data: {
        document,
      },
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// GET DOCUMENT BY ID
// =====================================================

const getDocumentByIdController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const document =
        await getDocumentById({
          documentId:
            req.params.id,

          user:
            req.user,
        });

      return res.status(200).json({
        success: true,

        message:
          "Document fetched successfully",

        data: {
          document,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// GET LEAD DOCUMENTS
// =====================================================

const getLeadDocumentsController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await getDocuments({
          leadId:
            req.params.leadId,

          applicationId:
            req.query.applicationId,

          status:
            req.query.status,

          page:
            req.query.page,

          limit:
            req.query.limit,

          user:
            req.user,
        });

      return res.status(200).json({
        success: true,

        message:
          "Documents fetched successfully",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// GET ALL DOCUMENTS
// =====================================================

const getDocumentsController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await getDocuments({
          leadId:
            req.query.leadId,

          applicationId:
            req.query.applicationId,

          status:
            req.query.status,

          page:
            req.query.page,

          limit:
            req.query.limit,

          user:
            req.user,
        });

      return res.status(200).json({
        success: true,

        message:
          "Documents fetched successfully",

        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// UPDATE DOCUMENT STATUS
// =====================================================

const updateDocumentStatusController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const document =
        await updateDocumentStatus({
          documentId:
            req.params.id,

          status:
            req.body.status,

          rejectionReason:
            req.body.reason ||
            req.body.rejectionReason,

          user:
            req.user,
        });

      return res.status(200).json({
        success: true,

        message:
          "Document status updated successfully",

        data: {
          document,
        },
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// DELETE DOCUMENT
// =====================================================

const deleteDocumentController =
  async (
    req,
    res,
    next
  ) => {
    try {
      const result =
        await deleteDocument({
          documentId:
            req.params.id,

          user:
            req.user,
        });

      return res.status(200).json({
        success: true,

        ...result,
      });
    } catch (error) {
      next(error);
    }
  };

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  createDocumentController,
  getDocumentByIdController,
  getLeadDocumentsController,
  getDocumentsController,
  updateDocumentStatusController,
  deleteDocumentController,
};