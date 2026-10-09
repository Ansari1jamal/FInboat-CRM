import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  CalendarClock,
  Plus,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

import FollowUpHistory from "./FollowUpHistory";

const FollowUps = () => {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const leadId =
    searchParams.get("leadId");

  return (
    <div className="space-y-6">
      <PageHeader
        title="Follow-ups"
        description="Manage scheduled customer follow-ups."
        actions={
          <div className="flex flex-wrap gap-2">
            {leadId && (
              <Button
                variant="secondary"
                onClick={() =>
                  navigate(
                    `/leads/${leadId}`
                  )
                }
              >
                <ArrowLeft
                  size={18}
                />
                Back to Lead
              </Button>
            )}

            {leadId && (
              <Button
                onClick={() =>
                  navigate(
                    `/followups/create?leadId=${leadId}`
                  )
                }
              >
                <Plus size={18} />
                New Follow-up
              </Button>
            )}
          </div>
        }
      />

      {leadId ? (
        <FollowUpHistory
          leadId={leadId}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <CalendarClock
            size={28}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            Select a Lead
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Open follow-ups from a lead to
            manage its follow-up history.
          </p>
        </div>
      )}
    </div>
  );
};

export default FollowUps;