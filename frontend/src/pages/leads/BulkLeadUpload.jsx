import { useEffect, useState } from "react";
import { ArrowLeft, Download, FileSpreadsheet, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";
import { getUsersApi } from "../../services/users.api";
import {
  getLeadImportStatusApi,
  importLeadsApi,
} from "../../services/lead.api";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = [".csv", ".xls", ".xlsx"];

const templateContent = [
  "customerName,mobile,loanType,loanAmount,source,status",
  "Rahul Kumar,9876543210,PERSONAL,500000,Website,NEW",
].join("\n");

const getErrorMessage = (error, fallback) => {
  if (error?.code === "ECONNABORTED") {
    return "The request timed out. Check your connection and make sure the backend services are running, then try again.";
  }

  return error?.response?.data?.message || fallback;
};

export default function BulkLeadUpload() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [file, setFile] = useState(null);
  const [assignedToId, setAssignedToId] = useState("");
  const [telecallers, setTelecallers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [job, setJob] = useState(null);

  const requiresAssignee = user?.role !== "ADMIN";

  useEffect(() => {
    let active = true;

    const loadTelecallers = async () => {
      setUsersLoading(true);
      setUsersError("");

      try {
        const response = await getUsersApi({
          role: "TELECALLER",
          isActive: true,
          limit: 100,
        });
        const data = response?.data?.items || response?.data || [];

        if (active) {
          setTelecallers(Array.isArray(data) ? data : []);
        }
      } catch (loadError) {
        if (active) {
          setUsersError(
            getErrorMessage(loadError, "Unable to load active telecallers.")
          );
        }
      } finally {
        if (active) {
          setUsersLoading(false);
        }
      }
    };

    loadTelecallers();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!job?.id || ["completed", "failed"].includes(job.state)) {
      return undefined;
    }

    let active = true;
    let timer;

    const pollStatus = async () => {
      try {
        const response = await getLeadImportStatusApi(job.id);
        const status = response?.data;

        if (!active || !status) {
          return;
        }

        setError("");
        setJob(status);

        if (!["completed", "failed"].includes(status.state)) {
          timer = window.setTimeout(pollStatus, 2000);
        }
      } catch (pollError) {
        if (active) {
          setError(
            getErrorMessage(pollError, "Unable to check import progress.")
          );
          timer = window.setTimeout(pollStatus, 3000);
        }
      }
    };

    timer = window.setTimeout(pollStatus, 1200);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [job?.id, job?.state]);

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0] || null;
    setError("");
    setJob(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const extension = `.${selectedFile.name.split(".").pop().toLowerCase()}`;
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setFile(null);
      setError("Choose a CSV, XLS, or XLSX file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setError("File size must be 10 MB or less.");
      event.target.value = "";
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setError("");

    if (!file) {
      setError("Choose a CSV, XLS, or XLSX file first.");
      return;
    }

    if (requiresAssignee && !assignedToId) {
      setError("Select a telecaller to assign the imported leads to.");
      return;
    }

    try {
      setUploading(true);
      const response = await importLeadsApi(file, assignedToId);
      const data = response?.data;

      if (!data?.jobId) {
        throw new Error("Import was accepted but no tracking ID was returned.");
      }

      setJob({
        id: data.jobId,
        fileName: data.fileName || file.name,
        state: "waiting",
        progress: 0,
        result: null,
      });
    } catch (uploadError) {
      setError(
        getErrorMessage(uploadError, uploadError.message || "Unable to upload leads.")
      );
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const blob = new Blob([templateContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "finboat-leads-template.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  };

  const isProcessing = job && !["completed", "failed"].includes(job.state);
  const importResult = job?.result;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Bulk Lead Upload"
        description="Import multiple leads using a CSV or Excel spreadsheet."
        actions={
          <Button variant="secondary" onClick={() => navigate("/leads")}>
            <ArrowLeft size={18} />
            Back to Leads
          </Button>
        }
      />

      <Card
        title="Spreadsheet requirements"
        description="Required columns: customerName, mobile, loanType, and loanAmount. Optional columns: source and status."
        actions={
          <Button variant="secondary" onClick={downloadTemplate}>
            <Download size={17} />
            Download CSV Template
          </Button>
        }
      >
        <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
          <li>Accepted formats: CSV, XLS, and XLSX; maximum file size is 10 MB.</li>
          <li>Mobile numbers must contain 10 digits. Existing numbers are reported as duplicates.</li>
          <li>Up to 5,000 non-empty lead rows can be imported per file.</li>
          <li>Rows with invalid data are skipped and listed in the import result.</li>
        </ul>
      </Card>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <Card title="Select file">
        <form onSubmit={handleUpload} className="space-y-5">
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-100">
            {file ? (
              <FileSpreadsheet size={34} className="text-emerald-600" />
            ) : (
              <UploadCloud size={34} className="text-slate-400" />
            )}
            <span className="mt-3 text-sm font-semibold text-slate-800">
              {file ? file.name : "Choose a CSV or Excel file"}
            </span>
            <span className="mt-1 text-xs text-slate-500">
              {file
                ? `${(file.size / 1024).toFixed(1)} KB`
                : "Click to browse · CSV, XLS, XLSX · Max 10 MB"}
            </span>
            <input
              type="file"
              accept=".csv,.xls,.xlsx"
              className="sr-only"
              onChange={handleFileChange}
              disabled={uploading || isProcessing}
            />
          </label>

          {requiresAssignee && (
            <div>
              <label htmlFor="bulk-assignee" className="mb-1 block text-sm font-medium text-slate-700">
                Assign imported leads to
              </label>
              <select
                id="bulk-assignee"
                value={assignedToId}
                onChange={(event) => setAssignedToId(event.target.value)}
                disabled={usersLoading || uploading || isProcessing}
                className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm"
              >
                <option value="">
                  {usersLoading ? "Loading telecallers..." : "Select telecaller"}
                </option>
                {telecallers.map((telecaller) => (
                  <option key={telecaller.id} value={telecaller.id}>
                    {telecaller.name}
                  </option>
                ))}
              </select>
              {usersError && (
                <p role="alert" className="mt-1 text-xs text-red-600">
                  {usersError}
                </p>
              )}
              {!usersLoading && !usersError && telecallers.length === 0 && (
                <p className="mt-1 text-xs text-amber-700">
                  No active telecallers are available for assignment.
                </p>
              )}
            </div>
          )}

          <Button
            type="submit"
            loading={uploading}
            disabled={!file || Boolean(isProcessing) || (requiresAssignee && telecallers.length === 0)}
          >
            <UploadCloud size={18} />
            Upload Leads
          </Button>
        </form>
      </Card>

      {job && (
        <Card
          title="Import progress"
          description={job.fileName}
        >
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium capitalize text-slate-700">
                {job.state === "waiting" ? "Queued" : job.state}
              </span>
              <span className="text-slate-500">{Number(job.progress) || 0}%</span>
            </div>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-100"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Number(job.progress) || 0}
            >
              <div
                className="h-full rounded-full bg-emerald-600 transition-all"
                style={{ width: `${Math.max(0, Math.min(Number(job.progress) || 0, 100))}%` }}
              />
            </div>

            {job.state === "failed" && (
              <p role="alert" className="text-sm text-red-600">
                {job.failedReason || "Import failed. Check the file and try again."}
              </p>
            )}

            {importResult && (
              <div className="grid gap-3 pt-2 text-sm sm:grid-cols-4">
                <p>Rows: <strong>{importResult.totalRows}</strong></p>
                <p className="text-emerald-700">Imported: <strong>{importResult.imported}</strong></p>
                <p className="text-amber-700">Duplicates: <strong>{importResult.duplicates}</strong></p>
                <p className="text-red-700">Skipped: <strong>{importResult.failed}</strong></p>
              </div>
            )}

            {importResult?.errors?.length > 0 && (
              <div className="max-h-52 overflow-auto rounded-lg border border-amber-200 bg-amber-50 p-3">
                <h3 className="mb-2 text-sm font-semibold text-amber-900">Rows needing attention</h3>
                <ul className="space-y-1 text-xs text-amber-900">
                  {importResult.errors.map((rowError) => (
                    <li key={`${rowError.row}-${rowError.message}`}>
                      Row {rowError.row}: {rowError.message}
                    </li>
                  ))}
                </ul>
                {importResult.errorsTruncated && (
                  <p className="mt-2 text-xs text-amber-800">
                    Only the first 100 row errors are shown.
                  </p>
                )}
              </div>
            )}

            {job.state === "completed" && (
              <Button variant="secondary" onClick={() => navigate("/leads")}>
                View Leads
              </Button>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
