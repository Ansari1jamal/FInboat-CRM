import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  PhoneCall,
  Plus,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

import CallHistory from "./CallHistory";

const Calls = () => {
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
        title="Calls"
        description="Manage lead call activity."
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
                    `/calls/log?leadId=${leadId}`
                  )
                }
              >
                <Plus size={18} />
                Log Call
              </Button>
            )}
          </div>
        }
      />

      {leadId ? (
        <CallHistory
          leadId={leadId}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <PhoneCall
            size={28}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            Select a Lead
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Open calls from a lead to view
            and log its call history.
          </p>
        </div>
      )}
    </div>
  );
};

export default Calls;