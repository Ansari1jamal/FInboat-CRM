import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  PhoneCall,
  RefreshCw,
} from "lucide-react";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

import {
  getLeadCallsApi,
} from "../../services/calls.api";

const CallHistory = ({
  leadId,
}) => {
  const [calls, setCalls] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchCalls =
    useCallback(async () => {
      if (!leadId) {
        setCalls([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getLeadCallsApi(
            leadId
          );

        setCalls(
          response?.data?.calls ||
            response?.data ||
            []
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to load calls."
        );
      } finally {
        setLoading(false);
      }
    }, [leadId]);

  useEffect(() => {
    fetchCalls();
  }, [fetchCalls]);

  return (
    <Card
      title="Call History"
      description="Customer communication history"
    >
      {/* LOADING */}

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
          <RefreshCw
            size={16}
            className="animate-spin"
          />
          Loading call history...
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        !error &&
        calls.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-7 text-center">
            <PhoneCall
              size={24}
              className="mx-auto text-slate-400"
            />

            <p className="mt-2 text-sm font-medium text-slate-700">
              No calls recorded
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Call activity will appear
              here after a call is logged.
            </p>
          </div>
        )}

      {/* CALLS */}

      {!loading &&
        !error &&
        calls.length > 0 && (
          <div className="space-y-3">
            {calls.map(
              (call, index) => (
                <div
                  key={
                    call.id ||
                    index
                  }
                  className="rounded-xl border border-slate-200 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                        <PhoneCall
                          size={18}
                          className="text-slate-600"
                        />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {call.callStatus ||
                            "Call"}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {call.calledAt || call.createdAt
                            ? new Date(
                                        call.calledAt || call.createdAt
                              ).toLocaleString(
                                "en-IN"
                              )
                            : "-"}
                        </p>
                      </div>
                    </div>

                    {call.callStatus && (
                      <Badge
                        status={
                          call.callStatus
                        }
                      />
                    )}
                  </div>

                  {/* DURATION */}

                  {/* NOTES */}

                  {call.remarks && (
                    <div className="mt-3 rounded-lg bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Notes
                      </p>

                      <p className="mt-1 text-sm text-slate-700">
                        {call.remarks}
                      </p>
                    </div>
                  )}

                  {/* USER */}

                  {(
                    call.telecaller
                      ?.name ||
                    call.user?.name ||
                    call.createdByName
                  ) && (
                    <p className="mt-3 text-xs text-slate-400">
                      Logged by{" "}
                      <span className="font-medium text-slate-600">
                        {call.telecaller
                          ?.name ||
                          call.user
                            ?.name ||
                          call.createdByName}
                      </span>
                    </p>
                  )}
                </div>
              )
            )}
          </div>
        )}
    </Card>
  );
};

export default CallHistory;