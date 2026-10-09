import { useCallback, useEffect, useState } from "react";
import { Eye, Plus, RefreshCw, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

import { getApplicationsApi } from "../../services/applications.api";

const Applications = () => {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getApplicationsApi({
        search: search.trim() || undefined,
        status: status || undefined,
        page,
        limit: 20,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      const payload = response?.data?.data || response?.data || {};
      const items = Array.isArray(payload.applications)
        ? payload.applications
        : Array.isArray(payload.items)
          ? payload.items
          : [];

      setApplications(items);
      setPagination(
        payload.pagination || {
          page: 1,
          limit: 20,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load applications.");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  const handleSearch = (event) => {
    setSearch(event.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Loan Applications"
        description="Manage loan applications and their lifecycle."
        actions={
          <Button onClick={() => navigate("/applications/create")}>
            <Plus size={17} />
            New Application
          </Button>
        }
      />

      <Card>
        <div className="grid gap-4 md:grid-cols-[1fr_220px_auto]">
          <div className="relative">
            <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={handleSearch}
              placeholder="Search application, customer or mobile..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="LOGIN">Login</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="DISBURSED">Disbursed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <Button variant="secondary" onClick={fetchApplications} disabled={loading}>
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </Button>
        </div>
      </Card>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <Card title="Applications" description={`${pagination.total || 0} applications found`}>
        {loading ? (
          <div className="flex items-center justify-center py-12 text-sm text-slate-500">
            <RefreshCw size={18} className="mr-2 animate-spin" />
            Loading applications...
          </div>
        ) : applications.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-sm font-medium text-slate-700">No applications found</p>
            <p className="mt-1 text-xs text-slate-500">Try changing your search or filters.</p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 text-left">
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Application</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Customer</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Lender</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Requested</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Status</th>
                    <th className="px-4 py-3 text-xs font-semibold text-slate-500">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id} className="border-b border-slate-100">
                      <td className="px-4 py-4">
                        <p className="text-sm font-semibold text-slate-800">{application.applicationNumber}</p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm font-medium text-slate-700">{application.lead?.customerName}</p>
                        <p className="text-xs text-slate-400">{application.lead?.mobile}</p>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {application.lender?.name || "-"}
                      </td>

                      <td className="px-4 py-4 text-sm font-medium text-slate-700">
                        ₹{Number(application.requestedAmount || 0).toLocaleString("en-IN")}
                      </td>

                      <td className="px-4 py-4">
                        <Badge status={application.status} />
                      </td>

                      <td className="px-4 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/applications/${application.id}`)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-3 md:hidden">
              {applications.map((application) => (
                <button
                  type="button"
                  key={application.id}
                  onClick={() => navigate(`/applications/${application.id}`)}
                  className="w-full rounded-xl border border-slate-200 p-4 text-left"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{application.applicationNumber}</p>
                      <p className="mt-1 text-sm text-slate-600">{application.lead?.customerName}</p>
                      <p className="mt-1 text-xs text-slate-400">{application.lender?.name || "No lender"}</p>
                    </div>

                    <Badge status={application.status} />
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.totalPages}
              </p>

              <div className="flex gap-2">
                <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => setPage((previous) => previous - 1)}>
                  Previous
                </Button>

                <Button
                  size="sm"
                  variant="secondary"
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((previous) => previous + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          </>
        )}
      </Card>
    </div>
  );
};

export default Applications;
