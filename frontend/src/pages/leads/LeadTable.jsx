import {
  Eye,
  MoreHorizontal,
} from "lucide-react";

import Badge from "../../components/common/Badge";

const LeadTable = ({
  leads = [],
  onView,
}) => {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {/* Desktop / Tablet */}

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[900px]">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Customer
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Mobile
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Loan Type
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Loan Amount
              </th>

              <th className="px-5 py-4 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Action
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="transition hover:bg-slate-50"
              >
                <td className="px-5 py-4">
                  <div>
                    <p className="font-medium text-slate-900">
                      {lead.customerName}
                    </p>

                    {lead.source && (
                      <p className="mt-1 text-xs text-slate-500">
                        Source:{" "}
                        {lead.source}
                      </p>
                    )}
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {lead.mobile}
                </td>

                <td className="px-5 py-4 text-sm text-slate-600">
                  {lead.loanType}
                </td>

                <td className="px-5 py-4 text-sm font-medium text-slate-700">
                  ₹{" "}
                  {Number(
                    lead.loanAmount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </td>

                <td className="px-5 py-4">
                  <Badge
                    status={lead.status}
                  />
                </td>

                <td className="px-5 py-4">
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onView?.(lead)
                      }
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      title="View Lead"
                    >
                      <Eye size={18} />
                    </button>

                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                    >
                      <MoreHorizontal
                        size={18}
                      />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile */}

      <div className="divide-y divide-slate-100 md:hidden">
        {leads.map((lead) => (
          <div
            key={lead.id}
            className="p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-semibold text-slate-900">
                  {lead.customerName}
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  {lead.mobile}
                </p>
              </div>

              <Badge
                status={lead.status}
              />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-xs text-slate-400">
                  Loan Type
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  {lead.loanType}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">
                  Amount
                </p>

                <p className="mt-1 font-medium text-slate-700">
                  ₹{" "}
                  {Number(
                    lead.loanAmount || 0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                onView?.(lead)
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Eye size={16} />
              View Lead
            </button>
          </div>
        ))}
      </div>

      {leads.length === 0 && (
        <div className="p-8 text-center text-sm text-slate-500">
          No leads found.
        </div>
      )}
    </div>
  );
};

export default LeadTable;