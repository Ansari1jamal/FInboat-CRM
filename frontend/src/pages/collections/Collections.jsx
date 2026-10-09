import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Eye, Plus, RefreshCw, Search } from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";
import {
  createCollectionApi,
  getCollectionsApi,
  getCollectionSummaryApi,
  getDueEmisApi,
} from "../../services/collections.api";
import {
  COLLECTION_STATUS,
  COLLECTION_TYPES,
} from "./collection.constants";

const dateInput = () => {
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

const Collections = () => {
  const [followUps, setFollowUps] = useState([]);
  const [dueEmis, setDueEmis] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [selectedEmi, setSelectedEmi] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    type: "COLLECTION_CALL",
    scheduledDate: dateInput(),
    scheduledTime: "10:00",
    notes: "",
    promisedAmount: "",
    promisedDate: "",
  });

  const loadCollections = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [followUpResponse, dueResponse, summaryResponse] = await Promise.all([
        getCollectionsApi({ status: status || undefined, limit: 100 }),
        getDueEmisApi({ limit: 100 }),
        getCollectionSummaryApi(),
      ]);
      const followUpList = followUpResponse?.data;
      const dueList = dueResponse?.data;
      setFollowUps(Array.isArray(followUpList) ? followUpList : followUpList?.items || []);
      setDueEmis(Array.isArray(dueList) ? dueList : dueList?.items || []);
      setSummary(summaryResponse?.data || {});
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Unable to load collection data.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    loadCollections();
  }, [loadCollections]);

  const visibleFollowUps = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return followUps;
    return followUps.filter((item) => [
      item.loanAccount?.lead?.customerName,
      item.loanAccount?.lead?.mobile,
      item.loanAccount?.loanAccountNumber,
      item.emiSchedule?.emiNumber,
      item.notes,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [followUps, search]);

  const visibleEmis = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return dueEmis;
    return dueEmis.filter((emi) => [
      emi.loanAccount?.lead?.customerName,
      emi.loanAccount?.lead?.mobile,
      emi.loanAccount?.loanAccountNumber,
      emi.emiNumber,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [dueEmis, search]);

  const openFollowUpForm = (emi) => {
    setError("");
    setSelectedEmi(emi);
    setForm({
      type: Number(emi.daysOverdue) > 0 ? "EMI_OVERDUE" : "EMI_DUE",
      scheduledDate: dateInput(),
      scheduledTime: "10:00",
      notes: "",
      promisedAmount: "",
      promisedDate: "",
    });
  };

  const handleCreateFollowUp = async (event) => {
    event.preventDefault();
    if (!selectedEmi) return;
    try {
      setSaving(true);
      setError("");
      await createCollectionApi(selectedEmi.loanAccount?.id || selectedEmi.loanAccountId, {
        emiScheduleId: selectedEmi.id,
        type: form.type,
        scheduledDate: form.scheduledDate,
        scheduledTime: form.scheduledTime,
        notes: form.notes.trim() || undefined,
        promisedAmount: form.promisedAmount ? Number(form.promisedAmount) : undefined,
        promisedDate: form.promisedDate || undefined,
      });
      setSelectedEmi(null);
      await loadCollections();
    } catch (saveError) {
      setError(saveError?.response?.data?.message || "Unable to schedule collection follow-up.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Collection Management"
        description="Track due EMIs and collection follow-up activity"
        actions={
          <Button variant="secondary" disabled={loading} onClick={loadCollections}>
            <RefreshCw size={16} />
            Refresh
          </Button>
        }
      />

      {error && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[
          ["Due / Pending EMIs", summary.pendingEmis ?? 0],
          ["Due Today", summary.dueTodayEmis ?? 0],
          ["Overdue EMIs", summary.overdueEmis ?? 0],
          ["Outstanding", formatMoney(summary.totalOutstanding ?? 0)],
        ].map(([label, value]) => (
          <Card key={label}><p className="text-xs text-slate-500">{label}</p><p className="mt-1 text-xl font-bold">{value}</p></Card>
        ))}
      </div>

      <Card>
        <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
          <label className="relative block">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search customer, mobile or loan..."
              className="h-10 w-full rounded-lg border border-slate-300 pl-9 pr-3 text-sm"
            />
          </label>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-10 rounded-lg border border-slate-300 bg-white px-3 text-sm"
          >
            <option value="">All follow-up statuses</option>
            {COLLECTION_STATUS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
          </select>
          <Button variant="secondary" onClick={loadCollections}><RefreshCw size={15} />Reload</Button>
        </div>
      </Card>

      <Card title="Due and Overdue EMIs" description="Schedule a collection follow-up against a specific unpaid EMI.">
        {loading ? <p className="py-6 text-center text-sm text-slate-500">Loading due EMIs...</p> : visibleEmis.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No due or overdue EMIs found.</p>
        ) : (
          <div className="space-y-3">
            {visibleEmis.map((emi) => (
              <div key={emi.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-semibold">{emi.loanAccount?.lead?.customerName || "-"} <span className="font-normal text-slate-500">· EMI #{emi.emiNumber}</span></p>
                  <p className="mt-1 text-xs text-slate-500">
                    {emi.loanAccount?.loanAccountNumber || "-"} · {emi.loanAccount?.lead?.mobile || "-"} · Due {formatDate(emi.dueDate)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-4 md:justify-end">
                  <div className="text-right">
                    <p className="font-semibold">{formatMoney(emi.outstandingAmount)}</p>
                    <p className="text-xs text-slate-500">{Number(emi.daysOverdue) > 0 ? `${emi.daysOverdue} days overdue` : "Due today"}</p>
                  </div>
                  <Button size="sm" onClick={() => openFollowUpForm(emi)}><Plus size={15} />Follow-up</Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {selectedEmi && (
        <Card
          title={`Schedule follow-up · EMI #${selectedEmi.emiNumber}`}
          description={`${selectedEmi.loanAccount?.lead?.customerName || "Customer"} · ${selectedEmi.loanAccount?.loanAccountNumber || ""}`}
          actions={<Button variant="ghost" onClick={() => setSelectedEmi(null)}>Close</Button>}
        >
          <form onSubmit={handleCreateFollowUp} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <label className="text-sm font-medium text-slate-700">
              Activity type
              <select value={form.type} onChange={(event) => setForm({ ...form, type: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3">
                {COLLECTION_TYPES.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
              </select>
            </label>
            <label className="text-sm font-medium text-slate-700">
              Scheduled date
              <input type="date" required value={form.scheduledDate} onChange={(event) => setForm({ ...form, scheduledDate: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Scheduled time
              <input type="time" required value={form.scheduledTime} onChange={(event) => setForm({ ...form, scheduledTime: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Promised amount
              <input type="number" min="0.01" step="0.01" value={form.promisedAmount} onChange={(event) => setForm({ ...form, promisedAmount: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <label className="text-sm font-medium text-slate-700">
              Promise date
              <input type="date" value={form.promisedDate} onChange={(event) => setForm({ ...form, promisedDate: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <label className="text-sm font-medium text-slate-700 sm:col-span-2 lg:col-span-1">
              Notes
              <input value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 h-10 w-full rounded-lg border border-slate-300 px-3" />
            </label>
            <div className="flex justify-end sm:col-span-2 lg:col-span-3">
              <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Schedule follow-up"}</Button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Collection Follow-ups">
        {loading ? <p className="py-6 text-center text-sm text-slate-500">Loading collection activity...</p> : visibleFollowUps.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-500">No collection follow-ups found.</p>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-[900px] text-sm">
                <thead><tr className="border-b bg-slate-50 text-left">
                  {["Customer", "Loan", "EMI", "Scheduled", "Promised", "Status", "Assigned To", ""].map((title) => <th key={title} className="px-4 py-3 font-semibold">{title}</th>)}
                </tr></thead>
                <tbody>{visibleFollowUps.map((item) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="px-4 py-3">{item.loanAccount?.lead?.customerName || "-"}<div className="text-xs text-slate-500">{item.loanAccount?.lead?.mobile || ""}</div></td>
                    <td className="px-4 py-3">{item.loanAccount?.loanAccountNumber || "-"}</td>
                    <td className="px-4 py-3">{item.emiSchedule?.emiNumber ? `#${item.emiSchedule.emiNumber}` : "-"}</td>
                    <td className="px-4 py-3">{formatDate(item.scheduledDate)} {item.scheduledTime || ""}</td>
                    <td className="px-4 py-3">{item.promisedAmount ? formatMoney(item.promisedAmount) : "-"}</td>
                    <td className="px-4 py-3"><Badge status={item.status}>{item.status}</Badge></td>
                    <td className="px-4 py-3">{item.assignedTo?.name || "-"}</td>
                    <td className="px-4 py-3"><Link to={`/collections/${item.id}`} className="inline-flex items-center gap-1 font-medium text-blue-700"><Eye size={14} />View</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
            <div className="space-y-3 md:hidden">
              {visibleFollowUps.map((item) => (
                <div key={item.id} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex justify-between gap-3">
                    <div><p className="font-semibold">{item.loanAccount?.lead?.customerName || "-"}</p><p className="text-xs text-slate-500">{item.loanAccount?.loanAccountNumber || "-"} · {item.emiSchedule?.emiNumber ? `EMI #${item.emiSchedule.emiNumber}` : "No EMI"}</p></div>
                    <Badge status={item.status}>{item.status}</Badge>
                  </div>
                  <p className="mt-3 flex items-center gap-1 text-sm text-slate-600"><Calendar size={14} />{formatDate(item.scheduledDate)} {item.scheduledTime || ""}</p>
                  <Link to={`/collections/${item.id}`} className="mt-3 inline-flex w-full justify-center rounded-lg border px-3 py-2 text-sm">View Follow-up</Link>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Collections;
