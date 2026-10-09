import { useEffect, useState } from "react";
import {
  Download,
  RefreshCw,
  Search,
  IndianRupee,
  AlertCircle,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";

import {
  getFinancialSummaryApi,
  getRepaymentReportApi,
  getEmiReportApi,
  getCollectionReportApi,
  exportFinancialReportApi,
} from "../../services/reports.api";

const FinancialReports = () => {
  const [summary, setSummary] = useState(null);

  const [repayments, setRepayments] =
    useState([]);

  const [emiReport, setEmiReport] =
    useState([]);

  const [collections, setCollections] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [loadError, setLoadError] =
    useState("");

  const [exporting, setExporting] =
    useState(false);

  const [activeTab, setActiveTab] =
    useState("repayments");

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    status: "",
  });

  // ========================================
  // LOAD REPORTS
  // ========================================

  const loadReports = async () => {
    try {
      setLoading(true);

      const params = {};

      if (filters.fromDate) {
        params.fromDate = filters.fromDate;
      }

      if (filters.toDate) {
        params.toDate = filters.toDate;
      }

      if (filters.status) {
        params.status = filters.status;
      }

      const reportNames = [
        "summary",
        "repayments",
        "EMI",
        "collections",
      ];
      const [
        summaryResult,
        repaymentResult,
        emiResult,
        collectionResult,
      ] = await Promise.allSettled([
        getFinancialSummaryApi(params),
        getRepaymentReportApi(params),
        getEmiReportApi(params),
        getCollectionReportApi(params),
      ]);

      const failedReports = [
        summaryResult,
        repaymentResult,
        emiResult,
        collectionResult,
      ]
        .map((result, index) =>
          result.status === "rejected" ? reportNames[index] : null
        )
        .filter(Boolean);

      setLoadError(
        failedReports.length
          ? `Unable to load ${failedReports.join(", ")} report${failedReports.length > 1 ? "s" : ""}. Please retry.`
          : ""
      );

      const summaryResponse =
        summaryResult.status === "fulfilled"
          ? summaryResult.value
          : null;

      const repaymentResponse =
        repaymentResult.status === "fulfilled"
          ? repaymentResult.value
          : null;

      const emiResponse =
        emiResult.status === "fulfilled"
          ? emiResult.value
          : null;

      const collectionResponse =
        collectionResult.status === "fulfilled"
          ? collectionResult.value
          : null;

      setSummary(
        summaryResponse?.data || null
      );

      setRepayments(
        repaymentResponse?.data?.items ||
          repaymentResponse?.data?.repayments ||
          []
      );

      setEmiReport(
        emiResponse?.data?.items ||
          emiResponse?.data?.emis ||
          []
      );

      setCollections(
        collectionResponse?.data?.items ||
          collectionResponse?.data?.collections ||
          []
      );
    } catch (error) {
      console.error(
        "Failed to load financial reports:",
        error
      );
      setLoadError("Financial reports could not be loaded. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  // ========================================
  // FILTER CHANGE
  // ========================================

  const handleFilterChange = (event) => {
    const {
      name,
      value,
    } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ========================================
  // APPLY FILTER
  // ========================================

  const handleApplyFilters = (event) => {
    event.preventDefault();

    loadReports();
  };

  // ========================================
  // RESET
  // ========================================

  const handleReset = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      status: "",
    });

    setTimeout(() => {
      loadReports();
    }, 0);
  };

  // ========================================
  // MONEY
  // ========================================

  const formatMoney = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "—";
    }

    return `₹${Number(value).toLocaleString(
      "en-IN"
    )}`;
  };

  // ========================================
  // DATE
  // ========================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // ========================================
  // EXPORT
  // ========================================

  const handleExport = async () => {
    try {
      setExporting(true);

      const response =
        await exportFinancialReportApi(
          filters
        );

      const blob = new Blob([
        response.data,
      ]);

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      link.download =
        "finboat-financial-report.xlsx";

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(
        "Failed to export report:",
        error
      );
      setLoadError("The financial report export failed. Please retry.");
    } finally {
      setExporting(false);
    }
  };

  // ========================================
  // SUMMARY VALUES
  // ========================================

  const totalDisbursed =
    summary?.totalDisbursed ??
    summary?.disbursedAmount;

  const totalCollected =
    summary?.totalCollected ??
    summary?.collectedAmount;

  const totalOutstanding =
    summary?.totalOutstanding ??
    summary?.outstandingAmount;

  const totalOverdue =
    summary?.totalOverdue ??
    summary?.overdueAmount;

  const collectionRate = summary?.collectionRate;

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <PageHeader
        title="Financial Reports"
        description="Monitor disbursement, collection, EMI and repayment performance"
        action={
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />

            {exporting
              ? "Exporting..."
              : "Export Report"}
          </button>
        }
      />

      {/* FILTERS */}

      <Card>
        <form
          onSubmit={handleApplyFilters}
          className="grid grid-cols-1 gap-4 md:grid-cols-4"
        >
          {/* FROM DATE */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              From Date
            </label>

            <input
              type="date"
              name="fromDate"
              value={filters.fromDate}
              onChange={handleFilterChange}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {/* TO DATE */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              To Date
            </label>

            <input
              type="date"
              name="toDate"
              value={filters.toDate}
              onChange={handleFilterChange}
              className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {/* STATUS */}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Status
            </label>

            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-slate-500"
            >
              <option value="">
                All Status
              </option>

              <option value="PAID">
                Paid
              </option>

              <option value="PARTIAL">
                Partial
              </option>

              <option value="PENDING">
                Pending
              </option>

              <option value="OVERDUE">
                Overdue
              </option>
            </select>
          </div>

          {/* BUTTONS */}

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Search size={16} />
              Apply
            </button>

            <button
              type="button"
              onClick={handleReset}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border px-4 text-sm font-medium hover:bg-slate-50"
            >
              Reset
            </button>

            <button
              type="button"
              onClick={loadReports}
              className="inline-flex h-10 items-center justify-center rounded-lg border px-3 hover:bg-slate-50"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </form>
      </Card>

      {loadError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 sm:flex-row sm:items-center sm:justify-between"
        >
          <span>{loadError}</span>
          <button
            type="button"
            onClick={loadReports}
            className="shrink-0 font-semibold underline"
          >
            Retry loading reports
          </button>
        </div>
      )}

      {/* SUMMARY CARDS */}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {/* DISBURSED */}

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Disbursed
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatMoney(
                  totalDisbursed
                )}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-3">
              <CircleDollarSign
                size={20}
              />
            </div>
          </div>
        </Card>

        {/* COLLECTED */}

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Collected
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatMoney(
                  totalCollected
                )}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-3">
              <Wallet size={20} />
            </div>
          </div>
        </Card>

        {/* OUTSTANDING */}

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Outstanding
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatMoney(
                  totalOutstanding
                )}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-3">
              <IndianRupee
                size={20}
              />
            </div>
          </div>
        </Card>

        {/* OVERDUE */}

        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Overdue
              </p>

              <p className="mt-2 text-2xl font-bold">
                {formatMoney(
                  totalOverdue
                )}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Collection rate:{" "}
                {collectionRate === undefined ? "—" : `${collectionRate}%`}
              </p>
            </div>

            <div className="rounded-lg bg-slate-100 p-3">
              <AlertCircle
                size={20}
              />
            </div>
          </div>
        </Card>
      </div>

      {/* LOADING */}

      {loading && (
        <Card>
          <div className="py-8 text-center text-slate-500">
            Loading financial reports...
          </div>
        </Card>
      )}

      {/* REPORT TABS */}

      {!loading && (
        <Card>
          {/* TAB HEADER */}

          <div className="flex overflow-x-auto border-b">
            <button
              type="button"
              onClick={() =>
                setActiveTab("repayments")
              }
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium ${
                activeTab === "repayments"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500"
              }`}
            >
              Repayments
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("emi")
              }
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium ${
                activeTab === "emi"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500"
              }`}
            >
              EMI Report
            </button>

            <button
              type="button"
              onClick={() =>
                setActiveTab("collections")
              }
              className={`whitespace-nowrap border-b-2 px-5 py-3 text-sm font-medium ${
                activeTab === "collections"
                  ? "border-slate-900 text-slate-900"
                  : "border-transparent text-slate-500"
              }`}
            >
              Collections
            </button>
          </div>

          {/* REPAYMENTS */}

          {activeTab === "repayments" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-4 py-3">
                      Date
                    </th>

                    <th className="px-4 py-3">
                      Loan Account
                    </th>

                    <th className="px-4 py-3">
                      EMI
                    </th>

                    <th className="px-4 py-3">
                      Amount
                    </th>

                    <th className="px-4 py-3">
                      Mode
                    </th>

                    <th className="px-4 py-3">
                      Transaction
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {repayments.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No repayment records
                        found.
                      </td>
                    </tr>
                  ) : (
                    repayments.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-4">
                            {formatDate(
                              item.paymentDate
                            )}
                          </td>

                          <td className="px-4 py-4 font-medium">
                            {item.loanAccount
                              ?.loanAccountNumber ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.emiSchedule
                              ?.emiNumber
                              ? `#${item.emiSchedule.emiNumber}`
                              : "-"}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {formatMoney(
                              item.amount
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {item.paymentMode ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.transactionId ||
                              "-"}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* EMI */}

          {activeTab === "emi" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-4 py-3">
                      Loan Account
                    </th>

                    <th className="px-4 py-3">
                      EMI #
                    </th>

                    <th className="px-4 py-3">
                      Due Date
                    </th>

                    <th className="px-4 py-3">
                      EMI Amount
                    </th>

                    <th className="px-4 py-3">
                      Paid
                    </th>

                    <th className="px-4 py-3">
                      Outstanding
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {emiReport.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No EMI records
                        found.
                      </td>
                    </tr>
                  ) : (
                    emiReport.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-4">
                            {item.loanAccount
                              ?.loanAccountNumber ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            #{item.emiNumber}
                          </td>

                          <td className="px-4 py-4">
                            {formatDate(
                              item.dueDate
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {formatMoney(
                              item.emiAmount
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {formatMoney(
                              item.paidAmount
                            )}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {formatMoney(
                              item.outstandingAmount
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {item.status ||
                              "-"}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* COLLECTIONS */}

          {activeTab === "collections" && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-sm">
                <thead>
                  <tr className="border-b bg-slate-50 text-left">
                    <th className="px-4 py-3">
                      Customer
                    </th>

                    <th className="px-4 py-3">
                      Loan Account
                    </th>

                    <th className="px-4 py-3">
                      EMI
                    </th>

                    <th className="px-4 py-3">
                      Outstanding
                    </th>

                    <th className="px-4 py-3">
                      Days Overdue
                    </th>

                    <th className="px-4 py-3">
                      Status
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {collections.length ===
                  0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-4 py-10 text-center text-slate-500"
                      >
                        No collection records
                        found.
                      </td>
                    </tr>
                  ) : (
                    collections.map(
                      (item) => (
                        <tr
                          key={item.id}
                          className="border-b last:border-0"
                        >
                          <td className="px-4 py-4 font-medium">
                            {item.customer
                              ?.name ||
                              item.loanAccount
                                ?.customerName ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.loanAccount
                              ?.loanAccountNumber ||
                              "-"}
                          </td>

                          <td className="px-4 py-4">
                            {item.emiSchedule
                              ?.emiNumber
                              ? `#${item.emiSchedule.emiNumber}`
                              : "-"}
                          </td>

                          <td className="px-4 py-4 font-semibold">
                            {formatMoney(
                              item.outstandingAmount ??
                                item.emiSchedule
                                  ?.outstandingAmount
                            )}
                          </td>

                          <td className="px-4 py-4">
                            {item.daysOverdue ??
                              0}
                          </td>

                          <td className="px-4 py-4">
                            {item.status ||
                              "-"}
                          </td>
                        </tr>
                      )
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default FinancialReports;