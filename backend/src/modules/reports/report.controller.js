
const {
  getReportSummary,
  getTelecallerPerformance,
  getDetailedTelecallerPerformance,
  getPendingFollowUps,
  getLeadConversionReport,
  getLenderApplicationPerformance,

  // New financial/collection reports
  getFinancialSummary: getFinancialSummaryService,
  getCollectionPerformance: getCollectionPerformanceService,
  getLenderCollection: getLenderCollectionService,
  getMonthlyCollection: getMonthlyCollectionService,
  getTelecallerCollection: getTelecallerCollectionService,

  getFinancialReportSummary: getFinancialReportSummaryService,
  getRepaymentReport: getRepaymentReportService,
  getEmiReport: getEmiReportService,
  getCollectionReport: getCollectionReportService,
  exportFinancialReport: exportFinancialReportService,
} = require("./report.service");

// ========================================
// SUMMARY
// ========================================

const getReportSummaryController = async (req, res, next) => {
  try {
    const result = await getReportSummary({
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// OLD TELECALLER PERFORMANCE
// ========================================

const getTelecallerPerformanceController = async (req, res, next) => {
  try {
    const result = await getTelecallerPerformance({
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// DETAILED TELECALLER PERFORMANCE
// ========================================

const getDetailedPerformanceController = async (req, res, next) => {
  try {
    const result = await getDetailedTelecallerPerformance({
      user: req.user,
      period: req.query.period,
      date: req.query.date,
      from: req.query.from,
      to: req.query.to,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// PENDING FOLLOW-UPS
// ========================================

const getPendingFollowUpsController = async (req, res, next) => {
  try {
    const result = await getPendingFollowUps({
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// LEAD CONVERSION
// ========================================

const getLeadConversionReportController = async (req, res, next) => {
  try {
    const result = await getLeadConversionReport({
      user: req.user,
      period: req.query.period,
      from: req.query.from,
      to: req.query.to,
      loanType: req.query.loanType,
      source: req.query.source,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// LENDER APPLICATION PERFORMANCE
// ========================================

const getLenderApplicationPerformanceController = async (
  req,
  res,
  next
) => {
  try {
    const result = await getLenderApplicationPerformance({
      user: req.user,
      from: req.query.from,
      to: req.query.to,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// FINANCIAL SUMMARY
// ========================================

const getFinancialSummary = async (req, res, next) => {
  try {
    const result = await getFinancialSummaryService({
      user: req.user,
      from: req.query.from,
      to: req.query.to,
      period: req.query.period,
    });

    return res.status(200).json({
      success: true,
      message: "Financial summary fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// COLLECTION PERFORMANCE
// ========================================

const getCollectionPerformance = async (req, res, next) => {
  try {
    const result = await getCollectionPerformanceService({
      user: req.user,
      from: req.query.from,
      to: req.query.to,
      period: req.query.period,
    });

    return res.status(200).json({
      success: true,
      message: "Collection performance fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// LENDER COLLECTION
// ========================================

const getLenderCollection = async (req, res, next) => {
  try {
    const result = await getLenderCollectionService({
      user: req.user,
      from: req.query.from,
      to: req.query.to,
      period: req.query.period,
    });

    return res.status(200).json({
      success: true,
      message: "Lender collection report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// MONTHLY COLLECTION
// ========================================

const getMonthlyCollection = async (req, res, next) => {
  try {
    const result = await getMonthlyCollectionService({
      user: req.user,
      from: req.query.from,
      to: req.query.to,
      period: req.query.period,
    });

    return res.status(200).json({
      success: true,
      message: "Monthly collection report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// TELECALLER COLLECTION
// ========================================

const getTelecallerCollection = async (req, res, next) => {
  try {
    const result = await getTelecallerCollectionService({
      user: req.user,
      from: req.query.from,
      to: req.query.to,
      period: req.query.period,
    });

    return res.status(200).json({
      success: true,
      message: "Telecaller collection report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// FINANCIAL REPORT SUMMARY
// ========================================

const getFinancialReportSummary = async (req, res, next) => {
  try {
    const result = await getFinancialReportSummaryService({
      user: req.user,
      fromDate: req.query.fromDate || req.query.from,
      toDate: req.query.toDate || req.query.to,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: "Financial summary fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// REPAYMENT REPORT
// ========================================

const getRepaymentReport = async (req, res, next) => {
  try {
    const result = await getRepaymentReportService({
      user: req.user,
      fromDate: req.query.fromDate || req.query.from,
      toDate: req.query.toDate || req.query.to,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: "Repayment report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// EMI REPORT
// ========================================

const getEmiReport = async (req, res, next) => {
  try {
    const result = await getEmiReportService({
      user: req.user,
      fromDate: req.query.fromDate || req.query.from,
      toDate: req.query.toDate || req.query.to,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: "EMI report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// COLLECTION REPORT
// ========================================

const getCollectionReport = async (req, res, next) => {
  try {
    const result = await getCollectionReportService({
      user: req.user,
      fromDate: req.query.fromDate || req.query.from,
      toDate: req.query.toDate || req.query.to,
      status: req.query.status,
    });

    return res.status(200).json({
      success: true,
      message: "Collection report fetched successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ========================================
// EXPORT FINANCIAL REPORT
// ========================================

const exportFinancialReport = async (req, res, next) => {
  try {
    const csv = await exportFinancialReportService({
      user: req.user,
      fromDate: req.query.fromDate || req.query.from,
      toDate: req.query.toDate || req.query.to,
      status: req.query.status,
    });

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="finboat-financial-report.csv"'
    );

    return res.status(200).send(csv);
  } catch (error) {
    next(error);
  }
};

// ========================================
// EXPORT
// ========================================

module.exports = {
  // Existing reports
  getReportSummaryController,
  getTelecallerPerformanceController,
  getDetailedPerformanceController,
  getPendingFollowUpsController,
  getLeadConversionReportController,
  getLenderApplicationPerformanceController,

  // New reports
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
};

