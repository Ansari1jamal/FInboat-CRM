import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, CheckCircle2, FileText, RefreshCw } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Badge from "../../components/common/Badge";

import {
  getApplicationByIdApi,
  getApplicationStatusHistoryApi,
  updateApplicationStatusApi,
} from "../../services/applications.api";
import { convertApplicationToLoanApi } from "../../services/loans.api";

import { APPLICATION_STATUS_FLOW } from "./application.constants";
import ApplicationStatus from "./ApplicationStatus";

const ApplicationDetails = () => {
  const { id: applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const fetchApplication = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [applicationResponse, historyResponse] = await Promise.all([
        getApplicationByIdApi(applicationId),
        getApplicationStatusHistoryApi(applicationId),
      ]);

      const appData = applicationResponse?.data?.data || applicationResponse?.data || null;
      const historyData = historyResponse?.data?.data || historyResponse?.data || [];

      setApplication(appData);
      setHistory(historyData);
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to load application.");
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    fetchApplication();
  }, [fetchApplication]);

  const handleStatusUpdate = async (nextStatus) => {
    let rejectionReason;
    let sanctionedAmount;
    let disbursedAmount;

    if (nextStatus === "APPROVED") {
      const amount = window.prompt(
        "Enter sanctioned amount:",
        String(application.requestedAmount ?? "")
      );

      if (amount === null) {
        return;
      }

      sanctionedAmount = Number(amount.trim());

      if (!Number.isFinite(sanctionedAmount) || sanctionedAmount <= 0) {
        setError("Enter a valid sanctioned amount greater than zero.");
        return;
      }
    }

    if (nextStatus === "DISBURSED") {
      const amount = window.prompt(
        "Enter disbursed amount:",
        String(application.sanctionedAmount ?? application.requestedAmount ?? "")
      );

      if (amount === null) {
        return;
      }

      disbursedAmount = Number(amount.trim());

      if (!Number.isFinite(disbursedAmount) || disbursedAmount <= 0) {
        setError("Enter a valid disbursed amount greater than zero.");
        return;
      }
    }

    if (nextStatus === "REJECTED") {
      rejectionReason = window.prompt("Enter rejection reason:");

      if (!rejectionReason?.trim()) {
        return;
      }
    }

    try {
      setUpdating(true);
      setError("");

      await updateApplicationStatusApi(applicationId, {
        status: nextStatus,
        ...(sanctionedAmount !== undefined && { sanctionedAmount }),
        ...(disbursedAmount !== undefined && { disbursedAmount }),
        ...(rejectionReason && { rejectionReason: rejectionReason.trim() }),
      });

      await fetchApplication();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to update application status.");
    } finally {
      setUpdating(false);
    }
  };

  const handleCreateLoanAccount = async () => {
    try {
      setUpdating(true);
      setError("");

      await convertApplicationToLoanApi(applicationId);
      await fetchApplication();
    } catch (err) {
      setError(err?.response?.data?.message || "Unable to create loan account.");
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center text-sm text-slate-500">
        <RefreshCw size={18} className="mr-2 animate-spin" />
        Loading application...
      </div>
    );
  }

  if (!application) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
        <p className="font-medium text-slate-800">Application not found</p>

        <Button className="mt-4" onClick={() => navigate("/applications")}>
          Back to Applications
        </Button>
      </div>
    );
  }

  const currentStatus = application.status;
  const nextStatuses = APPLICATION_STATUS_FLOW[currentStatus] || [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={application.applicationNumber}
        description="Loan application details and status management."
        actions={
          <Button variant="secondary" onClick={() => navigate("/applications")}>
            <ArrowLeft size={18} />
            Applications
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Application" className="lg:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <Info label="Application Number" value={application.applicationNumber} />
            <Info label="Status" value={<Badge status={application.status} />} />
            <Info label="Customer" value={application.lead?.customerName || "-"} />
            <Info label="Mobile" value={application.lead?.mobile || "-"} />
            <Info label="Loan Type" value={application.lead?.loanType || "-"} />
            <Info label="Lender" value={application.lender?.name || "-"} />
            <Info label="Requested Amount" value={`₹${Number(application.requestedAmount || 0).toLocaleString("en-IN")}`} />
            <Info
              label="Sanctioned Amount"
              value={application.sanctionedAmount ? `₹${Number(application.sanctionedAmount).toLocaleString("en-IN")}` : "-"}
            />
            <Info
              label="Disbursed Amount"
              value={application.disbursedAmount ? `₹${Number(application.disbursedAmount).toLocaleString("en-IN")}` : "-"}
            />
          </div>
        </Card>

        <Card title="Next Action" description="Move the application through its lifecycle.">
          {nextStatuses.length === 0 ? (
            <div className="rounded-xl bg-slate-50 p-4">
              <p className="text-sm font-medium text-slate-700">No further status transitions.</p>
              <p className="mt-1 text-xs text-slate-500">This application is in a terminal state.</p>
            </div>
          ) : (
            <ApplicationStatus status={currentStatus} loading={updating} onStatusChange={handleStatusUpdate} />
          )}
        </Card>
      </div>

      {application.status === "DISBURSED" && (
        <Card
          title="Loan Account"
          description={
            application.loanAccount
              ? "This application has been converted into a loan account."
              : "Create a loan account for this disbursed application."
          }
        >
          {application.loanAccount?.id ? (
            <Link
              to={`/loans/${application.loanAccount.id}`}
              className="inline-flex items-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              View Loan Account
            </Link>
          ) : (
            <Button disabled={updating} onClick={handleCreateLoanAccount}>
              {updating ? "Creating..." : "Create Loan Account"}
            </Button>
          )}
        </Card>
      )}

      <Card title="Application Documents" description="Documents linked to this application.">
        {application.documents?.length ? (
          <div className="space-y-3">
            {application.documents.map((document) => (
              <div key={document.id} className="flex items-center justify-between rounded-xl border border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <FileText size={19} className="text-slate-500" />

                  <div>
                    <p className="text-sm font-medium text-slate-700">{document.docType || document.documentType || "Document"}</p>
                    <p className="text-xs text-slate-400">{document.fileName}</p>
                  </div>
                </div>

                <Badge status={document.status} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">No documents linked to this application.</p>
        )}
      </Card>

      <Card title="Application Timeline" description="Status changes recorded for this application.">
        {history.length === 0 ? (
          <p className="text-sm text-slate-500">No status history available.</p>
        ) : (
          <div className="space-y-5">
            {history.map((item, index) => (
              <div key={item.id || index} className="relative flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
                    <CheckCircle2 size={17} className="text-slate-600" />
                  </div>
                  {index < history.length - 1 && <div className="mt-2 h-full w-px bg-slate-200" />}
                </div>

                <div className="pb-5">
                  <p className="text-sm font-semibold text-slate-800">{item.toStatus}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {item.createdAt ? new Date(item.createdAt).toLocaleString("en-IN") : "-"}
                  </p>

                  {item.note && <p className="mt-2 text-sm text-slate-600">{item.note}</p>}

                  {item.rejectionReason && (
                    <p className="mt-2 text-sm text-red-600">Reason: {item.rejectionReason}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

const Info = ({ label, value }) => {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-700">{value || "-"}</div>
    </div>
  );
};

export default ApplicationDetails;
