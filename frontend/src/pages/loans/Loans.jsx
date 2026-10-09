import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Eye, RefreshCw, Search } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";

import { getLoansApi } from "../../services/loans.api";
import { LOAN_STATUS_OPTIONS } from "./loan.constants";

const Loans = () => {
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  // ========================================
  // LOAD LOANS
  // ========================================

  const loadLoans = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getLoansApi({
        page,
        limit,
        search: search || undefined,
        status: status || undefined,
      });

      const loanData = Array.isArray(response?.data)
        ? response.data
        : response?.data?.items;

      setLoans(Array.isArray(loanData) ? loanData : []);

      setPagination(
        response?.pagination || response?.data?.pagination || {
          page,
          limit,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("Failed to load loans:", error);
      setError(error?.response?.data?.message || "Unable to load loan accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoans();
  }, [page, status]);

  // ========================================
  // SEARCH
  // ========================================

  const handleSearch = (event) => {
    event.preventDefault();

    setPage(1);
    loadLoans();
  };

  // ========================================
  // STATUS BADGE
  // ========================================

  const getStatusVariant = (loanStatus) => {
    switch (loanStatus) {
      case "ACTIVE":
        return "success";

      case "CLOSED":
        return "default";

      case "FORECLOSED":
        return "warning";

      case "WRITTEN_OFF":
        return "danger";

      default:
        return "default";
    }
  };

  // ========================================
  // FORMAT MONEY
  // ========================================

  const formatMoney = (value) => {
    if (value === null || value === undefined) {
      return "-";
    }

    return `₹${Number(value).toLocaleString("en-IN")}`;
  };

  // ========================================
  // FORMAT DATE
  // ========================================

  const formatDate = (value) => {
    if (!value) {
      return "-";
    }

    return new Date(value).toLocaleDateString("en-IN");
  };

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <PageHeader
        title="Loan Accounts"
        description="Manage active and completed loan accounts"
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* FILTERS */}

      <Card>
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          <Input
            label="Search"
            placeholder="Search LAN, customer or application..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            options={[
              {
                value: "",
                label: "All Statuses",
              },
              ...LOAN_STATUS_OPTIONS,
            ]}
          />

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Search size={16} />
              Search
            </button>

            <button
              type="button"
              onClick={loadLoans}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-300 px-4 text-sm font-medium hover:bg-slate-50"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </form>
      </Card>

      {/* DESKTOP TABLE */}

      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                <th className="px-4 py-3 font-semibold">
                  Loan Account
                </th>

                <th className="px-4 py-3 font-semibold">
                  Customer
                </th>

                <th className="px-4 py-3 font-semibold">
                  Disbursed
                </th>

                <th className="px-4 py-3 font-semibold">
                  EMI
                </th>

                <th className="px-4 py-3 font-semibold">
                  Tenure
                </th>

                <th className="px-4 py-3 font-semibold">
                  Disbursed Date
                </th>

                <th className="px-4 py-3 font-semibold">
                  Status
                </th>

                <th className="px-4 py-3 text-right font-semibold">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    Loading loans...
                  </td>
                </tr>
              ) : loans.length === 0 ? (
                <tr>
                  <td
                    colSpan="8"
                    className="px-4 py-10 text-center text-slate-500"
                  >
                    No loan accounts found.
                  </td>
                </tr>
              ) : (
                loans.map((loan) => (
                  <tr
                    key={loan.id}
                    className="border-b last:border-b-0 hover:bg-slate-50"
                  >
                    <td className="px-4 py-4">
                      <Link
                        to={`/loans/${loan.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {loan.loanAccountNumber}
                      </Link>

                      <div className="mt-1 text-xs text-slate-500">
                        {loan.application?.applicationNumber || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium">
                        {loan.lead?.customerName || "-"}
                      </div>

                      <div className="text-xs text-slate-500">
                        {loan.lead?.mobile || "-"}
                      </div>
                    </td>

                    <td className="px-4 py-4 font-medium">
                      {formatMoney(loan.disbursedAmount)}
                    </td>

                    <td className="px-4 py-4">
                      {formatMoney(loan.emiAmount)}
                    </td>

                    <td className="px-4 py-4">
                      {loan.tenureMonths
                        ? `${loan.tenureMonths} months`
                        : "-"}
                    </td>

                    <td className="px-4 py-4">
                      {formatDate(loan.disbursedAt)}
                    </td>

                    <td className="px-4 py-4">
                      <Badge
                        variant={getStatusVariant(loan.status)}
                      >
                        {loan.status}
                      </Badge>
                    </td>

                    <td className="px-4 py-4 text-right">
                      <Link
                        to={`/loans/${loan.id}`}
                        className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MOBILE CARDS */}

      <div className="space-y-4 md:hidden">
        {loading ? (
          <Card>
            <div className="py-8 text-center text-slate-500">
              Loading loans...
            </div>
          </Card>
        ) : loans.length === 0 ? (
          <Card>
            <div className="py-8 text-center text-slate-500">
              No loan accounts found.
            </div>
          </Card>
        ) : (
          loans.map((loan) => (
            <Card key={loan.id}>
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link
                      to={`/loans/${loan.id}`}
                      className="font-semibold text-blue-600"
                    >
                      {loan.loanAccountNumber}
                    </Link>

                    <p className="mt-1 text-xs text-slate-500">
                      {loan.application?.applicationNumber || "-"}
                    </p>
                  </div>

                  <Badge
                    variant={getStatusVariant(loan.status)}
                  >
                    {loan.status}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm font-medium">
                    {loan.lead?.customerName || "-"}
                  </p>

                  <p className="text-xs text-slate-500">
                    {loan.lead?.mobile || "-"}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-slate-500">
                      Disbursed
                    </p>
                    <p className="font-medium">
                      {formatMoney(loan.disbursedAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      EMI
                    </p>
                    <p className="font-medium">
                      {formatMoney(loan.emiAmount)}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Tenure
                    </p>
                    <p className="font-medium">
                      {loan.tenureMonths
                        ? `${loan.tenureMonths} months`
                        : "-"}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-500">
                      Disbursed
                    </p>
                    <p className="font-medium">
                      {formatDate(loan.disbursedAt)}
                    </p>
                  </div>
                </div>

                <Link
                  to={`/loans/${loan.id}`}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
                >
                  <Eye size={16} />
                  View Loan
                </Link>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* PAGINATION */}

      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          Page {pagination.page} of {pagination.totalPages}
        </p>

        <div className="flex gap-2">
          <button
            disabled={page <= 1}
            onClick={() => setPage((prev) => prev - 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Previous
          </button>

          <button
            disabled={page >= pagination.totalPages}
            onClick={() => setPage((prev) => prev + 1)}
            className="rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Loans;