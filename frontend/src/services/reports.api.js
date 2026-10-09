import api from "./api";

// ========================================
// FINANCIAL SUMMARY
// ========================================

export const getFinancialSummaryApi = async (
  params = {}
) => {
  const response = await api.get(
    "/reports/financial/summary",
    {
      params,
    }
  );

  return response.data;
};

// ========================================
// REPAYMENT REPORT
// ========================================

export const getRepaymentReportApi = async (
  params = {}
) => {
  const response = await api.get(
    "/reports/financial/repayments",
    {
      params,
    }
  );

  return response.data;
};

// ========================================
// EMI REPORT
// ========================================

export const getEmiReportApi = async (
  params = {}
) => {
  const response = await api.get(
    "/reports/financial/emi",
    {
      params,
    }
  );

  return response.data;
};

// ========================================
// COLLECTION REPORT
// ========================================

export const getCollectionReportApi = async (
  params = {}
) => {
  const response = await api.get(
    "/reports/financial/collections",
    {
      params,
    }
  );

  return response.data;
};

// ========================================
// EXPORT FINANCIAL REPORT
// ========================================

export const exportFinancialReportApi = async (
  params = {}
) => {
  const response = await api.get(
    "/reports/financial/export",
    {
      params,
      responseType: "blob",
    }
  );

  return response;
};