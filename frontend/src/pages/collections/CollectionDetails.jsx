import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, CreditCard, RefreshCw } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import { getCollectionByIdApi, updateCollectionApi } from "../../services/collections.api";
import { COLLECTION_STATUS } from "./collection.constants";

const dateInput = (value) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};

const formatMoney = (value) =>
  value === null || value === undefined ? "-" : `₹${Number(value).toLocaleString("en-IN")}`;

const formatDate = (value) =>
  value
    ? new Date(value).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "-";

const CollectionDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [collection, setCollection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    status: "PENDING",
    notes: "",
    promisedAmount: "",
    promisedDate: "",
  });

  const loadCollection = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getCollectionByIdApi(id);
      const data = response?.data?.data || response?.data || null;
      setCollection(data);
      if (data) {
        setForm({
          status: data.status || "PENDING",
          notes: data.notes || "",
          promisedAmount: data.promisedAmount ?? "",
          promisedDate: dateInput(data.promisedDate),
        });
      }
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Unable to load collection follow-up.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCollection();
  }, [loadCollection]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      setError("");
      const response = await updateCollectionApi(id, {
        status: form.status,
        notes: form.notes.trim(),
        promisedAmount: form.promisedAmount ? Number(form.promisedAmount) : undefined,
        promisedDate: form.promisedDate || undefined,
      });
      const updated = response?.data?.data || response?.data;
      if (updated) {
        setCollection(updated);
      }
      await loadCollection();
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Unable to update collection follow-up.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-10 text-center text-slate-500">Loading collection follow-up...</div>;
  }

  if (!collection) {
    return (
      <Card>
        <div className="py-8 text-center">
          <p className="text-slate-600">{error || "Collection follow-up not found."}</p>
          <Button className="mt-4" onClick={() => navigate("/collections")}>Back to Collections</Button>
        </div>
      </Card>
    );
  }

  const loan = collection.loanAccount || {};
  const customer = loan.lead || {};
  const emi = collection.emiSchedule || {};
  return (
    <div className="space-y-6">
      <PageHeader
        title="Collection Follow-up"
        description={`${customer.customerName || "Customer"} · ${loan.loanAccountNumber || "Loan account"}`}
        actions={
          <>
            <Button variant="secondary" onClick={() => navigate("/collections")}><ArrowLeft size={16} />Back</Button>
            <Button variant="secondary" disabled={loading} onClick={loadCollection}><RefreshCw size={16} />Refresh</Button>
          </>
        }
      />

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Customer and Loan">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-slate-500">Customer</p><p className="mt-1 font-medium">{customer.customerName || "-"}</p></div>
            <div><p className="text-xs text-slate-500">Mobile</p><p className="mt-1 font-medium">{customer.mobile || "-"}</p></div>
            <div><p className="text-xs text-slate-500">Loan Account</p><p className="mt-1 font-medium">{loan.loanAccountNumber || "-"}</p></div>
            <div><p className="text-xs text-slate-500">Assigned To</p><p className="mt-1 font-medium">{collection.assignedTo?.name || "-"}</p></div>
            <div><p className="text-xs text-slate-500">Activity Type</p><p className="mt-1 font-medium">{collection.type?.replaceAll("_", " ") || "-"}</p></div>
            <div><p className="text-xs text-slate-500">Status</p><Badge status={collection.status}>{collection.status}</Badge></div>
          </div>
        </Card>

        <Card title="EMI Details">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-xs text-slate-500">EMI Number</p><p className="mt-1 font-medium">{emi.emiNumber ? `#${emi.emiNumber}` : "-"}</p></div>
            <div><p className="text-xs text-slate-500">Due Date</p><p className="mt-1 flex items-center gap-1 font-medium"><Calendar size={14} />{formatDate(emi.dueDate)}</p></div>
            <div><p className="text-xs text-slate-500">EMI Amount</p><p className="mt-1 font-medium">{formatMoney(emi.emiAmount)}</p></div>
            <div><p className="text-xs text-slate-500">Outstanding</p><p className="mt-1 font-medium">{formatMoney(emi.outstandingAmount)}</p></div>
            <div><p className="text-xs text-slate-500">Scheduled Follow-up</p><p className="mt-1 font-medium">{formatDate(collection.scheduledDate)} {collection.scheduledTime || ""}</p></div>
            <div><p className="text-xs text-slate-500">Promise Date</p><p className="mt-1 font-medium">{formatDate(collection.promisedDate)}</p></div>
          </div>
        </Card>
      </div>

      <Card title="Update Collection Activity" description="Update the current follow-up status, promise and notes.">
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-slate-700">
            Status
            <select value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3">
              {COLLECTION_STATUS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
          <label className="text-sm font-medium text-slate-700">
            Promised Amount
            <input type="number" min="0.01" step="0.01" value={form.promisedAmount} onChange={(event) => setForm({ ...form, promisedAmount: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Promise-to-Pay Date
            <input type="date" value={form.promisedDate} onChange={(event) => setForm({ ...form, promisedDate: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" />
          </label>
          <label className="text-sm font-medium text-slate-700">
            Notes
            <textarea rows="3" value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2" />
          </label>
          <div className="flex justify-end sm:col-span-2">
            <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Update Follow-up"}</Button>
          </div>
        </form>
      </Card>

      {loan.id && emi.id && Number(emi.outstandingAmount) > 0 && (
        <Card title="Record Payment" description="Record money received through the repayment flow to update the EMI balance.">
          <Link
            to={`/loans/${loan.id}/repayments?emiId=${emi.id}`}
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white"
          >
            <CreditCard size={16} />Record Repayment
          </Link>
        </Card>
      )}
    </div>
  );
};

export default CollectionDetails;
