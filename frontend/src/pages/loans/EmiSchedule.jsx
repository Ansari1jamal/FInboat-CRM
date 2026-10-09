import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, RefreshCw } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { getEmiScheduleApi, generateEmiScheduleApi } from "../../services/emi.api";
import { getLoanByIdApi } from "../../services/loans.api";

const dateInputValue = (date) => {
  const localDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return localDate.toISOString().slice(0, 10);
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

const EmiSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);
  const [emis, setEmis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [scheduleForm, setScheduleForm] = useState({
    interestRate: "",
    tenureMonths: "",
    firstEmiDate: dateInputValue(new Date()),
  });

  const loadSchedule = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [loanResponse, scheduleResponse] = await Promise.all([
        getLoanByIdApi(id),
        getEmiScheduleApi(id),
      ]);
      const loanData = loanResponse?.data?.data || loanResponse?.data || null;
      const scheduleData = scheduleResponse?.data || {};
      const items = Array.isArray(scheduleData)
        ? scheduleData
        : scheduleData.items || scheduleData.emis || [];

      setLoan(loanData);
      setEmis(items);
      setScheduleForm((current) => ({
        ...current,
        interestRate: current.interestRate || loanData?.interestRate || "",
        tenureMonths: current.tenureMonths || loanData?.tenureMonths || "",
      }));
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Unable to load EMI schedule.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadSchedule();
  }, [loadSchedule]);

  const handleGenerate = async (event) => {
    event.preventDefault();
    const interestRate = Number(scheduleForm.interestRate);
    const tenureMonths = Number(scheduleForm.tenureMonths);

    if (!Number.isFinite(interestRate) || interestRate < 0) {
      setError("Enter a valid interest rate (zero or greater).");
      return;
    }
    if (!Number.isInteger(tenureMonths) || tenureMonths <= 0) {
      setError("Enter a valid tenure in months.");
      return;
    }
    if (!scheduleForm.firstEmiDate) {
      setError("First EMI date is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await generateEmiScheduleApi(id, {
        interestRate,
        tenureMonths,
        firstEmiDate: scheduleForm.firstEmiDate,
      });
      await loadSchedule();
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Unable to generate EMI schedule.");
    } finally {
      setSaving(false);
    }
  };

  const paidCount = emis.filter((emi) => emi.status === "PAID").length;
  const overdueCount = emis.filter((emi) => emi.status === "OVERDUE").length;
  const totalAmount = emis.reduce((sum, emi) => sum + Number(emi.emiAmount || 0), 0);
  const totalPaid = emis.reduce((sum, emi) => sum + Number(emi.paidAmount || 0), 0);
  const totalOutstanding = emis.reduce(
    (sum, emi) => sum + Number(emi.outstandingAmount || 0),
    0
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="EMI Schedule"
        description={loan?.loanAccountNumber ? `Loan Account: ${loan.loanAccountNumber}` : "View loan EMI schedule"}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate(`/loans/${id}`)}>
              <ArrowLeft size={16} />
              Back to Loan
            </Button>
            <Button variant="secondary" disabled={loading} onClick={loadSchedule}>
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

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {[
          ["Total EMIs", emis.length],
          ["Total EMI Amount", formatMoney(totalAmount)],
          ["Paid Amount", formatMoney(totalPaid)],
          ["Outstanding", formatMoney(totalOutstanding)],
          ["Overdue", `${overdueCount} (${paidCount} paid)`],
        ].map(([label, value]) => (
          <Card key={label}>
            <p className="text-xs text-slate-500">{label}</p>
            <p className="mt-1 text-xl font-bold">{value}</p>
          </Card>
        ))}
      </div>

      {!loading && emis.length === 0 && (
        <Card title="Generate EMI Schedule" description="The backend calculates each EMI amount and balance.">
          <form onSubmit={handleGenerate} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-sm font-medium text-slate-700">
              Annual interest rate (%)
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={scheduleForm.interestRate}
                onChange={(event) => setScheduleForm({ ...scheduleForm, interestRate: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Tenure (months)
              <input
                type="number"
                min="1"
                step="1"
                required
                value={scheduleForm.tenureMonths}
                onChange={(event) => setScheduleForm({ ...scheduleForm, tenureMonths: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <label className="text-sm font-medium text-slate-700">
              First EMI date
              <input
                type="date"
                required
                value={scheduleForm.firstEmiDate}
                onChange={(event) => setScheduleForm({ ...scheduleForm, firstEmiDate: event.target.value })}
                className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3"
              />
            </label>
            <div className="flex items-end">
              <Button type="submit" disabled={saving} className="w-full">
                {saving ? "Generating..." : "Generate schedule"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card className="hidden overflow-hidden md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-left">
                {["EMI #", "Due Date", "Principal", "Interest", "EMI Amount", "Paid", "Outstanding", "Status", "Paid At", ""].map((header) => (
                  <th key={header} className="px-4 py-3 font-semibold">{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" className="px-4 py-10 text-center text-slate-500">Loading EMI schedule...</td></tr>
              ) : emis.length === 0 ? (
                <tr><td colSpan="10" className="px-4 py-10 text-center text-slate-500">No EMI schedule found.</td></tr>
              ) : emis.map((emi) => (
                <tr key={emi.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-semibold">#{emi.emiNumber}</td>
                  <td className="px-4 py-3">{formatDate(emi.dueDate)}</td>
                  <td className="px-4 py-3">{formatMoney(emi.principalAmount)}</td>
                  <td className="px-4 py-3">{formatMoney(emi.interestAmount)}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(emi.emiAmount)}</td>
                  <td className="px-4 py-3">{formatMoney(emi.paidAmount)}</td>
                  <td className="px-4 py-3 font-semibold">{formatMoney(emi.outstandingAmount)}</td>
                  <td className="px-4 py-3"><Badge status={emi.status}>{emi.status}</Badge></td>
                  <td className="px-4 py-3">{formatDate(emi.paidAt)}</td>
                  <td className="px-4 py-3">
                    {Number(emi.outstandingAmount) > 0 && emi.status !== "WAIVED" && (
                      <Link className="font-medium text-blue-700 hover:underline" to={`/loans/${id}/repayments?emiId=${emi.id}`}>
                        Manage Payment
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="space-y-4 md:hidden">
        {loading ? <Card>Loading EMI schedule...</Card> : emis.map((emi) => (
          <Card key={emi.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">EMI #{emi.emiNumber}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-slate-500"><Calendar size={13} />{formatDate(emi.dueDate)}</p>
              </div>
              <Badge status={emi.status}>{emi.status}</Badge>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <p>EMI: <strong>{formatMoney(emi.emiAmount)}</strong></p>
              <p>Outstanding: <strong>{formatMoney(emi.outstandingAmount)}</strong></p>
              <p>Principal: {formatMoney(emi.principalAmount)}</p>
              <p>Interest: {formatMoney(emi.interestAmount)}</p>
              <p>Paid: {formatMoney(emi.paidAmount)}</p>
              <p>Paid at: {formatDate(emi.paidAt)}</p>
            </div>
            {Number(emi.outstandingAmount) > 0 && emi.status !== "WAIVED" && (
              <Link
                to={`/loans/${id}/repayments?emiId=${emi.id}`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
              >
                <CreditCard size={16} />
                Manage Payment
              </Link>
            )}
          </Card>
        ))}
        {!loading && emis.length === 0 && <Card>No EMI schedule found.</Card>}
      </div>
    </div>
  );
};

export default EmiSchedule;
