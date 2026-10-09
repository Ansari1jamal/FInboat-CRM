import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CreditCard, Plus, RefreshCw } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { createRepaymentApi, getRepaymentsApi } from "../../services/repayments.api";
import { getEmiScheduleApi } from "../../services/emi.api";

const PAYMENT_MODES = [
  ["CASH", "Cash"],
  ["BANK_TRANSFER", "Bank Transfer"],
  ["UPI", "UPI"],
  ["NACH", "NACH"],
  ["CHEQUE", "Cheque"],
  ["ONLINE", "Online"],
  ["OTHER", "Other"],
];

const todayInput = () => {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const formatMoney = (value) =>
  value === null || value === undefined
    ? "-"
    : `₹${Number(value).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const initialForm = (emiScheduleId = "") => ({
  emiScheduleId,
  amount: "",
  paymentDate: todayInput(),
  paymentMode: "UPI",
  transactionId: "",
  referenceNumber: "",
  remarks: "",
});

const Repayments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedEmiId = searchParams.get("emiId") || "";
  const [repayments, setRepayments] = useState([]);
  const [emis, setEmis] = useState([]);
  const [loan, setLoan] = useState(null);
  const [form, setForm] = useState(() => initialForm(selectedEmiId));
  const [showForm, setShowForm] = useState(Boolean(selectedEmiId));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadRepayments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [repaymentResponse, scheduleResponse] = await Promise.all([
        getRepaymentsApi(id, { limit: 100 }),
        getEmiScheduleApi(id),
      ]);
      const repaymentData = repaymentResponse?.data || {};
      const scheduleData = scheduleResponse?.data || {};
      setRepayments(
        Array.isArray(repaymentData)
          ? repaymentData
          : repaymentData.items || repaymentData.repayments || []
      );
      setLoan(repaymentData.loan || scheduleData.loan || null);
      setEmis(Array.isArray(scheduleData) ? scheduleData : scheduleData.items || []);
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Unable to load repayment history.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRepayments();
  }, [loadRepayments]);

  useEffect(() => {
    setForm((current) => ({ ...current, emiScheduleId: selectedEmiId }));
    setShowForm(Boolean(selectedEmiId));
  }, [selectedEmiId]);

  const selectedEmi = emis.find((emi) => emi.id === form.emiScheduleId);
  const totalPaid = repayments.reduce((sum, repayment) => sum + Number(repayment.amount || 0), 0);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const amount = Number(form.amount);
    if (!form.emiScheduleId) {
      setError("Select the EMI this payment is for.");
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setError("Payment amount must be greater than zero.");
      return;
    }
    if (selectedEmi && amount > Number(selectedEmi.outstandingAmount)) {
      setError(`Payment cannot exceed the outstanding amount of ${formatMoney(selectedEmi.outstandingAmount)}.`);
      return;
    }
    if (!form.paymentDate) {
      setError("Payment date is required.");
      return;
    }

    try {
      setSaving(true);
      await createRepaymentApi(id, {
        emiScheduleId: form.emiScheduleId,
        amount,
        paymentDate: form.paymentDate,
        paymentMode: form.paymentMode,
        transactionId: form.transactionId.trim() || undefined,
        referenceNumber: form.referenceNumber.trim() || undefined,
        remarks: form.remarks.trim() || undefined,
      });
      setForm(initialForm());
      setShowForm(false);
      await loadRepayments();
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Unable to record repayment.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Repayments"
        description={loan?.loanAccountNumber ? `Loan Account: ${loan.loanAccountNumber}` : "Manage loan repayments"}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/loans/${id}`)}>
              <ArrowLeft size={16} />
              Back to Loan
            </Button>
            <Button variant="secondary" disabled={loading} onClick={loadRepayments}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </>
        }
      />

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card><p className="text-xs text-slate-500">Total Repayments</p><p className="mt-1 text-xl font-bold">{repayments.length}</p></Card>
        <Card><p className="text-xs text-slate-500">Total Paid</p><p className="mt-1 text-xl font-bold">{formatMoney(totalPaid)}</p></Card>
        <Card><p className="text-xs text-slate-500">Loan Account</p><p className="mt-1 truncate text-xl font-bold">{loan?.loanAccountNumber || "-"}</p></Card>
      </div>

      <div className="flex justify-end">
        <Button onClick={() => setShowForm((visible) => !visible)}>
          <Plus size={16} />
          {showForm ? "Close Form" : "Record Payment"}
        </Button>
      </div>

      {showForm && (
        <Card title="Record Repayment" description="Record a payment received against this loan account.">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <label className="text-sm font-medium text-slate-700">
              EMI *
              <select
                required
                value={form.emiScheduleId}
                onChange={(event) => setForm({ ...form, emiScheduleId: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3"
              >
                <option value="">Select EMI</option>
                {emis.filter((emi) => Number(emi.outstandingAmount) > 0 && emi.status !== "WAIVED").map((emi) => (
                  <option key={emi.id} value={emi.id}>
                    EMI #{emi.emiNumber} — outstanding {formatMoney(emi.outstandingAmount)}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Payment Amount *
              <input
                type="number"
                required
                min="0.01"
                max={selectedEmi?.outstandingAmount}
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Payment Date *
              <input
                type="date"
                required
                value={form.paymentDate}
                onChange={(event) => setForm({ ...form, paymentDate: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Payment Mode *
              <select
                value={form.paymentMode}
                onChange={(event) => setForm({ ...form, paymentMode: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3"
              >
                {PAYMENT_MODES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Transaction ID
              <input
                value={form.transactionId}
                onChange={(event) => setForm({ ...form, transactionId: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Reference Number
              <input
                value={form.referenceNumber}
                onChange={(event) => setForm({ ...form, referenceNumber: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2">
              Remarks
              <textarea
                rows="3"
                value={form.remarks}
                onChange={(event) => setForm({ ...form, remarks: event.target.value })}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="flex justify-end sm:col-span-2">
              <Button type="submit" disabled={saving}>
                <CreditCard size={16} />
                {saving ? "Saving..." : "Record Repayment"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {emis.length === 0 && !loading && (
        <Card>
          <p className="text-sm text-slate-600">No EMI schedule exists for this loan yet.</p>
          <Link className="mt-3 inline-flex font-medium text-blue-700 hover:underline" to={`/loans/${id}/emi`}>
            Generate EMI schedule
          </Link>
        </Card>
      )}

      <Card title="Repayment History">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full min-w-[900px] text-sm">
            <thead><tr className="border-b bg-slate-50 text-left">
              {["Date", "EMI #", "Amount", "Payment Mode", "Transaction ID", "Reference", "Received By"].map((title) => (
                <th key={title} className="px-4 py-3 font-semibold">{title}</th>
              ))}
            </tr></thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">Loading repayments...</td></tr>
              ) : repayments.length === 0 ? (
                <tr><td colSpan="7" className="px-4 py-10 text-center text-slate-500">No repayments recorded.</td></tr>
              ) : repayments.map((repayment) => (
                <tr key={repayment.id} className="border-b last:border-0">
                  <td className="px-4 py-3">{formatDate(repayment.paymentDate)}</td>
                  <td className="px-4 py-3">{repayment.emiSchedule?.emiNumber ? `#${repayment.emiSchedule.emiNumber}` : "-"}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(repayment.amount)}</td>
                  <td className="px-4 py-3">{repayment.paymentMode?.replaceAll("_", " ") || "-"}</td>
                  <td className="max-w-40 break-all px-4 py-3">{repayment.transactionId || "-"}</td>
                  <td className="max-w-40 break-all px-4 py-3">{repayment.referenceNumber || "-"}</td>
                  <td className="px-4 py-3">{repayment.receivedBy?.name || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {loading ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading repayments...</p>
          ) : repayments.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No repayments recorded.</p>
          ) : repayments.map((repayment) => (
            <div key={repayment.id} className="rounded-xl border border-slate-200 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{formatMoney(repayment.amount)}</p>
                  <p className="text-xs text-slate-500">{formatDate(repayment.paymentDate)} · {repayment.emiSchedule?.emiNumber ? `EMI #${repayment.emiSchedule.emiNumber}` : "EMI -"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium">{repayment.paymentMode?.replaceAll("_", " ") || "-"}</span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-500">Transaction ID</dt><dd className="break-all font-medium">{repayment.transactionId || "-"}</dd></div>
                <div><dt className="text-slate-500">Reference</dt><dd className="break-all font-medium">{repayment.referenceNumber || "-"}</dd></div>
                <div className="col-span-2"><dt className="text-slate-500">Received By</dt><dd className="font-medium">{repayment.receivedBy?.name || "-"}</dd></div>
              </dl>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default Repayments;
