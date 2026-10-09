
const express = require("express");

const router =
  express.Router();

const applicationController =
  require("./application.controller");

const authMiddleware =
  require("../../middleware/auth.middleware");

const allowRoles =
  require("../../middleware/role.middleware");

// ======================================
// AUTHENTICATION
// ======================================

router.use(
  authMiddleware
);

// ======================================
// CREATE APPLICATION
// ======================================

// POST /api/applications/leads/:leadId
router.post(
  "/leads/:leadId",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.createApplication
);

// ======================================
// GET APPLICATIONS
// ======================================

// GET /api/applications
router.get(
  "/",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.getApplications
);

// ======================================
// EXPORT APPLICATIONS TO CSV
// IMPORTANT:
// THIS MUST COME BEFORE /:id
// ======================================

// GET /api/applications/export/csv
router.get(
  "/export/csv",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.exportApplicationCSV
);

// ======================================
// EXPORT APPLICATIONS TO EXCEL
// IMPORTANT:
// THIS MUST COME BEFORE /:id
// ======================================

// GET /api/applications/export
router.get(
  "/export",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.exportApplicationExcel
);

// ======================================
// GET SINGLE APPLICATION
// ======================================

// GET /api/applications/:id
router.get(
  "/:id",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.getApplication
);

// ======================================
// GET APPLICATION TIMELINE
// ======================================

// GET /api/applications/:id/timeline
router.get(
  "/:id/timeline",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.getApplicationTimeline
);

// ======================================
// GET APPLICATION STATUS HISTORY
// ======================================

// GET /api/applications/:id/status-history
router.get(
  "/:id/status-history",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.getApplicationStatusHistory
);

// ======================================
// UPDATE APPLICATION
// ======================================

// PATCH /api/applications/:id
router.patch(
  "/:id",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.updateApplication
);

// ======================================
// CHANGE APPLICATION STATUS
// ======================================

// PATCH /api/applications/:id/status
router.patch(
  "/:id/status",

  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),

  applicationController.changeStatus
);

// ======================================
// EXPORT ROUTER
// ======================================

module.exports =
  router;

