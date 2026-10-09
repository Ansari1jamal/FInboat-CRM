import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  Plus,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";
import Pagination from "../../components/common/Pagination";

import LeadStats from "./LeadStats";
import LeadTable from "./LeadTable";
import FilterPanel from "../../components/filters/FilterPanel";
import ExportButtons from "../../components/filters/ExportButtons";

import {
  exportLeadsCsvApi,
  exportLeadsExcelApi,
  getLeadsApi,
} from "../../services/lead.api";
import {
  LEAD_STATUS_OPTIONS,
  LOAN_TYPE_OPTIONS,
} from "./lead.filters";
import { downloadBlob } from "../../utils/downloadFile";

const Leads = () => {
  const navigate =
    useNavigate();

  const [leads, setLeads] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [totalPages, setTotalPages] =
    useState(1);

  const [filters, setFilters] =
    useState({
      search: "",
      status: "",
      loanType: "",
      fromDate: "",
      toDate: "",
    });

  const [appliedFilters, setAppliedFilters] =
    useState({});

  const [exportLoading, setExportLoading] =
    useState(false);

  const [exportError, setExportError] =
    useState("");

  const [stats, setStats] =
    useState({});

  const fetchLeads =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const result =
          await getLeadsApi({
            page,
            limit: 20,
            ...appliedFilters,
          });

        /*
         * Backend response ko yahan
         * safely handle kar rahe hain.
         */

        const data =
          result?.data || {};

        const leadList =
          Array.isArray(data)
            ? data
            : data.leads ||
              data.items ||
              [];

        setLeads(leadList);

        setTotalPages(
          data.pagination?.totalPages ||
            data.totalPages ||
            Math.ceil(
              (data.pagination?.total || data.total || 0) / 20
            ) ||
            1
        );

        setStats(
          data.stats || {}
        );
      } catch (err) {
        setError(
          err.response?.data
            ?.message ||
            "Unable to load leads."
        );
      } finally {
        setLoading(false);
      }
    }, [page, appliedFilters]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleApplyFilters = () => {
    setPage(1);
    setAppliedFilters({ ...filters });
  };

  const handleResetFilters = () => {
    const emptyFilters = {
      search: "",
      status: "",
      loanType: "",
      fromDate: "",
      toDate: "",
    };

    setFilters(emptyFilters);
    setPage(1);
    setAppliedFilters({});
    setExportError("");
  };

  const handleExport = async (format) => {
    try {
      setExportLoading(true);
      setExportError("");

      const exportApi =
        format === "csv"
          ? exportLeadsCsvApi
          : exportLeadsExcelApi;

      const blob = await exportApi(appliedFilters);
      const extension = format === "csv" ? "csv" : "xlsx";

      downloadBlob(
        blob,
        `finboat-leads-${Date.now()}.${extension}`
      );
    } catch (err) {
      console.error(`Lead ${format} export failed:`, err);
      setExportError(
        err.response?.data?.message ||
          `Unable to export leads as ${format.toUpperCase()}.`
      );
    } finally {
      setExportLoading(false);
    }
  };

  const handleViewLead = (
    lead
  ) => {
    navigate(
      `/leads/${lead.id}`
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads"
        description="Manage, track and assign customer leads."
        actions={
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <ExportButtons
              onExcel={() => handleExport("excel")}
              onCsv={() => handleExport("csv")}
              loading={exportLoading}
            />
            <Button
              variant="secondary"
              onClick={() =>
                navigate(
                  "/leads/bulk-upload"
                )
              }
            >
              Bulk Upload
            </Button>

            <Button
              onClick={() =>
                navigate(
                  "/leads/create"
                )
              }
            >
              <Plus size={18} />
              Add Lead
            </Button>
          </div>
        }
      />

      <LeadStats data={stats} />

      <FilterPanel
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      >
        <div className="md:col-span-2">
          <label
            htmlFor="lead-search"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Search
          </label>
          <input
            id="lead-search"
            type="search"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                search: event.target.value,
              }))
            }
            placeholder="Name or mobile"
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lead-status"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Status
          </label>
          <select
            id="lead-status"
            value={filters.status}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                status: event.target.value,
              }))
            }
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          >
            {LEAD_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="lead-loan-type"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            Loan Type
          </label>
          <select
            id="lead-loan-type"
            value={filters.loanType}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                loanType: event.target.value,
              }))
            }
            className="w-full rounded-lg border bg-white px-3 py-2 text-sm"
          >
            {LOAN_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="lead-from-date"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            From Date
          </label>
          <input
            id="lead-from-date"
            type="date"
            value={filters.fromDate}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                fromDate: event.target.value,
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label
            htmlFor="lead-to-date"
            className="mb-1 block text-sm font-medium text-slate-700"
          >
            To Date
          </label>
          <input
            id="lead-to-date"
            type="date"
            min={filters.fromDate || undefined}
            value={filters.toDate}
            onChange={(event) =>
              setFilters((current) => ({
                ...current,
                toDate: event.target.value,
              }))
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </div>
      </FilterPanel>

      {exportError && (
        <p role="alert" className="text-sm text-red-600">
          {exportError}
        </p>
      )}

      {loading ? (
        <LoadingState message="Loading leads..." />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={fetchLeads}
        />
      ) : (
        <>
          <LeadTable
            leads={leads}
            onView={handleViewLead}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};
 
export default Leads;