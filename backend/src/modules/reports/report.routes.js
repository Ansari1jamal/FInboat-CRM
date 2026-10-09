
const express = require("express");

const router = express.Router();

const authMiddleware = require("../../middleware/auth.middleware");
const allowRoles = require("../../middleware/role.middleware");

const {
  getReportSummaryController,
  getTelecallerPerformanceController,
  getDetailedPerformanceController,
  getPendingFollowUpsController,
  getLeadConversionReportController,
  getLenderApplicationPerformanceController,

  // New financial/collection reports
  getFinancialSummary,
  getCollectionPerformance,
  getLenderCollection,
  getMonthlyCollection,
  getTelecallerCollection,
  getFinancialReportSummary,
  getRepaymentReport,
  getEmiReport,
  getCollectionReport,
  exportFinancialReport,
} = require("./report.controller");

// ========================================
// SUMMARY
// ========================================

router.get(
  "/summary",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getReportSummaryController
);

// ========================================
// OLD TELECALLER PERFORMANCE
// ========================================

router.get(
  "/performance",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getTelecallerPerformanceController
);

// ========================================
// DETAILED TELECALLER PERFORMANCE
// ========================================

router.get(
  "/telecaller-performance",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getDetailedPerformanceController
);

// ========================================
// PENDING FOLLOW-UPS
// ========================================

router.get(
  "/followups-pending",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getPendingFollowUpsController
);

// ========================================
// LEAD CONVERSION
// ========================================

router.get(
  "/lead-conversion",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLeadConversionReportController
);

// ========================================
// LENDER APPLICATION PERFORMANCE
// ========================================

router.get(
  "/lender-performance",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLenderApplicationPerformanceController
);

// ========================================
// FINANCIAL SUMMARY
// ========================================

router.get(
  "/financial-summary",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getFinancialSummary
);

// ========================================
// COLLECTION PERFORMANCE
// ========================================

router.get(
  "/collection-performance",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getCollectionPerformance
);

// ========================================
// LENDER COLLECTION
// ========================================

router.get(
  "/lender-collection",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getLenderCollection
);

// ========================================
// MONTHLY COLLECTION
// ========================================

router.get(
  "/monthly-collection",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getMonthlyCollection
);

// ========================================
// TELECALLER COLLECTION
// ========================================

router.get(
  "/telecaller-collection",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getTelecallerCollection
);

// ========================================
// FINANCIAL REPORT ENDPOINTS
// ========================================

router.get(
  "/financial/summary",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getFinancialReportSummary
);

router.get(
  "/financial/repayments",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getRepaymentReport
);

router.get(
  "/financial/emi",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getEmiReport
);

router.get(
  "/financial/collections",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  getCollectionReport
);

router.get(
  "/financial/export",
  authMiddleware,
  allowRoles(
    "ADMIN",
    "MANAGER",
    "TL",
    "TELECALLER"
  ),
  exportFinancialReport
);

// ========================================
// EXPORT
// ========================================

module.exports = router;

