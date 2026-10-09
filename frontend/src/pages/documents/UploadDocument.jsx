import {
  useState,
} from "react";

import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import {
  ArrowLeft,
  FileUp,
  UploadCloud,
} from "lucide-react";

import PageHeader from "../../components/common/PageHeader";
import Card from "../../components/common/Card";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";

import {
  uploadLeadDocumentApi,
} from "../../services/documents.api";

import {
  DOCUMENT_TYPE_OPTIONS,
} from "./document.constants";

const UploadDocument = () => {
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

  const [documentType, setDocumentType] =
    useState("");

  const [file, setFile] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [errors, setErrors] =
    useState({});

  // ======================================
  // FILE CHANGE
  // ======================================

  const handleFileChange = (
    event
  ) => {
    const selectedFile =
      event.target.files?.[0];

    setFile(
      selectedFile || null
    );

    setErrors(
      (previous) => ({
        ...previous,
        file: "",
      })
    );

    setError("");
  };

  // ======================================
  // VALIDATE
  // ======================================

  const validate = () => {
    const nextErrors = {};

    if (!leadId) {
      nextErrors.leadId =
        "Lead is required.";
    }

    if (!documentType) {
      nextErrors.documentType =
        "Document type is required.";
    }

    if (!file) {
      nextErrors.file =
        "Please select a document.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  // ======================================
  // SUBMIT
  // ======================================

  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      setSaving(true);
      setError("");

      await uploadLeadDocumentApi(
        leadId,
        {
          file,
          documentType,
          applicationId,
        }
      );

      navigate(
        `/documents?leadId=${leadId}`
      );
    } catch (err) {
      const data =
        err?.response?.data;

      setError(
        data?.message ||
          "Unable to upload document."
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Upload Document"
        description="Upload a KYC or loan document for this lead."
        actions={
          <Button
            variant="secondary"
            onClick={() =>
              navigate(
                leadId
                  ? `/documents?leadId=${leadId}`
                  : "/documents"
              )
            }
          >
            <ArrowLeft size={18} />
            Back
          </Button>
        }
      />

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <Card
          title="Document Information"
          description="Select the document type and upload the customer's file."
        >
          <div className="space-y-6">
            {/* DOCUMENT TYPE */}

            <Select
              label="Document Type"
              name="documentType"
              value={documentType}
              onChange={(event) =>
                setDocumentType(
                  event.target.value
                )
              }
              error={
                errors.documentType
              }
              required
              options={[
                {
                  value: "",
                  label:
                    "Select document type",
                },
                ...DOCUMENT_TYPE_OPTIONS,
              ]}
            />

            {/* FILE */}

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Document
                <span className="ml-1 text-red-500">
                  *
                </span>
              </label>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center transition hover:border-slate-400 hover:bg-slate-100">
                <UploadCloud
                  size={32}
                  className="text-slate-400"
                />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  {file
                    ? file.name
                    : "Choose a document"}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  PDF, JPG, JPEG or PNG
                </p>

                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={
                    handleFileChange
                  }
                />
              </label>

              {errors.file && (
                <p className="mt-2 text-xs text-red-600">
                  {errors.file}
                </p>
              )}
            </div>

            {/* APPLICATION */}

            {applicationId && (
              <div className="rounded-xl bg-slate-50 p-4">
                <p className="text-xs text-slate-400">
                  Linked Application
                </p>

                <p className="mt-1 text-sm font-medium text-slate-700">
                  {applicationId}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* ACTIONS */}

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={() =>
              navigate(
                leadId
                  ? `/documents?leadId=${leadId}`
                  : "/documents"
              )
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={saving}
          >
            <FileUp size={17} />
            Upload Document
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UploadDocument;