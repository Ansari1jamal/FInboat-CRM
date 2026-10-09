import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, RefreshCw } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import Timeline from "../../components/timeline/Timeline";
import PageLoader from "../../components/common/PageLoader";
import { getLeadApi, getLeadTimelineApi } from "../../services/lead.api";

const fetchLeadTimelineData = async (leadId) => {
  const [leadResponse, timelineResponse] = await Promise.all([
    getLeadApi(leadId),
    getLeadTimelineApi(leadId),
  ]);
  const timelineData =
    timelineResponse?.data?.timeline ??
    timelineResponse?.data?.items ??
    timelineResponse?.data?.events ??
    timelineResponse?.data ??
    [];

  return {
    lead: leadResponse?.data ?? leadResponse,
    events: Array.isArray(timelineData)
      ? [...timelineData].sort(
          (first, second) =>
            new Date(second.createdAt).getTime() -
            new Date(first.createdAt).getTime()
        )
      : [],
  };
};

const LeadTimelinePage = () => {
  const { leadId } = useParams();
  const [lead, setLead] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadTimeline = useCallback(async () => {
    try {
      const data = await fetchLeadTimelineData(leadId);
      setLead(data.lead);
      setEvents(data.events);
      setError("");
    } catch (requestError) {
      console.error("Lead timeline load failed:", requestError);
      setError(
        requestError?.response?.data?.message ||
          "Unable to load lead timeline."
      );
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadTimeline().finally(() => setRefreshing(false));
  };

  useEffect(() => {
    let active = true;

    const loadInitialTimeline = async () => {
      try {
        const data = await fetchLeadTimelineData(leadId);

        if (active) {
          setLead(data.lead);
          setEvents(data.events);
          setError("");
        }
      } catch (requestError) {
        if (active) {
          console.error("Lead timeline load failed:", requestError);
          setError(
            requestError?.response?.data?.message ||
              "Unable to load lead timeline."
          );
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadInitialTimeline();

    return () => {
      active = false;
    };
  }, [leadId]);

  if (loading) {
    return <PageLoader message="Loading timeline..." />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to={`/leads/${leadId}`}
            className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Lead
          </Link>

          <h1 className="text-2xl font-bold text-slate-900">Lead Timeline</h1>
          {lead && (
            <div className="mt-2">
              <p className="font-medium text-slate-800">
                {lead.customerName}
              </p>
              <p className="text-sm text-slate-500">{lead.mobile}</p>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={handleRefresh}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={17}
            className={refreshing ? "animate-spin" : ""}
            aria-hidden="true"
          />
          Refresh
        </button>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"
        >
          <p>{error}</p>
          <button
            type="button"
            onClick={() => loadTimeline()}
            className="mt-3 font-semibold underline"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          {lead && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <SummaryCard label="Current Status" value={lead.status} />
              <SummaryCard label="Loan Type" value={lead.loanType} />
              <SummaryCard label="Assigned To" value={lead.assignedTo?.name} />
              <SummaryCard label="Activities" value={events.length} />
            </div>
          )}

          <section>
            <h2 className="mb-4 text-lg font-semibold text-slate-900">
              Activity History
            </h2>
            <Timeline events={events} />
          </section>
        </>
      )}
    </div>
  );
};

const SummaryCard = ({ label, value }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <p className="text-xs text-slate-500">{label}</p>
    <p className="mt-1 wrap-break-word font-semibold text-slate-900">
      {value ?? "-"}
    </p>
  </div>
);

export default LeadTimelinePage;
