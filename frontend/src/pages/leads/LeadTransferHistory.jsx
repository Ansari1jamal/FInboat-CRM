import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  ArrowRight,
  RefreshCw,
} from "lucide-react";

import Card from "../../components/common/Card";

import {
  getLeadTransfersApi,
} from "../../services/lead.api";

const LeadTransferHistory = ({
  leadId,
}) => {
  const [transfers, setTransfers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const fetchTransfers =
    useCallback(async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await getLeadTransfersApi(
            leadId
          );

        setTransfers(
          response?.data?.transfers ||
            response?.data ||
            []
        );
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to load transfer history."
        );
      } finally {
        setLoading(false);
      }
    }, [leadId]);

  useEffect(() => {
    fetchTransfers();
  }, [fetchTransfers]);

  return (
    <Card
      title="Transfer History"
      description="Previous lead assignments"
    >
      {loading && (
        <div className="flex items-center gap-2 py-5 text-sm text-slate-500">
          <RefreshCw
            size={16}
            className="animate-spin"
          />
          Loading history...
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {!loading &&
        !error &&
        transfers.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-6 text-center">
            <p className="text-sm text-slate-500">
              No transfer history found.
            </p>
          </div>
        )}

      {!loading &&
        !error &&
        transfers.length > 0 && (
          <div className="space-y-4">
            {transfers.map(
              (transfer, index) => (
                <div
                  key={
                    transfer.id ||
                    index
                  }
                  className="rounded-xl border border-slate-200 p-4"
                >
                  {/* USERS */}

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex-1">
                      <p className="text-xs text-slate-400">
                        Previous Assignment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {transfer.fromUser
                          ?.name ||
                          transfer.fromUserName ||
                          "Unassigned"}
                      </p>

                      {transfer.fromTeam
                        ?.name && (
                        <p className="text-xs text-slate-500">
                          {
                            transfer
                              .fromTeam
                              .name
                          }
                        </p>
                      )}
                    </div>

                    <ArrowRight
                      size={18}
                      className="hidden text-slate-400 sm:block"
                    />

                    <div className="flex-1">
                      <p className="text-xs text-slate-400">
                        New Assignment
                      </p>

                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {transfer.toUser
                          ?.name ||
                          transfer.toUserName ||
                          "Unassigned"}
                      </p>

                      {transfer.toTeam
                        ?.name && (
                        <p className="text-xs text-slate-500">
                          {
                            transfer
                              .toTeam
                              .name
                          }
                        </p>
                      )}
                    </div>
                  </div>

                  {/* META */}

                  <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 text-xs text-slate-400 sm:flex-row sm:justify-between">
                    <span>
                      {transfer.changedBy
                        ?.name ||
                        transfer.changedByName ||
                        "System"}
                    </span>

                    <span>
                      {transfer.createdAt
                        ? new Date(
                            transfer.createdAt
                          ).toLocaleString(
                            "en-IN"
                          )
                        : "-"}
                    </span>
                  </div>
                </div>
              )
            )}
          </div>
        )}
    </Card>
  );
};

export default LeadTransferHistory;