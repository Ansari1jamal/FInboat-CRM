const express = require("express");

const router = express.Router();

// =====================================================
// MIDDLEWARE
// =====================================================

const authMiddleware =
  require("../../middleware/auth.middleware");

const allowRoles =
  require("../../middleware/role.middleware");

// =====================================================
// UPLOAD MIDDLEWARE
// =====================================================

const {
  uploadDocument,
} = require("./document.upload.middleware");

// =====================================================
// CONTROLLERS
// =====================================================

const {
  createDocumentController,
  getDocumentByIdController,
  getLeadDocumentsController,
  getDocumentsController,
  updateDocumentStatusController,
  deleteDocumentController,
} = require("./document.controller");

// =====================================================
// GET ALL DOCUMENTS
// GET /api/documents
// =====================================================

router.get(
  "/",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getDocumentsController
);

// =====================================================
// GET SINGLE DOCUMENT
// GET /api/documents/document/:id
// =====================================================

router.get(
  "/document/:id",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getDocumentByIdController
);

// =====================================================
// GET DOCUMENTS FOR LEAD
// GET /api/documents/lead/:leadId
// GET /api/documents/:leadId
// =====================================================

router.get(
  "/lead/:leadId",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLeadDocumentsController
);

router.get(
  "/:leadId",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLeadDocumentsController
);

// =====================================================
// UPLOAD DOCUMENT FOR LEAD
// POST /api/documents/lead/:leadId
// POST /api/documents/:leadId
// =====================================================

router.post(
  "/lead/:leadId",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  uploadDocument,
  createDocumentController
);

router.post(
  "/:leadId",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  uploadDocument,
  createDocumentController
);

// =====================================================
// UPDATE DOCUMENT STATUS
// PATCH /api/documents/:id/status
// PATCH /api/documents/:id/verify
// PATCH /api/documents/:id/reject
// =====================================================

router.patch(
  "/:id/verify",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL"
  ),
  (req, res, next) => {
    req.body.status = "VERIFIED";
    next();
  },
  updateDocumentStatusController
);

router.patch(
  "/:id/reject",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL"
  ),
  (req, res, next) => {
    req.body.status = "REJECTED";
    req.body.rejectionReason =
      req.body.reason ||
      req.body.rejectionReason;
    next();
  },
  updateDocumentStatusController
);

router.patch(
  "/:id/status",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL"
  ),
  updateDocumentStatusController
);

// =====================================================
// DELETE DOCUMENT
// DELETE /api/documents/:id
// =====================================================

router.delete(
  "/:id",
  authMiddleware,
  allowRoles(
    "ADMIN"
  ),
  deleteDocumentController
);

// =====================================================
// EXPORT
// =====================================================

module.exports = router;