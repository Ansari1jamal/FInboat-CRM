import {
  useState,
} from "react";

import {
  CheckCircle2,
} from "lucide-react";

import Button from "../../components/common/Button";
import Select from "../../components/common/Select";

import {
  updateLeadStatusApi,
} from "../../services/lead.api";

const STATUS_OPTIONS = [
  {
    value: "NEW",
    label: "New",
  },
  {
    value: "INTERESTED",
    label: "Interested",
  },
  {
    value: "DOCUMENTS_PENDING",
    label: "Documents Pending",
  },
  {
    value: "LOGIN",
    label: "Login",
  },
  {
    value: "APPROVED",
    label: "Approved",
  },
  {
    value: "DISBURSED",
    label: "Disbursed",
  },
  {
    value: "REJECTED",
    label: "Rejected",
  },
];

// ========================================
// ALLOWED TRANSITIONS
// ========================================

const STATUS_TRANSITIONS = {
  NEW: [
    "INTERESTED",
    "REJECTED",
  ],

  INTERESTED: [
    "DOCUMENTS_PENDING",
    "REJECTED",
  ],

  DOCUMENTS_PENDING: [
    "LOGIN",
    "REJECTED",
  ],

  LOGIN: [
    "APPROVED",
    "REJECTED",
  ],

  APPROVED: [
    "DISBURSED",
    "REJECTED",
  ],

  DISBURSED: [],

  REJECTED: [],
};

const LeadStatusControl = ({
  lead,
  onUpdated,
}) => {
  const [status, setStatus] =
    useState("");

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!lead) {
    return null;
  }

  const currentStatus =
    lead.status;

  const allowedStatuses =
    STATUS_TRANSITIONS[
      currentStatus
    ] || [];

  const options =
    STATUS_OPTIONS.filter(
      (option) =>
        allowedStatuses.includes(
          option.value
        )
    );

  const handleUpdate =
    async () => {
      if (!status) {
        return;
      }

      try {
        setSaving(true);
        setError("");

        const response =
          await updateLeadStatusApi(
            lead.id,
            status
          );

        const updatedLead =
          response?.data?.lead ||
          response?.data;

        setStatus("");

        if (onUpdated) {
          onUpdated(
            updatedLead
          );
        }
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to update lead status."
        );
      } finally {
        setSaving(false);
      }
    };

  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
          <CheckCircle2 size={19} />
        </div>

        <div>
          <h3 className="text-sm font-semibold text-slate-900">
            Lead Status
          </h3>

          <p className="text-xs text-slate-500">
            Current status
          </p>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-slate-700">
          {currentStatus}
        </p>
      </div>

      {options.length > 0 ? (
        <div className="mt-4 space-y-3">
          <Select
            label="Change Status"
            value={status}
            onChange={(event) =>
              setStatus(
                event.target.value
              )
            }
            placeholder="Select next status"
            options={options}
          />

          <Button
            onClick={handleUpdate}
            loading={saving}
            disabled={!status}
            className="w-full"
          >
            Update Status
          </Button>
        </div>
      ) : (
        <div className="mt-4 rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-500">
            No further status transition
            is available.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default LeadStatusControl;