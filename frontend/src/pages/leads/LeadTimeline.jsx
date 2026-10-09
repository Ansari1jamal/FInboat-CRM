import {
  Clock,
} from "lucide-react";

const LeadTimeline = ({
  items = [],
  error = "",
}) => {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Timeline
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Recent activity on this lead
          </p>
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          {error}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl bg-slate-50 p-6 text-center">
          <Clock
            size={22}
            className="mx-auto text-slate-400"
          />

          <p className="mt-2 text-sm text-slate-500">
            No timeline activity yet.
          </p>
        </div>
      ) : (
        <div className="relative space-y-6">
          {items.map(
            (item, index) => (
              <div
                key={
                  item.id ||
                  index
                }
                className="relative flex gap-4"
              >
                <div className="relative flex flex-col items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                    <Clock size={16} />
                  </div>

                  {index !==
                    items.length - 1 && (
                    <div className="absolute top-9 h-full w-px bg-slate-200" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="font-medium text-slate-800">
                    {item.title ||
                      item.action ||
                      "Activity"}
                  </p>

                  {item.description && (
                    <p className="mt-1 text-sm text-slate-500">
                      {item.description}
                    </p>
                  )}

                  {item.createdAt && (
                    <p className="mt-2 text-xs text-slate-400">
                      {new Date(
                        item.createdAt
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </p>
                  )}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default LeadTimeline;