
const express = require("express");

const leadController =
  require("./lead.controller");
const validate = require("../../middleware/validate.middleware");
const {
  importLeadsController,
  getImportStatusController,
} = require("./lead.import.controller");

const {
  assignLeadController,
  getLeadTransfersController,
} = require("./lead.assignment.controller");

const {
  updateLeadStatusController,
  getLeadStatusHistoryController,
} = require("./lead.status.controller");

const {
  getLeadTimelineController,
} = require("./lead.timeline.controller");

const authMiddleware =
  require("../../middleware/auth.middleware");
const { uploadLeadImport } =
  require("./lead.import.upload");

const allowRoles =
  require("../../middleware/role.middleware");

 const {
  createLeadSchema,
  leadListSchema,
} = require("./lead.validation");
const router = express.Router();

// ======================================
// AUTH MIDDLEWARE
// ======================================

router.use(authMiddleware);

// ======================================
// IMPORT LEADS
// ======================================

router.post(
  "/import",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL"
  ),
  uploadLeadImport.single("file"),
  importLeadsController
);

// ======================================
// IMPORT JOB STATUS
// IMPORTANT:
// MUST BE BEFORE /:id
// ======================================

router.get(
  "/import/:jobId",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL"
  ),
  getImportStatusController
);

// ======================================
// CREATE
// ======================================

router.post(
  "/",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  validate(createLeadSchema),
  leadController.createLead
);

// ======================================
// GET ALL
// ======================================

router.get(
  "/",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  validate(leadListSchema),
  leadController.getLeads
);
// ======================================
// EXPORT CSV
// IMPORTANT:
// MUST BE BEFORE /:id
// ======================================

router.get(
  "/export/csv",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  leadController.exportLeadCSV
);

// ======================================
// EXPORT EXCEL
// IMPORTANT:
// MUST BE BEFORE /:id
// ======================================

router.get(
  "/export",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  leadController.exportLeadExcel
);

// ======================================
// GET SINGLE LEAD
// ======================================

router.get(
  "/:id",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  leadController.getLeadById
);

// ======================================
// ASSIGN LEAD
// ======================================

router.patch(
  "/:id/assign",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL"
  ),
  assignLeadController
);

// ======================================
// GET LEAD TRANSFERS
// ======================================

router.get(
  "/:id/transfers",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLeadTransfersController
);

// ======================================
// UPDATE LEAD STATUS
// ======================================

router.patch(
  "/:id/status",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  updateLeadStatusController
);

// ======================================
// GET STATUS HISTORY
// ======================================

router.get(
  "/:id/status-history",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLeadStatusHistoryController
);

// ======================================
// GET LEAD TIMELINE
// ======================================

router.get(
  "/:id/timeline",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLeadTimelineController
);

// ======================================
// UPDATE LEAD
// ======================================

router.patch(
  "/:id",
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  leadController.updateLead
);

// ======================================
// DELETE LEAD
// ======================================

router.delete(
  "/:id",
  allowRoles("ADMIN"),
  leadController.deleteLead
);

module.exports = router;
