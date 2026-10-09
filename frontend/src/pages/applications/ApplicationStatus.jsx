import { CheckCircle2, XCircle } from "lucide-react";

import Button from "../../components/common/Button";

import { APPLICATION_STATUS_FLOW } from "./application.constants";

const ApplicationStatus = ({ status, loading = false, onStatusChange }) => {
  const nextStatuses = APPLICATION_STATUS_FLOW[status] || [];

  if (!nextStatuses.length) {
    return (
      <div className="rounded-xl bg-slate-50 p-4">
        <p className="text-sm font-medium text-slate-700">
          Application is in a terminal state.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {nextStatuses.map((nextStatus) => (
        <Button
          key={nextStatus}
          className="w-full justify-center"
          variant={nextStatus === "REJECTED" ? "secondary" : "primary"}
          disabled={loading}
          onClick={() => onStatusChange(nextStatus)}
        >
          {nextStatus === "REJECTED" ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          Move to {nextStatus}
        </Button>
      ))}
    </div>
  );
};

export default ApplicationStatus;
