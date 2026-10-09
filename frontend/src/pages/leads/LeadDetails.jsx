import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  BriefcaseBusiness,
  Clock3,
  FilePlus2,
  FileText,
  FileUp,
  PhoneCall,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import LoadingState from "../../components/common/LoadingState";
import ErrorState from "../../components/common/ErrorState";

import LeadInfoCard from "./LeadInfoCard";
import LeadQuickActions from "./LeadQuickActions";
import LeadTimeline from "./LeadTimeline";
import LeadStatusControl from "./LeadStatusControl";
import LeadAssignment from "./LeadAssignment";
import LeadTransferHistory from "./LeadTransferHistory";
import CallHistory from "../calls/CallHistory";
import FollowUpHistory from "../followups/FollowUpHistory";
import DocumentList from "../documents/DocumentList";

import {
  getLeadApi,
  getLeadTimelineApi,
} from "../../services/lead.api";

const LeadDetails = () => {
  const {
    leadId,
  } = useParams();

  const navigate =
    useNavigate();

  const [lead, setLead] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [timeline, setTimeline] =
    useState([]);

  const [timelineError, setTimelineError] =
    useState("");

  const fetchLead =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getLeadApi(
            leadId
          );

        setLead(
          response?.data || null
        );

        try {
          const timelineResponse =
            await getLeadTimelineApi(leadId);

          setTimeline(
            timelineResponse?.data?.timeline || []
          );
          setTimelineError("");
        } catch (timelineRequestError) {
          console.error("Lead timeline preview failed:", timelineRequestError);
          setTimeline([]);
          setTimelineError(
            timelineRequestError?.response?.data?.message ||
              "Unable to load recent timeline activity."
          );
        }
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to load lead."
        );
      } finally {
        setLoading(false);
      }
    }, [leadId]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  // ======================================
  // LOADING
  // ======================================

  if (loading) {
    return (
      <LoadingState message="Loading lead details..." />
    );
  }

  // ======================================
  // ERROR
  // ======================================

  if (error) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() =>
            navigate("/leads")
          }
        >
          <ArrowLeft size={18} />
          Back to Leads
        </Button>

        <ErrorState
          message={error}
          onRetry={fetchLead}
        />
      </div>
    );
  }

  // ======================================
  // NOT FOUND
  // ======================================

  if (!lead) {
    return (
      <div className="space-y-4">
        <Button
          variant="secondary"
          onClick={() =>
            navigate("/leads")
          }
        >
          <ArrowLeft size={18} />
          Back to Leads
        </Button>

        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900">
            Lead not found
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            The requested lead could not
            be found.
          </p>
        </div>
      </div>
    );
  }

  // ======================================
  // TIMELINE
  // ======================================

  return (
    <div className="space-y-6">
      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <PageHeader
        title={
          lead.customerName ||
          "Lead Details"
        }
        description={`Lead ID: ${lead.id}`}
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              navigate("/leads")
            }
          >
            <ArrowLeft size={18} />
            Back to Leads
          </Button>
        }
      />

      {/* ================================= */}
      {/* PROFILE */}
      {/* ================================= */}

      <LeadInfoCard lead={lead} />

      {/* ================================= */}
      {/* QUICK ACTIONS */}
      {/* ================================= */}

      <LeadQuickActions
        onCall={() =>
          navigate(
            `/calls?leadId=${lead.id}`
          )
        }
        onFollowUp={() =>
          navigate(
            `/followups/create?leadId=${lead.id}`
          )
        }
        onDocument={() =>
          navigate(
            `/documents?leadId=${lead.id}`
          )
        }
        onEdit={() =>
          navigate(
            `/leads/${lead.id}/edit`
          )
        }
      />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() =>
            navigate(
              `/leads/${lead.id}/timeline`
            )
          }
        >
          <Clock3 size={17} />
          View Full Timeline
        </Button>

        <Button
          variant="secondary"
          onClick={() =>
            navigate(
              `/applications/create?leadId=${lead.id}`
            )
          }
        >
          <FilePlus2 size={17} />
          Create Application
        </Button>
      </div>

      {/* ================================= */}
      {/* GRID */}
      {/* ================================= */}

      <div className="grid gap-6 xl:grid-cols-3">
        {/* ================================= */}
        {/* MAIN */}
        {/* ================================= */}

        <div className="space-y-6 xl:col-span-2">
          {/* Loan Information */}

          <Card
            title="Loan Information"
            description="Current loan requirement"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">
                  Loan Type
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {lead.loanType ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Loan Amount
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  ₹{" "}
                  {Number(
                    lead.loanAmount ||
                      0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Source
                </p>

                <p className="mt-1 font-semibold text-slate-800">
                  {lead.source ||
                    "-"}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Status
                </p>

                <div className="mt-1">
                  <Badge
                    status={
                      lead.status
                    }
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Applications */}

          <Card
            title="Applications"
            description="Loan applications connected to this lead"
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate(
                    `/applications?leadId=${lead.id}`
                  )
                }
              >
                View All
              </Button>
            }
          >
            {lead.applications?.length ? (
              <div className="space-y-3">
                {lead.applications.map(
                  (application) => (
                    <div
                      key={
                        application.id
                      }
                      className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div>
                        <p className="font-medium text-slate-900">
                          {application.applicationNumber ||
                            application.id}
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          {application.status ||
                            "Unknown"}
                        </p>
                      </div>

                      {application.status && (
                        <Badge
                          status={
                            application.status
                          }
                        />
                      )}
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <BriefcaseBusiness
                  size={22}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-2 text-sm text-slate-500">
                  No applications yet.
                </p>
              </div>
            )}
          </Card>

          {/* Documents */}

          <Card
            title="Documents"
            description="Customer documents and KYC"
            actions={
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/documents?leadId=${lead.id}`
                    )
                  }
                >
                  <FileText size={16} />
                  Documents
                </Button>

                <Button
                  size="sm"
                  onClick={() =>
                    navigate(
                      `/documents/upload?leadId=${lead.id}`
                    )
                  }
                >
                  <FileUp size={16} />
                  Upload
                </Button>
              </div>
            }
          >
            {lead.documents?.length ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {lead.documents.map(
                  (document) => (
                    <div
                      key={
                        document.id
                      }
                      className="rounded-xl border border-slate-200 p-4"
                    >
                      <p className="font-medium text-slate-800">
                        {document.documentType ||
                          "Document"}
                      </p>

                      <div className="mt-2">
                        <Badge
                          status={
                            document.status
                          }
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="rounded-xl bg-slate-50 p-6 text-center">
                <FileText
                  size={22}
                  className="mx-auto text-slate-400"
                />

                <p className="mt-2 text-sm text-slate-500">
                  No documents uploaded.
                </p>
              </div>
            )}
          </Card>

          <CallHistory
            leadId={lead.id}
          />

          <FollowUpHistory
            leadId={lead.id}
          />

          <DocumentList
            leadId={lead.id}
          />
        </div>

        {/* ================================= */}
        {/* SIDEBAR */}
        {/* ================================= */}

        <div className="space-y-6">
          <LeadStatusControl
            lead={lead}
            onUpdated={(updatedLead) => {
              if (updatedLead) {
                setLead(updatedLead);
              } else {
                fetchLead();
              }
            }}
          />

          <LeadAssignment
            lead={lead}
            onUpdated={(updatedLead) => {
              if (updatedLead) {
                setLead(updatedLead);
              } else {
                fetchLead();
              }
            }}
          />

          <LeadTransferHistory
            leadId={lead.id}
          />

          {/* Follow Ups */}

          <Card
            title="Follow-ups"
            description="Upcoming customer follow-ups"
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate(
                    `/followups?leadId=${lead.id}`
                  )
                }
              >
                View
              </Button>
            }
          >
            {lead.followUps?.length ? (
              <div className="space-y-3">
                {lead.followUps
                  .slice(0, 3)
                  .map(
                    (followUp) => (
                      <div
                        key={
                          followUp.id
                        }
                        className="rounded-xl bg-slate-50 p-3"
                      >
                        <p className="text-sm font-medium text-slate-800">
                          {followUp.notes ||
                            "Follow-up"}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {followUp.followUpDate
                            ? new Date(
                                followUp.followUpDate
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </p>
                      </div>
                    )
                  )}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No follow-ups.
              </p>
            )}
          </Card>

          {/* Calls */}

          <Card
            title="Calls"
            description="Recent call activity"
            actions={
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  navigate(
                    `/calls?leadId=${lead.id}`
                  )
                }
              >
                View
              </Button>
            }
          >
            {lead.calls?.length ? (
              <div className="space-y-3">
                {lead.calls
                  .slice(0, 3)
                  .map((call) => (
                    <div
                      key={call.id}
                      className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                    >
                      <PhoneCall
                        size={17}
                        className="text-slate-500"
                      />

                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {call.callStatus ||
                            "Call"}
                        </p>

                        <p className="text-xs text-slate-500">
                          {call.createdAt
                            ? new Date(
                                call.createdAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No calls recorded.
              </p>
            )}
          </Card>

          {/* Timeline */}

          <LeadTimeline
            items={timeline}
            error={timelineError}
          />
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;