import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  User,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

import {
  getLoanByIdApi,
} from "../../services/loans.api";

import LoanStatus from "./LoanStatus";

const LoanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);

  // ========================================
  // LOAD LOAN
  // ========================================

  const loadLoan = async () => {
    try {
      setLoading(true);

      const response =
        await getLoanByIdApi(id);

      setLoan(response?.data || null);
    } catch (error) {
      console.error(
        "Failed to load loan:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLoan();
  }, [id]);

  // ========================================
  // FORMAT MONEY
  // ========================================

  const formatMoney = (value) => {
    if (
      value === null ||
      value === undefined
    ) {
      return "-";
    }

    return `₹${Number(value).toLocaleString(
      "en-IN"
    )}`;
  };

  // ========================================
  // FORMAT DATE
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
  // STATUS
  // ========================================

  const getStatusVariant = (status) => {
    switch (status) {
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
  // LOADING
  // ========================================

  if (loading) {
    return (
      <div className="py-10 text-center text-slate-500">
        Loading loan details...
      </div>
    );
  }

  // ========================================
  // NOT FOUND
  // ========================================

  if (!loan) {
    return (
      <Card>
        <div className="py-10 text-center">
          <p className="text-slate-500">
            Loan account not found.
          </p>

          <button
            onClick={() => navigate("/loans")}
            className="mt-4 rounded-lg border px-4 py-2 text-sm"
          >
            Back to Loans
          </button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}

      <PageHeader
        title={loan.loanAccountNumber}
        description="Loan account details and management"
        actions={
          <button
            onClick={() => navigate("/loans")}
            className="inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        }
      />

      {/* BASIC INFO */}

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">
              Loan Account Number
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {loan.loanAccountNumber}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Application:{" "}
              {loan.application
                ?.applicationNumber || "-"}
            </p>
          </div>

          <Badge
            variant={getStatusVariant(
              loan.status
            )}
          >
            {loan.status}
          </Badge>
        </div>
      </Card>

      {/* CUSTOMER + LENDER */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <User size={18} />
            </div>

            <div>
              <h3 className="font-semibold">
                Customer
              </h3>

              <p className="text-xs text-slate-500">
                Lead information
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500">
                Customer Name
              </p>

              <p className="font-medium">
                {loan.lead?.customerName || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Mobile
              </p>

              <p className="font-medium">
                {loan.lead?.mobile || "-"}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Loan Type
              </p>

              <p className="font-medium">
                {loan.lead?.loanType || "-"}
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-lg bg-slate-100 p-2">
              <CreditCard size={18} />
            </div>

            <div>
              <h3 className="font-semibold">
                Lender
              </h3>

              <p className="text-xs text-slate-500">
                Financing information
              </p>
            </div>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Lender Name
            </p>

            <p className="font-medium">
              {loan.lender?.name || "-"}
            </p>
          </div>
        </Card>
      </div>

      {/* FINANCIAL DETAILS */}

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <CreditCard size={18} />
          </div>

          <div>
            <h3 className="font-semibold">
              Financial Details
            </h3>

            <p className="text-xs text-slate-500">
              Loan amount and EMI information
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-5">
          <div>
            <p className="text-xs text-slate-500">
              Principal Amount
            </p>

            <p className="mt-1 font-semibold">
              {formatMoney(
                loan.principalAmount
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Disbursed Amount
            </p>

            <p className="mt-1 font-semibold">
              {formatMoney(
                loan.disbursedAmount
              )}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Interest Rate
            </p>

            <p className="mt-1 font-semibold">
              {loan.interestRate
                ? `${loan.interestRate}%`
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Tenure
            </p>

            <p className="mt-1 font-semibold">
              {loan.tenureMonths
                ? `${loan.tenureMonths} months`
                : "-"}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              EMI
            </p>

            <p className="mt-1 font-semibold">
              {formatMoney(loan.emiAmount)}
            </p>
          </div>
        </div>
      </Card>

      {/* IMPORTANT DATES */}

      <Card>
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-lg bg-slate-100 p-2">
            <Calendar size={18} />
          </div>

          <div>
            <h3 className="font-semibold">
              Important Dates
            </h3>

            <p className="text-xs text-slate-500">
              Loan lifecycle dates
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <div>
            <p className="text-xs text-slate-500">
              Disbursed At
            </p>

            <p className="mt-1 font-medium">
              {formatDate(loan.disbursedAt)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              First EMI Date
            </p>

            <p className="mt-1 font-medium">
              {formatDate(loan.firstEmiDate)}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-500">
              Maturity Date
            </p>

            <p className="mt-1 font-medium">
              {formatDate(loan.maturityDate)}
            </p>
          </div>
        </div>
      </Card>

      {/* STATUS ACTION */}

      <Card>
        <div className="mb-4">
          <h3 className="font-semibold">
            Loan Status
          </h3>

          <p className="text-sm text-slate-500">
            Update the current loan account status.
          </p>
        </div>

        <LoanStatus
          loan={loan}
          onUpdated={loadLoan}
        />
      </Card>

      {/* NEXT MODULES */}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link
          to={`/loans/${loan.id}/emi`}
          className="rounded-xl border bg-white p-5 transition hover:shadow-sm"
        >
          <FileText size={20} />

          <h3 className="mt-3 font-semibold">
            EMI Schedule
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            View EMI schedule and payment status.
          </p>
        </Link>

        <Link
          to={`/loans/${loan.id}/repayments`}
          className="rounded-xl border bg-white p-5 transition hover:shadow-sm"
        >
          <CreditCard size={20} />

          <h3 className="mt-3 font-semibold">
            Repayments
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            View loan repayment history.
          </p>
        </Link>

        <Link
          to="/collections"
          className="rounded-xl border bg-white p-5 transition hover:shadow-sm"
        >
          <Calendar size={20} />

          <h3 className="mt-3 font-semibold">
            Collections
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Manage collection follow-ups.
          </p>
        </Link>
      </div>
    </div>
  );
};

export default LoanDetails;