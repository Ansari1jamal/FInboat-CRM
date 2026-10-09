import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CalendarClock,
  CheckCircle2,
  Clock3,
  RefreshCw,
  XCircle,
} from "lucide-react";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";

import {
  getLeadFollowUpsApi,
  updateFollowUpApi,
} from "../../services/followups.api";

const FollowUpHistory = ({
  leadId,
}) => {
  const [followUps, setFollowUps] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState("");

  const [error, setError] =
    useState("");

  // ======================================
  // FETCH
  // ======================================

  const fetchFollowUps =
    useCallback(async () => {
      if (!leadId) {
        setFollowUps([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getLeadFollowUpsApi(
            leadId
          );

        setFollowUps(
          Array.isArray(
            response
          )
            ? response
            : response?.data ||
              []
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to load follow-ups."
        );
      } finally {
        setLoading(false);
      }
    }, [leadId]);

  useEffect(() => {
    fetchFollowUps();
  }, [fetchFollowUps]);

  // ======================================
  // UPDATE STATUS
  // ======================================

  const handleStatusUpdate =
    async (
      followUpId,
      status
    ) => {
      try {
        setUpdatingId(
          followUpId
        );
        setError("");

        await updateFollowUpApi(
          followUpId,
          {
            status,
          }
        );

        await fetchFollowUps();
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to update follow-up."
        );
      } finally {
        setUpdatingId("");
      }
    };

  return (
    <Card
      title="Follow-up History"
      description="Scheduled and completed customer follow-ups."
    >
      {/* LOADING */}

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
          <RefreshCw
            size={16}
            className="animate-spin"
          />
          Loading follow-ups...
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        followUps.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-7 text-center">
            <CalendarClock
              size={26}
              className="mx-auto text-slate-400"
            />

            <p className="mt-2 text-sm font-medium text-slate-700">
              No follow-ups found
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Schedule a follow-up for this
              lead.
            </p>
          </div>
        )}

      {/* LIST */}

      {!loading &&
        followUps.length > 0 && (
          <div className="space-y-4">
            {followUps.map(
              (followUp, index) => {
                const status =
                  followUp.status ||
                  "PENDING";

                const isUpdating =
                  updatingId ===
                  followUp.id;

                return (
                  <div
                    key={
                      followUp.id ||
                      index
                    }
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    {/* HEADER */}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="flex gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <Clock3
                            size={18}
                            className="text-slate-600"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {followUp.followUpDate
                              ? new Date(
                                  followUp.followUpDate
                                ).toLocaleString(
                                  "en-IN"
                                )
                              : "-"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            Scheduled
                            follow-up
                          </p>
                        </div>
                      </div>

                      <Badge
                        status={
                          status
                        }
                      />
                    </div>

                    {/* NOTES */}

                    {followUp.notes && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Notes
                        </p>

                        <p className="mt-1 text-sm text-slate-700">
                          {
                            followUp.notes
                          }
                        </p>
                      </div>
                    )}

                    {/* SCHEDULED BY */}

                    {(
                      followUp.scheduledBy
                        ?.name ||
                      followUp.createdBy
                        ?.name ||
                      followUp.scheduledByName
                    ) && (
                      <p className="mt-3 text-xs text-slate-400">
                        Scheduled by{" "}
                        <span className="font-medium text-slate-600">
                          {followUp
                            .scheduledBy
                            ?.name ||
                            followUp
                              .createdBy
                              ?.name ||
                            followUp.scheduledByName}
                        </span>
                      </p>
                    )}

                    {/* ACTIONS */}

                    {status ===
                      "PENDING" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <button
                          type="button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            handleStatusUpdate(
                              followUp.id,
                              "DONE"
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <CheckCircle2
                            size={15}
                          />
                          Mark Done
                        </button>

                        <button
                          type="button"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            handleStatusUpdate(
                              followUp.id,
                              "MISSED"
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <XCircle
                            size={15}
                          />
                          Mark Missed
                        </button>
                      </div>
                    )}

                    {isUpdating && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />
                        Updating...
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>
        )}
    </Card>
  );
};

export default FollowUpHistory;