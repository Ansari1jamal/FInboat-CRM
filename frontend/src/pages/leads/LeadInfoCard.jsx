import {
  Phone,
  User,
  IndianRupee,
  CalendarDays,
} from "lucide-react";

import Badge from "../../components/common/Badge";

const LeadInfoCard = ({ lead }) => {
  if (!lead) {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {/* Header */}

      <div className="border-b border-slate-100 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
              {lead.customerName
                ?.charAt(0)
                ?.toUpperCase() || "L"}
            </div>

            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {lead.customerName}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Lead ID: {lead.id}
              </p>
            </div>
          </div>

          <Badge status={lead.status} />
        </div>
      </div>

      {/* Information */}

      <div className="grid gap-5 p-5 sm:grid-cols-2 lg:grid-cols-4">
        {/* Mobile */}

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Phone size={14} />
            Mobile
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {lead.mobile || "-"}
          </p>
        </div>

        {/* Loan */}

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <IndianRupee size={14} />
            Loan Type
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {lead.loanType || "-"}
          </p>
        </div>

        {/* Amount */}

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <IndianRupee size={14} />
            Loan Amount
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            ₹{" "}
            {Number(
              lead.loanAmount || 0
            ).toLocaleString("en-IN")}
          </p>
        </div>

        {/* Source */}

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User size={14} />
            Source
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {lead.source || "-"}
          </p>
        </div>

        {/* Created */}

        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays size={14} />
            Created
          </div>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {lead.createdAt
              ? new Date(
                  lead.createdAt
                ).toLocaleDateString("en-IN")
              : "-"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LeadInfoCard;