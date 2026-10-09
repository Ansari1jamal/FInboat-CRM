import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  FileUp,
  Plus,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";

import DocumentList from "./DocumentList";

const Documents = () => {
  const navigate =
    useNavigate();

  const [
    searchParams,
  ] = useSearchParams();

  const leadId =
    searchParams.get("leadId");

  const applicationId =
    searchParams.get(
      "applicationId"
    );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Documents"
        description="Manage KYC and loan documents."
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
                    `/documents/upload?leadId=${leadId}${
                      applicationId
                        ? `&applicationId=${applicationId}`
                        : ""
                    }`
                  )
                }
              >
                <FileUp size={17} />
                Upload Document
              </Button>
            )}
          </div>
        }
      />

      {leadId ? (
        <DocumentList
          leadId={leadId}
        />
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center">
          <Plus
            size={28}
            className="mx-auto text-slate-400"
          />

          <h2 className="mt-3 text-lg font-semibold text-slate-900">
            Select a Lead
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Open documents from a lead to
            manage KYC files.
          </p>
        </div>
      )}
    </div>
  );
};

export default Documents;