import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CheckCircle2,
  FileText,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import Card from "../../components/common/Card";
import Badge from "../../components/common/Badge";
import Button from "../../components/common/Button";

import {
  getLeadDocumentsApi,
  verifyDocumentApi,
  rejectDocumentApi,
} from "../../services/documents.api";

const DocumentList = ({
  leadId,
}) => {
  const [documents, setDocuments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [updatingId, setUpdatingId] =
    useState("");

  const [error, setError] =
    useState("");

  // ======================================
  // FETCH DOCUMENTS
  // ======================================

  const fetchDocuments =
    useCallback(async () => {
      if (!leadId) {
        setDocuments([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response =
          await getLeadDocumentsApi(
            leadId
          );

        const list =
          Array.isArray(
            response?.data
          )
            ? response.data
            : [];

        setDocuments(list);
      } catch (err) {
        setError(
          err?.response?.data
            ?.message ||
            "Unable to load documents."
        );
      } finally {
        setLoading(false);
      }
    }, [leadId]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // ======================================
  // VERIFY
  // ======================================

  const handleVerify = async (
    documentId
  ) => {
    try {
      setUpdatingId(
        documentId
      );

      setError("");

      await verifyDocumentApi(
        documentId
      );

      await fetchDocuments();
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to verify document."
      );
    } finally {
      setUpdatingId("");
    }
  };

  // ======================================
  // REJECT
  // ======================================

  const handleReject = async (
    documentId
  ) => {
    const reason =
      window.prompt(
        "Enter rejection reason:"
      );

    if (!reason?.trim()) {
      return;
    }

    try {
      setUpdatingId(
        documentId
      );

      setError("");

      await rejectDocumentApi(
        documentId,
        {
          reason:
            reason.trim(),
        }
      );

      await fetchDocuments();
    } catch (err) {
      setError(
        err?.response?.data
          ?.message ||
          "Unable to reject document."
      );
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <Card
      title="Documents"
      description="KYC and loan documents uploaded for this lead."
    >
      {/* ERROR */}

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">
            {error}
          </p>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-slate-500">
          <RefreshCw
            size={16}
            className="animate-spin"
          />
          Loading documents...
        </div>
      )}

      {/* EMPTY */}

      {!loading &&
        documents.length === 0 && (
          <div className="rounded-xl bg-slate-50 p-8 text-center">
            <FileText
              size={28}
              className="mx-auto text-slate-400"
            />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No documents uploaded
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Upload KYC or loan documents
              for this lead.
            </p>
          </div>
        )}

      {/* DOCUMENTS */}

      {!loading &&
        documents.length > 0 && (
          <div className="space-y-4">
            {documents.map(
              (document, index) => {
                const status =
                  document.status ||
                  "PENDING";

                const isUpdating =
                  updatingId ===
                  document.id;

                return (
                  <div
                    key={
                      document.id ||
                      index
                    }
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      {/* LEFT */}

                      <div className="flex gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                          <FileText
                            size={20}
                            className="text-slate-600"
                          />
                        </div>

                        <div>
                          <p className="text-sm font-semibold text-slate-800">
                            {document.docType ||
                              document.documentType ||
                              "Document"}
                          </p>

                          <p className="mt-1 text-xs text-slate-400">
                            {document.fileName ||
                              document.originalName ||
                              "Uploaded document"}
                          </p>

                          {document.createdAt && (
                            <p className="mt-1 text-xs text-slate-400">
                              Uploaded{" "}
                              {new Date(
                                document.createdAt
                              ).toLocaleString(
                                "en-IN"
                              )}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* STATUS */}

                      <Badge
                        status={status}
                      />
                    </div>

                    {/* APPLICATION */}

                    {document.applicationId && (
                      <div className="mt-4 rounded-lg bg-slate-50 p-3">
                        <p className="text-xs text-slate-400">
                          Application
                        </p>

                        <p className="mt-1 text-sm font-medium text-slate-700">
                          {
                            document.applicationId
                          }
                        </p>
                      </div>
                    )}

                    {/* VERIFICATION INFO */}

                    {document.verifiedAt && (
                      <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
                        <ShieldCheck
                          size={15}
                        />

                        Verified on{" "}
                        {new Date(
                          document.verifiedAt
                        ).toLocaleString(
                          "en-IN"
                        )}
                      </div>
                    )}

                    {/* ACTIONS */}

                    {status ===
                      "RECEIVED" && (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          size="sm"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            handleVerify(
                              document.id
                            )
                          }
                        >
                          <CheckCircle2
                            size={15}
                          />
                          Verify
                        </Button>

                        <Button
                          size="sm"
                          variant="secondary"
                          disabled={
                            isUpdating
                          }
                          onClick={() =>
                            handleReject(
                              document.id
                            )
                          }
                        >
                          <XCircle
                            size={15}
                          />
                          Reject
                        </Button>
                      </div>
                    )}

                    {isUpdating && (
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                        <RefreshCw
                          size={14}
                          className="animate-spin"
                        />
                        Updating document...
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

export default DocumentList;